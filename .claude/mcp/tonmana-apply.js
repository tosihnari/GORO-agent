#!/usr/bin/env node
/**
 * tonmana-apply.js
 * 使い方: node tonmana-apply.js <対象HTML> <ムードボード画像.png>
 *
 * ムードボード画像のスタイルをHTMLに適用する。
 * styled_<元ファイル名>.html に出力する。
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const [, , htmlPath, imagePath] = process.argv;
if (!htmlPath || !imagePath) {
  console.error("使い方: node tonmana-apply.js <対象HTML> <ムードボード画像.png>");
  process.exit(1);
}

function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, "utf-8")
    .split("\n")
    .forEach((line) => {
      const [key, ...rest] = line.split("=");
      if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
    });
}
loadEnv();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
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

async function main() {
  const htmlAbsPath = path.resolve(htmlPath);
  const imgAbsPath = path.resolve(imagePath);

  if (!fs.existsSync(htmlAbsPath)) {
    console.error(`エラー: HTMLファイルが見つかりません → ${htmlPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(imgAbsPath)) {
    console.error(`エラー: 画像ファイルが見つかりません → ${imagePath}`);
    process.exit(1);
  }

  const html = fs.readFileSync(htmlAbsPath, "utf-8");
  const imageBase64 = fs.readFileSync(imgAbsPath).toString("base64");

  console.log("Claude がスタイルを適用中...");
  const res = await post(
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
              text: `以下のデザインイメージを参考に、添付のHTMLにスタイルを適用してください。

【指示】
- デザインイメージの配色・フォントスタイル・余白感・UIの雰囲気を忠実に再現する
- HTMLの構造（タグ・クラス名）は変更しない
- <style>タグ内にCSSを追加する（既存のstyleがあれば置き換える）
- Google Fontsを使う場合は<link>タグを追加する
- レスポンシブ対応（モバイルファースト）
- 完成したHTML全文のみを出力する（説明文不要）

【対象HTML】
${html}`,
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

  if (res.error) {
    console.error("エラー:", res.error.message);
    process.exit(1);
  }

  const base = path.basename(htmlAbsPath, ".html");
  const outPath = path.join(__dirname, `styled_${base}.html`);
  fs.writeFileSync(outPath, res.content[0].text, "utf-8");

  console.log(`\n完了 → styled_${base}.html`);
}

main().catch((e) => { console.error(e); process.exit(1); });
