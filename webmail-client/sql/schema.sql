-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  access_token TEXT,
  refresh_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- フォルダテーブル
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('inbox', 'sent', 'drafts', 'trash', 'custom')) DEFAULT 'custom',
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- メールテーブル
CREATE TABLE IF NOT EXISTS emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  from_name TEXT NOT NULL,
  from_email TEXT NOT NULL,
  to_emails TEXT[] NOT NULL,
  cc_emails TEXT[] DEFAULT '{}',
  bcc_emails TEXT[] DEFAULT '{}',
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  html_body TEXT,
  message_id TEXT UNIQUE NOT NULL,
  thread_id TEXT,
  folder TEXT DEFAULT 'inbox',
  read BOOLEAN DEFAULT FALSE,
  starred BOOLEAN DEFAULT FALSE,
  important BOOLEAN DEFAULT FALSE,
  labels TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- メール添付ファイルテーブル
CREATE TABLE IF NOT EXISTS email_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID REFERENCES emails(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  content_id TEXT,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ファイルアップロード管理テーブル
CREATE TABLE IF NOT EXISTS file_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  public_url TEXT NOT NULL,
  is_large_file BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_emails_user_id ON emails(user_id);
CREATE INDEX IF NOT EXISTS idx_emails_message_id ON emails(message_id);
CREATE INDEX IF NOT EXISTS idx_emails_thread_id ON emails(thread_id);
CREATE INDEX IF NOT EXISTS idx_emails_folder ON emails(folder);
CREATE INDEX IF NOT EXISTS idx_emails_read ON emails(read);
CREATE INDEX IF NOT EXISTS idx_emails_starred ON emails(starred);
CREATE INDEX IF NOT EXISTS idx_email_attachments_email_id ON email_attachments(email_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_user_email ON file_uploads(user_email);
CREATE INDEX IF NOT EXISTS idx_file_uploads_expires_at ON file_uploads(expires_at);

-- Row Level Security (RLS) を有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- RLSポリシー作成
-- ユーザーは自分のデータのみアクセス可能
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view own folders" ON folders FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own folders" ON folders FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own folders" ON folders FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own folders" ON folders FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own emails" ON emails FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own emails" ON emails FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own emails" ON emails FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own emails" ON emails FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own attachments" ON email_attachments FOR SELECT USING (
  EXISTS (SELECT 1 FROM emails WHERE emails.id = email_attachments.email_id AND auth.uid()::text = emails.user_id::text)
);
CREATE POLICY "Users can insert own attachments" ON email_attachments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM emails WHERE emails.id = email_attachments.email_id AND auth.uid()::text = emails.user_id::text)
);
CREATE POLICY "Users can update own attachments" ON email_attachments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM emails WHERE emails.id = email_attachments.email_id AND auth.uid()::text = emails.user_id::text)
);
CREATE POLICY "Users can delete own attachments" ON email_attachments FOR DELETE USING (
  EXISTS (SELECT 1 FROM emails WHERE emails.id = email_attachments.email_id AND auth.uid()::text = emails.user_id::text)
);

CREATE POLICY "Users can view own file uploads" ON file_uploads FOR SELECT USING (user_email = auth.jwt() ->> 'email');
CREATE POLICY "Users can insert own file uploads" ON file_uploads FOR INSERT WITH CHECK (user_email = auth.jwt() ->> 'email');
CREATE POLICY "Users can update own file uploads" ON file_uploads FOR UPDATE USING (user_email = auth.jwt() ->> 'email');
CREATE POLICY "Users can delete own file uploads" ON file_uploads FOR DELETE USING (user_email = auth.jwt() ->> 'email');

-- デフォルトフォルダ作成関数
CREATE OR REPLACE FUNCTION create_default_folders_for_user(user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO folders (user_id, name, type) VALUES
    (user_id, '受信トレイ', 'inbox'),
    (user_id, '送信済み', 'sent'),
    (user_id, '下書き', 'drafts'),
    (user_id, 'ゴミ箱', 'trash');
END;
$$ LANGUAGE plpgsql;

-- 新規ユーザー登録時にデフォルトフォルダを作成するトリガー
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_default_folders_for_user(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 期限切れファイルの自動削除関数
CREATE OR REPLACE FUNCTION cleanup_expired_files()
RETURNS VOID AS $$
BEGIN
  DELETE FROM file_uploads WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- updated_at自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_atトリガー作成
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON folders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_emails_updated_at BEFORE UPDATE ON emails FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_file_uploads_updated_at BEFORE UPDATE ON file_uploads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 