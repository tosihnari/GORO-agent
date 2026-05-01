#!/usr/bin/env node
/**
 * tonmana-style.js
 * 使い方: node .claude/mcp/tonmana-style.js <wireframe.html> "<トンマナ>" [model]
 * model: dall-e-3（デフォルト）または gpt-image-1
 *
 * 1. トンマナテキスト → 指定モデルでデザインイメージ生成
 * 2. 生成画像 + ワイヤーHTML → Claude Vision でスタイル適用
 * 3. styled_<モデル名>_<元ファイル名>.html に出力
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const [, , wireframePath, tonmana, model = "dall-e-3"] = process.argv;
if (!wireframePath || !tonmana) {
  console.error(
    "使い方: node .claude/mcp/tonmana-style.js <wireframe.html> \"<トンマナ>\" [dall-e-3|gpt-image-1]"
  );
  process.exit(1);
}

// .env 読み込み
function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, "utf-8")
    .split("\n")
    .forEach((line) => {
      const [key, ...rest] = line.split("=");
      if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
    });
}
loadEnv();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("エラー: OPENAI_API_KEY が設定されていません（.envを確認）");
  process.exit(1);
}
if (!ANTHROPIC_API_KEY) {
  console.error("エラー: ANTHROPIC_API_KEY が設定されていません（.envを確認）");
  process.exit(1);
}

function post(hostname, pathname, headers, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(
      { hostname, path: pathname, method: "POST", headers: { ...headers, "Content-Length": Buffer.byteLength(data) } },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          try { resolve(JSON.parse(raw)); } catch (e) { reject(new Error(raw)); }
        });
      }
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

const dallePrompt = `Web design mood board and UI style reference. ${tonmana}. Clean, professional website design. Show typography, color palette, UI components, overall visual tone. High quality design reference image.`;

async function generateImage() {
  if (model === "gpt-image-1") {
    // gpt-image-1 は quality パラメータを使用
    const res = await post(
      "api.openai.com",
      "/v1/images/generations",
      { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
      { model: "gpt-image-1", prompt: dallePrompt, n: 1, size: "1024x1024" }
    );
    if (res.error) throw new Error(res.error.message);
    return res.data[0].b64_json;
  } else {
    // dall-e-3
    const res = await post(
      "api.openai.com",
      "/v1/images/generations",
      { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
      { model: "dall-e-3", prompt: dallePrompt, n: 1, size: "1024x1024", response_format: "b64_json" }
    );
    if (res.error) throw new Error(res.error.message);
    return res.data[0].b64_json;
  }
}

async function main() {
  const wireframeHtml = fs.readFileSync(wireframePath, "utf-8");

  console.log(`① [${model}] デザインイメージを生成中...`);
  const imageBase64 = await generateImage();
  console.log("   → 生成完了");

  // 生成画像を保存（比較用）
  const dir = path.dirname(wireframePath);
  const base = path.basename(wireframePath, ".html");
  const imgPath = path.join(dir, `moodboard_${model}_${base}.png`);
  fs.writeFileSync(imgPath, Buffer.from(imageBase64, "base64"));
  console.log(`   → 画像保存: ${imgPath}`);

  console.log("② Claude にスタイルを適用中...");
  const claudeRes = await post(
    "api.anthropic.com",
    "/v1/messages",
    {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    {
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `以下のデザインイメージを参考に、添付のHTMLワイヤーフレームにスタイルを適用してください。

【トンマナ】
${tonmana}

【指示】
- デザインイメージの配色・フォントスタイル・余白感・UIの雰囲気を忠実に再現する
- HTMLの構造（タグ・クラス名）は変更しない
- <style>タグ内にCSSを追加する（既存のstyleがあれば置き換える）
- Google Fontsを使う場合は<link>タグを追加する
- レスポンシブ対応（モバイルファースト）
- 完成したHTML全文のみを出力する（説明文不要）

【ワイヤーフレームHTML】
${wireframeHtml}`,
            },
            {
              type: "image",
              source: { type: "base64", media_type: "image/png", data: imageBase64 },
            },
          ],
        },
      ],
    }
  );

  if (claudeRes.error) {
    console.error("Claude エラー:", claudeRes.error.message);
    process.exit(1);
  }

  const styledHtml = claudeRes.content[0].text;
  const outputPath = path.join(dir, `styled_${model}_${base}.html`);
  fs.writeFileSync(outputPath, styledHtml, "utf-8");

  console.log(`③ 完了 → ${outputPath}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
