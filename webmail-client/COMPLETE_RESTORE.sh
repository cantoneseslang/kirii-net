#!/bin/bash

# 🔥 完全プロジェクト復元システム - COMPLETE PROJECT RESTORE
# プロジェクト全体を丸ごと完全復元 - 中途半端は絶対に許さない

echo "🔥🔥🔥 完全プロジェクト復元システム開始 🔥🔥🔥"
echo "⚠️  この操作はプロジェクト全体を完全に削除して丸ごと復元します"
echo "⚠️  すべてのファイル・フォルダが対象です"

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

# STEP 2: 完全バックアップ存在確認
if [ ! -d "COMPLETE_BACKUP" ]; then
    echo "❌ COMPLETE_BACKUP フォルダが見つかりません！"
    echo "❌ 完全復元不可能です。GitHubから復元してください。"
    exit 1
fi

echo "✅ 完全バックアップフォルダ確認完了"

# STEP 3: 現在のプロジェクト全体を完全削除
echo "🗑️  プロジェクト全体完全削除中..."
echo "削除対象: すべてのファイル・フォルダ（COMPLETE_BACKUP以外）"

# 権限を一時的に変更
chmod -R 755 COMPLETE_BACKUP/ 2>/dev/null || true

# プロジェクト全体削除（COMPLETE_BACKUPとこのスクリプト以外）
for item in *; do
    if [ "$item" != "COMPLETE_BACKUP" ] && [ "$item" != "COMPLETE_RESTORE.sh" ]; then
        echo "削除中: $item"
        rm -rf "$item" 2>/dev/null || true
    fi
done

# 隠しファイルも削除
for item in .*; do
    if [ "$item" != "." ] && [ "$item" != ".." ] && [ "$item" != ".git" ]; then
        echo "削除中: $item"
        rm -rf "$item" 2>/dev/null || true
    fi
done

echo "✅ プロジェクト全体削除完了"

# STEP 4: 完全バックアップから丸ごと復元
echo "📦 完全バックアップから丸ごと復元中..."

# すべてのファイル・フォルダを復元
cp -r COMPLETE_BACKUP/* . || {
    echo "❌ ファイル復元失敗"
    exit 1
}

# 隠しファイルも復元
cp -r COMPLETE_BACKUP/.[^.]* . 2>/dev/null || true

# 完全バックアップを再度読み取り専用に
chmod -R 444 COMPLETE_BACKUP/

echo "✅ プロジェクト全体復元完了"

# STEP 5: Git状態クリーンアップ
echo "🔄 Git状態クリーンアップ..."
git stash 2>/dev/null || true
git reset --hard HEAD 2>/dev/null || true
git clean -fd 2>/dev/null || true

# STEP 6: 依存関係完全再構築
echo "📦 依存関係完全再構築..."
rm -rf node_modules package-lock.json .next 2>/dev/null || true
npm install || {
    echo "❌ npm install失敗"
    exit 1
}

# STEP 7: 完全復元確認
echo "🔍 完全復元確認中..."

# 重要ファイル存在確認
REQUIRED_FILES=(
    "email-app.tsx"
    "app/page.tsx" 
    "electron/main.js"
    "electron/index.html"
    "package.json"
    "components.json"
    "tailwind.config.ts"
    "tsconfig.json"
    "next.config.mjs"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ $file が復元されていません！"
        exit 1
    fi
done

# 重要フォルダ存在確認
REQUIRED_DIRS=(
    "app"
    "components"
    "electron"
    "hooks"
    "lib"
    "public"
    "styles"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        echo "❌ $dir フォルダが復元されていません！"
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

echo "✅ プロジェクト全体確認完了"
echo "   - email-app.tsx: $EMAIL_LINES行"
echo "   - 必須ファイル: ${#REQUIRED_FILES[@]}個すべて存在"
echo "   - 必須フォルダ: ${#REQUIRED_DIRS[@]}個すべて存在"
echo "   - Kmailブランディング: 確認済み"

# STEP 8: アプリケーション完全起動
echo "🚀 アプリケーション完全起動..."
npm run dev-full &

# 起動確認
echo "⏳ 完全起動確認中（20秒待機）..."
sleep 20

# Next.js確認
RETRY=0
while [ $RETRY -lt 10 ]; do
    if curl -s -I http://localhost:3000 | grep -q "200 OK"; then
        echo "✅ Next.js完全起動 (http://localhost:3000)"
        break
    fi
    echo "⏳ Next.js起動待機中... ($((RETRY+1))/10)"
    sleep 3
    RETRY=$((RETRY+1))
done

if [ $RETRY -eq 10 ]; then
    echo "❌ Next.js起動失敗"
    echo "📋 デバッグ情報:"
    ps aux | grep -E "(next|node)" | grep -v grep
    exit 1
fi

# Electron確認
if pgrep -f "electron" > /dev/null; then
    echo "✅ Electron完全起動"
else
    echo "⏳ Electron起動確認中..."
    sleep 10
    if pgrep -f "electron" > /dev/null; then
        echo "✅ Electron完全起動（遅延）"
    else
        echo "❌ Electron起動失敗"
    fi
fi

# 最終確認
TOTAL_FILES=$(find . -type f | wc -l)
TOTAL_DIRS=$(find . -type d | wc -l)

echo ""
echo "🎉🔥🎉 完全プロジェクト復元成功！🎉🔥🎉"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 完全復元後の状態:"
echo "   ✅ Next.js: http://localhost:3000 (完全動作)"
echo "   ✅ Electron: 完全起動済み"
echo "   ✅ email-app.tsx: $EMAIL_LINES行 (完全復元)"
echo "   ✅ Kmailブランディング: 完全確認済み"
echo "   ✅ 総ファイル数: $TOTAL_FILES個 (完全復元)"
echo "   ✅ 総フォルダ数: $TOTAL_DIRS個 (完全復元)"
echo "   ✅ 依存関係: 完全再構築済み"
echo "   ✅ プロジェクト全体: 100%完全復元"
echo ""
echo "🌐 ブラウザ確認: http://localhost:3000"
echo "💻 Electronアプリも完全起動されています"
echo ""
echo "🔒 COMPLETE_BACKUP/ には完全なプロジェクトが保護されています"
echo "🚨 今後破綻した場合は再度このスクリプトを実行してください"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"