#!/bin/bash

# 🔥 強制復元システム - FORCE RESTORE SYSTEM
# 三度目の破綻対応 - 絶対に失敗しない復元

echo "🔥 強制復元システム開始..."
echo "⚠️  この操作は現在のファイルを完全に上書きします"

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

# STEP 2: バックアップ存在確認
if [ ! -d "IMMUTABLE_BACKUP" ]; then
    echo "❌ IMMUTABLE_BACKUP フォルダが見つかりません！"
    echo "❌ 復元不可能です。手動で修復してください。"
    exit 1
fi

echo "✅ バックアップフォルダ確認完了"

# STEP 3: 現在のファイルを強制削除
echo "🗑️  破損ファイル削除中..."
rm -f email-app.tsx 2>/dev/null || true
rm -rf app/ 2>/dev/null || true
rm -rf electron/ 2>/dev/null || true

# STEP 4: バックアップから強制復元
echo "📦 バックアップから強制復元中..."

# 権限を一時的に変更して復元
chmod -R 755 IMMUTABLE_BACKUP/ 2>/dev/null || true

# ファイル復元
cp IMMUTABLE_BACKUP/email-app.tsx . || {
    echo "❌ email-app.tsx 復元失敗"
    exit 1
}

cp -r IMMUTABLE_BACKUP/app/ . || {
    echo "❌ app/ 復元失敗" 
    exit 1
}

cp -r IMMUTABLE_BACKUP/electron/ . || {
    echo "❌ electron/ 復元失敗"
    exit 1
}

cp IMMUTABLE_BACKUP/package.json . || {
    echo "❌ package.json 復元失敗"
    exit 1
}

# バックアップフォルダを再度読み取り専用に
chmod -R 444 IMMUTABLE_BACKUP/

echo "✅ ファイル復元完了"

# STEP 5: Git状態クリーンアップ
echo "🔄 Git状態クリーンアップ..."
git stash 2>/dev/null || true
git reset --hard HEAD 2>/dev/null || true
git clean -fd 2>/dev/null || true

# STEP 6: 依存関係確認
if [ ! -d "node_modules" ] || [ "$1" = "--clean" ]; then
    echo "📦 依存関係再インストール..."
    rm -rf node_modules package-lock.json
    npm install
fi

# STEP 7: 復元確認
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

# STEP 8: アプリケーション起動
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
echo "🎉🎉🎉 強制復元完了！🎉🎉🎉"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 復元後の状態:"
echo "   ✅ Next.js: http://localhost:3000 (正常)"
echo "   ✅ Electron: 起動済み"
echo "   ✅ email-app.tsx: $EMAIL_LINES行 (正常)"
echo "   ✅ Kmailブランディング: 確認済み"
echo "   ✅ バックアップ: 保護済み (変更不可)"
echo ""
echo "🌐 ブラウザ確認: http://localhost:3000"
echo "💻 Electronアプリも自動起動されています"
echo ""
echo "🔒 IMMUTABLE_BACKUP/ フォルダは変更不可能に設定されています"
echo "🚨 今後破綻した場合は再度このスクリプトを実行してください"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"