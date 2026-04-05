import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `あなたはGOROの社内AIアシスタントです。
メンバーからの質問に以下のスタイルで回答してください。

## 回答スタイル
- 結論ファーストで回答する
- 端的に、余計な言葉を省く
- 日本語で回答する
- Slackで読みやすい形式（箇条書き、短い段落）にする

## 会社情報
- 会社名：株式会社GORO
- 代表：旭俊成
- 事業：UIUX事業 / デザイン・マーケ支援事業

## コミュニケーション
- 社内連絡：Slack
- 議事録・ナレッジ：Notion
`;

export async function askClaude(message, context = '') {
  const system = context
    ? `${SYSTEM_PROMPT}\n\n## 参考情報（Notionより）\n${context}`
    : SYSTEM_PROMPT;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system,
    messages: [{ role: 'user', content: message }],
  });

  return response.content[0].text;
}
