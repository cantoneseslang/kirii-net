#!/bin/bash

# メニューファイルがGit管理下にあることを確認するスクリプト
# このスクリプトはビルド前に実行され、メニューファイルがGit管理外の場合、ビルドを中断する

set -e

MENU_FILE="data/menu-schedule.ts"
ERROR_MESSAGE="❌ ERROR: $MENU_FILE is not tracked by Git. This will cause old menu data to be used in deployment."

# ファイルが存在するか確認
if [ ! -f "$MENU_FILE" ]; then
    echo "❌ ERROR: $MENU_FILE does not exist!"
    exit 1
fi

# Git管理下にあるか確認
if ! git ls-files --error-unmatch "$MENU_FILE" > /dev/null 2>&1; then
    echo "$ERROR_MESSAGE"
    echo ""
    echo "To fix this issue, run:"
    echo "  git add $MENU_FILE"
    echo "  git commit -m 'fix: menu-schedule.tsをGit管理に追加'"
    echo "  git push origin main"
    echo ""
    exit 1
fi

# Gitステータスを確認（変更がある場合は警告）
if git diff --quiet "$MENU_FILE" 2>/dev/null; then
    # 変更がない場合、ステージングされているか確認
    if git diff --cached --quiet "$MENU_FILE" 2>/dev/null; then
        echo "✅ $MENU_FILE is properly tracked by Git"
    else
        echo "⚠️  WARNING: $MENU_FILE has staged changes. Make sure to commit before deploying."
    fi
else
    echo "⚠️  WARNING: $MENU_FILE has unstaged changes. Make sure to commit before deploying."
fi

exit 0

