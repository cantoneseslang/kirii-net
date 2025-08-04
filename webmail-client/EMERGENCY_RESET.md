# 🚨 緊急復旧システム - EMERGENCY RESET SYSTEM

## ⚡ 一撃復旧コマンド（記憶喪失対応）

```bash
# 完全復旧（このコマンド1つで全て解決）
bash emergency_reset.sh
```

## 🔧 手動復旧手順（自動化失敗時）

### STEP 1: 全プロセス強制終了
```bash
pkill -f "npm\|node\|electron\|concurrently"
lsof -ti:3000,3001,3002,3003,3004,3005 | xargs kill -9 2>/dev/null || true
```

### STEP 2: Git完全リセット
```bash
git stash
git reset --hard HEAD
git clean -fd
```

### STEP 3: 依存関係クリーンアップ
```bash
rm -rf node_modules package-lock.json
npm install
```

### STEP 4: アプリケーション起動
```bash
npm run dev-full
```

## 📋 現在の正常状態確認

### ✅ 正常動作の証拠
- Next.js: `curl -I http://localhost:3000` → HTTP 200 OK
- Electron: 複数のレンダラープロセスが動作
- メールアプリ: Kmailブランディング、1617行の高機能版
- WhatsApp: 正常表示、ズーム機能動作

### ✅ 重要ファイル構成
```
webmail-client/
├── app/page.tsx          # Next.jsルートページ
├── email-app.tsx         # メインアプリ（1617行）
├── electron/
│   ├── main.js          # Electronメイン
│   └── index.html       # UI定義
└── package.json         # 依存関係
```

### ✅ 正常起動確認コマンド
```bash
# プロセス確認
ps aux | grep -E "(next-server|electron)" | grep -v grep

# ポート確認  
curl -I http://localhost:3000

# ファイル確認
wc -l email-app.tsx  # 1617行であること
grep "Kmail" email-app.tsx  # ブランディング確認
```

## 🚫 絶対禁止事項

### ❌ 触ってはいけないファイル
- `email-app.tsx` - メインアプリケーション
- `electron/main.js` - Electronメイン
- `electron/index.html` - UI定義
- `app/page.tsx` - ルートページ

### ❌ 禁止行為
- UIの変更（ユーザー承認なし）
- 新コンポーネント作成
- ブランディング変更
- レイアウト変更（縦並び固定）

## 📞 緊急時の質問テンプレート

**問題発生時は必ずこれを聞く：**

1. "現在のNext.jsサーバーの状態は？ `curl -I http://localhost:3000`"
2. "Electronプロセスは動作していますか？ `ps aux | grep electron`"
3. "email-app.tsxの行数は？ `wc -l email-app.tsx`"
4. "Kmailブランディングは正しいですか？ `grep Kmail email-app.tsx`"

## 🔄 定期バックアップ

このファイルを更新した日時: $(date)
最後の正常動作確認: 2025-08-04 18:30 JST

---
**⚠️ 重要**: このファイルを絶対に削除・変更しないこと