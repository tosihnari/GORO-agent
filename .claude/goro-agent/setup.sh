#!/bin/bash
# GORO Claude Code セットアップスクリプト
# 使い方: bash 00_claude/goro-agent/setup.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"
TEMPLATE="$SCRIPT_DIR/settings.template.json"
CONFIG_DIR="$HOME/.claude_goro"

echo "=== GORO Claude Code セットアップ ==="

# .env の存在確認
if [ ! -f "$ENV_FILE" ]; then
  echo ""
  echo "エラー: $ENV_FILE が見つかりません"
  echo "以下を実行してから再度試してください:"
  echo "  cp $SCRIPT_DIR/.env.example $SCRIPT_DIR/.env"
  echo "  # .env を開いて各トークンを入力"
  exit 1
fi

# .env 読み込み
set -a
source "$ENV_FILE"
set +a

# ~/.claude_goro ディレクトリ作成
mkdir -p "$CONFIG_DIR"

# settings.json を生成
sed \
  -e "s|__NOTION_TOKEN__|$NOTION_TOKEN|g" \
  -e "s|__FIGMA_API_KEY__|$FIGMA_API_KEY|g" \
  -e "s|__FIGMA_FILE_KEY__|$FIGMA_FILE_KEY|g" \
  -e "s|__SLACK_BOT_TOKEN__|$SLACK_BOT_TOKEN|g" \
  -e "s|__GOOGLE_CLIENT_ID__|$GOOGLE_CLIENT_ID|g" \
  -e "s|__GOOGLE_CLIENT_SECRET__|$GOOGLE_CLIENT_SECRET|g" \
  -e "s|__GOOGLE_REFRESH_TOKEN__|$GOOGLE_REFRESH_TOKEN|g" \
  "$TEMPLATE" > "$CONFIG_DIR/settings.json"

echo "✓ ~/.claude_goro/settings.json を生成しました"

# zshrc にエイリアスを追加（未設定の場合のみ）
ZSHRC="$HOME/.zshrc"
if ! grep -q "claude-goro" "$ZSHRC" 2>/dev/null; then
  echo "" >> "$ZSHRC"
  echo "# GORO Claude Code" >> "$ZSHRC"
  echo 'alias claude-goro="CLAUDE_CONFIG_DIR=~/.claude_goro claude"' >> "$ZSHRC"
  echo "✓ ~/.zshrc に claude-goro エイリアスを追加しました"
  echo "  → source ~/.zshrc を実行してください"
else
  echo "✓ claude-goro エイリアスは設定済みです"
fi

echo ""
echo "セットアップ完了！"
echo "  ターミナルで: claude-goro"
echo "  VSCode拡張: CLAUDE_CONFIG_DIR=~/.claude_goro を設定"
