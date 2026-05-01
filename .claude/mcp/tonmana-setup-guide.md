# トンマナスタイル適用ツール 使用手順書

デザインHTMLに、AI生成のムードボードを使ってトンマナを適用するツールです。

---

## 事前準備（初回のみ）

### 1. Node.js のインストール確認

ターミナルを開いて以下を実行：

```bash
node --version
```

`v18.0.0` 以上が表示されればOK。表示されない場合は [nodejs.org](https://nodejs.org) からインストール。

---

### 2. zipを解凍してフォルダに配置

Slackから受け取った `tonmana-tool.zip` を解凍し、`sanari-hp` フォルダに入れる。

```
test/
└── sanari-hp/
    ├── tonmana-generate.js   ← ここに置く
    ├── tonmana-apply.js      ← ここに置く
    ├── tonmana-setup-guide.md
    ├── .env                  ← 次のステップで作成
    ├── 参考画像/              ← 自動で作成される
    ├── design-C.html
    └── wireframe-A.html
```

---

### 3. .env ファイルを作成

`sanari-hp` フォルダ内にテキストエディタで `.env` というファイルを作成し、受け取ったキーを貼る：

```
OPENAI_API_KEY=sk-...（OpenAIキー）
ANTHROPIC_API_KEY=sk-ant-...（AnthropicAPIキー）
```

保存して閉じる。

> ⚠️ `.env` は絶対に他人に送らない・Slackに貼らない。

---

## 使い方

ターミナルで `sanari-hp` フォルダに移動してから実行する。

```bash
cd ~/Desktop/test/sanari-hp
```

---

### STEP 1：ムードボード画像を生成する

```bash
node tonmana-generate.js "トンマナの説明（日本語OK）"
```

**例：**
```bash
node tonmana-generate.js "モノトーンベース、ピンクアクセント、ゴシック体、エンタメ×信頼感のB2B企業サイト"
```

→ `参考画像/moodboard_YYYY-MM-DD.png` に保存される

---

### STEP 2：画像を確認する

Finderで `参考画像` フォルダを開いて画像を確認する。

イメージが合わなければ STEP 1 を別の説明で再実行する。

---

### STEP 3：HTMLにスタイルを適用する

```bash
node tonmana-apply.js <対象HTMLファイル名> <参考画像のパス>
```

**例：**
```bash
node tonmana-apply.js design-C.html 参考画像/moodboard_2026-05-01.png
```

→ `styled_design-C.html` に出力される

---

### STEP 4：ブラウザで確認する

Finderで `styled_design-C.html` をダブルクリックしてブラウザで開く。

---

## よくあるエラー

| エラー | 原因 | 対処 |
|--------|------|------|
| `OPENAI_API_KEY が設定されていません` | .envが未作成またはキーが未記入 | .envを確認 |
| `ANTHROPIC_API_KEY が設定されていません` | 同上 | .envを確認 |
| `Billing hard limit has been reached` | OpenAIのクレジット切れ | 旭に連絡 |
| `HTMLファイルが見つかりません` | ファイル名が間違っている | ファイル名を確認 |
