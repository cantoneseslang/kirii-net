# 🌐 GitHub緊急復旧リンク集

## 📍 GitHubリポジトリ

**メインリポジトリ**: https://github.com/cantoneseslang/kirii-net

## 🔗 重要なファイル直接リンク

### 📧 メインアプリケーション
- [email-app.tsx](https://github.com/cantoneseslang/kirii-net/blob/main/webmail-client/email-app.tsx) - メインメールアプリ（1617行）
- [app/page.tsx](https://github.com/cantoneseslang/kirii-net/blob/main/webmail-client/app/page.tsx) - Next.jsルートページ

### ⚡ Electronアプリ
- [electron/main.js](https://github.com/cantoneseslang/kirii-net/blob/main/webmail-client/electron/main.js) - Electronメインプロセス
- [electron/index.html](https://github.com/cantoneseslang/kirii-net/blob/main/webmail-client/electron/index.html) - ElectronUI定義

### 🔧 設定ファイル
- [package.json](https://github.com/cantoneseslang/kirii-net/blob/main/webmail-client/package.json) - 依存関係・スクリプト

### 🔒 バックアップシステム
- [IMMUTABLE_BACKUP/](https://github.com/cantoneseslang/kirii-net/tree/main/webmail-client/IMMUTABLE_BACKUP) - 変更不可能バックアップ
- [FORCE_RESTORE.sh](https://github.com/cantoneseslang/kirii-net/blob/main/webmail-client/FORCE_RESTORE.sh) - ローカル強制復元
- [GITHUB_RESTORE.sh](https://github.com/cantoneseslang/kirii-net/blob/main/webmail-client/GITHUB_RESTORE.sh) - GitHub強制復元

## 🚨 緊急復旧手順

### 方法1: ローカルバックアップから復元
```bash
bash FORCE_RESTORE.sh
```

### 方法2: GitHubから完全復元
```bash
bash GITHUB_RESTORE.sh
```

### 方法3: 手動GitHub復元
```bash
git fetch origin main
git reset --hard origin/main
npm install
npm run dev-full
```

## 📋 現在の正常状態（保存日時: 2025-08-04 18:30 JST）

- **email-app.tsx**: 1617行（高機能Gmail風アプリ）
- **ブランディング**: Kmail（正しい）
- **起動方法**: `npm run dev-full`
- **URL**: http://localhost:3000
- **Electron**: 自動起動

## 🔍 状態確認コマンド

```bash
# ファイル確認
wc -l email-app.tsx                    # → 1617行
grep "Kmail" email-app.tsx             # → 見つかる

# 動作確認
curl -I http://localhost:3000          # → HTTP 200 OK
ps aux | grep electron | grep -v grep  # → プロセス確認
```

## 📞 緊急時クイックアクセス

**このファイルのGitHubリンク**: https://github.com/cantoneseslang/kirii-net/blob/main/webmail-client/GITHUB_LINKS.md

**プロジェクト全体**: https://github.com/cantoneseslang/kirii-net/tree/main/webmail-client

---
**⚠️ 重要**: このリンク集をブックマークしておけば、いつでも即座に復旧可能です