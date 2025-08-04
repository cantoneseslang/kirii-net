# ⚡ クイック復旧ガイド

## 🌐 GitHubリポジトリ
**https://github.com/cantoneseslang/kirii-net**

## 🚨 一撃復旧コマンド

### ローカルから復元
```bash
bash FORCE_RESTORE.sh
```

### GitHubから復元
```bash
bash GITHUB_RESTORE.sh
```

## 📱 ワンクリック復旧リンク

### GitHub上の重要ファイル
- 📧 [メインアプリ](https://github.com/cantoneseslang/kirii-net/blob/main/webmail-client/email-app.tsx)
- 🔧 [復元スクリプト](https://github.com/cantoneseslang/kirii-net/blob/main/webmail-client/FORCE_RESTORE.sh)
- 🔒 [バックアップフォルダ](https://github.com/cantoneseslang/kirii-net/tree/main/webmail-client/IMMUTABLE_BACKUP)

### 手動ダウンロード（最終手段）
1. https://github.com/cantoneseslang/kirii-net/archive/refs/heads/main.zip
2. ZIPを解凍 → webmail-client フォルダを使用
3. `npm install && npm run dev-full`

## ✅ 正常動作確認
- http://localhost:3000 → HTTP 200 OK
- email-app.tsx → 1617行
- ブランディング → "Kmail"

---
**🔖 このファイルをブックマーク**: https://github.com/cantoneseslang/kirii-net/blob/main/webmail-client/QUICK_RECOVERY.md