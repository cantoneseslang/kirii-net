#!/bin/bash

# 🚨 緊急復旧スクリプト - EMERGENCY RESET SYSTEM
# 記憶喪失対応：このスクリプト1つで完全復旧

echo "🚨 緊急復旧システム開始..."

# STEP 1: 全プロセス強制終了
echo "⏹️  全プロセス強制終了中..."
pkill -f "npm" 2>/dev/null || true
pkill -f "node" 2>/dev/null || true  
pkill -f "electron" 2>/dev/null || true
pkill -f "concurrently" 2>/dev/null || true

# ポート解放
echo "🔓 ポート解放中..."
lsof -ti:3000,3001,3002,3003,3004,3005 | xargs kill -9 2>/dev/null || true

# 少し待機
sleep 3

# STEP 2: Git完全リセット
echo "🔄 Git完全リセット中..."
git stash 2>/dev/null || true
git reset --hard HEAD
git clean -fd

# STEP 3: 依存関係クリーンアップ（必要時のみ）
if [ "$1" = "--clean" ]; then
    echo "🧹 依存関係クリーンアップ中..."
    rm -rf node_modules package-lock.json
    npm install
fi

# STEP 4: 正常性確認
echo "🔍 正常性確認中..."

# ファイル存在確認
if [ ! -f "email-app.tsx" ]; then
    echo "❌ email-app.tsx が見つかりません！"
    exit 1
fi

if [ ! -f "app/page.tsx" ]; then
    echo "❌ app/page.tsx が見つかりません！"
    exit 1
fi

if [ ! -f "electron/main.js" ]; then
    echo "❌ electron/main.js が見つかりません！"
    exit 1
fi

# 行数確認
EMAIL_LINES=$(wc -l < email-app.tsx)
if [ "$EMAIL_LINES" -lt 1500 ]; then
    echo "⚠️  警告: email-app.tsx の行数が少なすぎます ($EMAIL_LINES行)"
fi

# ブランディング確認
if ! grep -q "Kmail" email-app.tsx; then
    echo "⚠️  警告: Kmailブランディングが見つかりません"
fi

echo "✅ ファイル確認完了"

# STEP 5: アプリケーション起動
echo "🚀 アプリケーション起動中..."
npm run dev-full &

# 起動確認
echo "⏳ 起動確認中（10秒待機）..."
sleep 10

# Next.js確認
if curl -s -I http://localhost:3000 | grep -q "200 OK"; then
    echo "✅ Next.js正常起動 (http://localhost:3000)"
else
    echo "❌ Next.js起動失敗"
    exit 1
fi

# Electron確認
if pgrep -f "electron" > /dev/null; then
    echo "✅ Electron正常起動"
else
    echo "❌ Electron起動失敗"
    exit 1
fi

echo ""
echo "🎉 緊急復旧完了！"
echo "📊 現在の状態:"
echo "   - Next.js: http://localhost:3000 (正常)"
echo "   - Electron: 起動済み"
echo "   - email-app.tsx: $EMAIL_LINES行"
echo ""
echo "🌐 ブラウザで確認: http://localhost:3000"
echo "💻 Electronアプリも自動起動されています"
echo ""
echo "⚠️  今後は変更前に必ずユーザーに確認を取ること！"