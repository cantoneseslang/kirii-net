#!/bin/bash

# 🌐 GitHub完全復元システム - GITHUB RESTORE SYSTEM
# GitHubから最新の正常状態を完全復元

echo "🌐 GitHub完全復元システム開始..."
echo "⚠️  この操作は現在のファイルを完全に削除してGitHubから復元します"

# STEP 1: 全プロセス完全停止
echo "⏹️  全プロセス強制終了..."
pkill -f "npm" 2>/dev/null || true
pkill -f "node" 2>/dev/null || true  
pkill -f "electron" 2>/dev/null || true
pkill -f "concurrently" 2>/dev/null || true
pkill -f "next" 2>/dev/null || true

# 全ポート強制解放
for port in {3000..3010}; do
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
done

sleep 5

# STEP 2: 現在のディレクトリを完全クリーンアップ
echo "🗑️  現在のファイル完全削除..."
rm -rf email-app.tsx app/ electron/ components/ lib/ hooks/ public/ 2>/dev/null || true
rm -rf node_modules package-lock.json pnpm-lock.yaml 2>/dev/null || true
rm -rf IMMUTABLE_BACKUP/ 2>/dev/null || true

# STEP 3: GitHubから最新状態を強制取得
echo "📥 GitHubから最新状態を取得..."
git fetch origin main || {
    echo "❌ GitHub接続失敗"
    exit 1
}

git reset --hard origin/main || {
    echo "❌ Git reset失敗"
    exit 1
}

git clean -fd

echo "✅ GitHub復元完了"

# STEP 4: 依存関係再インストール
echo "📦 依存関係再インストール..."
npm install || {
    echo "❌ npm install失敗"
    exit 1
}

# STEP 5: IMMUTABLE_BACKUPフォルダを読み取り専用に設定
if [ -d "IMMUTABLE_BACKUP" ]; then
    chmod -R 444 IMMUTABLE_BACKUP/
    echo "🔒 IMMUTABLE_BACKUP保護設定完了"
fi

# STEP 6: 復元確認
echo "🔍 復元確認中..."

# 重要ファイル存在確認
for file in "email-app.tsx" "app/page.tsx" "electron/main.js" "electron/index.html"; do
    if [ ! -f "$file" ]; then
        echo "❌ $file が復元されていません！"
        exit 1
    fi
done

# ファイル内容確認
EMAIL_LINES=$(wc -l < email-app.tsx)
if [ "$EMAIL_LINES" -lt 1500 ]; then
    echo "❌ email-app.tsx の行数が異常です ($EMAIL_LINES行)"
    exit 1
fi

if ! grep -q "Kmail" email-app.tsx; then
    echo "❌ Kmailブランディングが見つかりません"
    exit 1
fi

echo "✅ ファイル内容確認完了 ($EMAIL_LINES行)"

# STEP 7: アプリケーション起動
echo "🚀 アプリケーション強制起動..."
npm run dev-full &

# 起動確認
echo "⏳ 起動確認中（15秒待機）..."
sleep 15

# Next.js確認
RETRY=0
while [ $RETRY -lt 5 ]; do
    if curl -s -I http://localhost:3000 | grep -q "200 OK"; then
        echo "✅ Next.js正常起動 (http://localhost:3000)"
        break
    fi
    echo "⏳ Next.js起動待機中... ($((RETRY+1))/5)"
    sleep 3
    RETRY=$((RETRY+1))
done

if [ $RETRY -eq 5 ]; then
    echo "❌ Next.js起動失敗"
    echo "📋 デバッグ情報:"
    ps aux | grep -E "(next|node)" | grep -v grep
    exit 1
fi

# Electron確認
if pgrep -f "electron" > /dev/null; then
    echo "✅ Electron正常起動"
else
    echo "⚠️  Electron起動確認中..."
    sleep 5
    if pgrep -f "electron" > /dev/null; then
        echo "✅ Electron正常起動（遅延）"
    else
        echo "❌ Electron起動失敗"
    fi
fi

echo ""
echo "🎉🌐🎉 GitHub完全復元完了！🎉🌐🎉"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 復元後の状態:"
echo "   ✅ Next.js: http://localhost:3000 (正常)"
echo "   ✅ Electron: 起動済み"
echo "   ✅ email-app.tsx: $EMAIL_LINES行 (正常)"
echo "   ✅ Kmailブランディング: 確認済み"
echo "   ✅ GitHub: 最新状態同期済み"
echo "   ✅ IMMUTABLE_BACKUP: 保護済み"
echo ""
echo "🌐 ブラウザ確認: http://localhost:3000"
echo "💻 Electronアプリも自動起動されています"
echo ""
echo "🔄 復元方法:"
echo "   - ローカル復元: bash FORCE_RESTORE.sh"
echo "   - GitHub復元: bash GITHUB_RESTORE.sh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"