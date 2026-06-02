#!/usr/bin/env bash
set -euo pipefail

echo "🔒 Checking critical menu update guards..."

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

check_pattern() {
  local pattern="$1"
  local file="$2"
  local message="$3"
  if ! grep -Eq "$pattern" "$file"; then
    echo "❌ $message"
    echo "   Missing pattern: $pattern"
    echo "   File: $file"
    exit 1
  fi
}

check_pattern "HK_TIMEZONE = 'Asia/Hong_Kong'" \
  "$ROOT_DIR/app/api/menu/route.ts" \
  "Hong Kong timezone guard was removed from menu API."

check_pattern "hasReachedSwitchTime" \
  "$ROOT_DIR/lib/menu-source.ts" \
  "Time-based remote menu activation guard was removed."

# 旧: middleware で /api/menu を Referer 判定から除外していた。
# 現在: Referer ブロック自体を廃止したため middleware が無い場合もある（その場合 API は常に到達可）。
if [ -f "$ROOT_DIR/middleware.ts" ]; then
  check_pattern "pathname.startsWith\\(\"/api/menu\"\\)" \
    "$ROOT_DIR/middleware.ts" \
    "Middleware allowlist for /api/menu was removed."
else
  echo "ℹ️  No middleware.ts — /api/menu is not blocked by edge middleware (OK)."
fi

echo "✅ Critical menu update guards are present."
