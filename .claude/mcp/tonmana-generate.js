#!/usr/bin/env node
/**
 * tonmana-generate.js
 * 使い方: node tonmana-generate.js "<トンマナの説明>"
 *
 * DALL-E 3 でムードボード画像を生成して「参考画像」フォルダに保存する。
 * 画像を確認してから tonmana-apply.js でスタイルを適用する。
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const [, , tonmana] = process.argv;
if (!tonmana) {
  console.error("使い方: node tonmana-generate.js \"<トンマナの説明>\"");
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

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("エラー: OPENAI_API_KEY が設定されていません（.envを確認）");
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
  const prompt = `Web design mood board and UI style reference. ${tonmana}. Clean, professional website design. Show typography, color palette, UI components, overall visual tone. High quality design reference image.`;

  // 「参考画像」フォルダをスクリプトと同じ場所に作成
  const imgDir = path.join(__dirname, "参考画像");
  if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir);

  console.log("DALL-E 3 でムードボードを生成中...");
  const res = await post(
    "api.openai.com",
    "/v1/images/generations",
    { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
    { model: "dall-e-3", prompt, n: 1, size: "1024x1024", response_format: "b64_json" }
  );

  if (res.error) {
    console.error("エラー:", res.error.message);
    process.exit(1);
  }

  const timestamp = new Date().toISOString().slice(0, 16).replace(/[:.T]/g, "-");
  const fileName = `moodboard_${timestamp}.png`;
  const outPath = path.join(imgDir, fileName);
  fs.writeFileSync(outPath, Buffer.from(res.data[0].b64_json, "base64"));

  console.log(`\n完了 → 参考画像/${fileName}`);
  console.log("\n画像を確認したら、スタイルを適用してください：");
  console.log(`node tonmana-apply.js <対象HTML> 参考画像/${fileName}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
