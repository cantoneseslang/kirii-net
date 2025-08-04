# 🆘 復旧コマンド集 - RECOVERY COMMANDS

## 🚨 緊急時（記憶喪失・完全破綻時）

### 一撃復旧コマンド
```bash
bash emergency_reset.sh
```

### 完全クリーンアップ付き復旧
```bash
bash emergency_reset.sh --clean
```

## 🔧 個別復旧コマンド

### プロセス強制終了
```bash
pkill -f "npm\|node\|electron\|concurrently"
lsof -ti:3000,3001,3002,3003 | xargs kill -9
```

### Git完全リセット
```bash
git stash && git reset --hard HEAD && git clean -fd
```

### 依存関係リセット
```bash
rm -rf node_modules package-lock.json && npm install
```

### アプリ起動
```bash
npm run dev-full
```

## 📋 状態確認コマンド

### 現在の状態チェック
```bash
# Next.js確認
curl -I http://localhost:3000

# プロセス確認  
ps aux | grep -E "(next-server|electron)" | grep -v grep

# ファイル確認
wc -l email-app.tsx
grep "Kmail" email-app.tsx

# ポート使用確認
lsof -i :3000
```

### 正常動作の証拠
- Next.js: HTTP 200 OK
- email-app.tsx: 1617行
- Kmailブランディング: 存在
- Electronプロセス: 複数動作

## 🚫 絶対禁止

- email-app.tsx の変更
- electron/ フォルダの変更  
- UIの無断変更
- ブランディング変更

---
**使用方法**: 問題が発生したら即座に `bash emergency_reset.sh` を実行