---
name: update-notion-mapping
description: NotionのDBを自動スキャンしてCLAUDE.mdのマッピングテーブルを最新化する
---

# Notion DBマッピング自動更新

以下の手順でCLAUDE.mdのNotionDBマッピングを更新せよ。

1. Notion MCPで以下のDBを検索・取得する
   - 営業DB
   - マーケティングDB
   - プロジェクトDB
   - メンバーDB
   - 会社DB

2. 各DBのcollection IDを取得する

3. ~/goro/CLAUDE.mdの「NotionDBマッピング」セクションを
   取得した最新のIDで上書き更新する