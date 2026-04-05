import Anthropic from '@anthropic-ai/sdk';
import { queryProjectDB, searchNotion } from './notion.js';
import { getChannelHistory } from './slack.js';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `あなたはGOROの社内AIアシスタントです。

## 会社情報
- 会社名：株式会社GORO
- 代表：旭俊成
- 事業：UIUX事業 / デザイン・マーケ支援事業
- 社内連絡：Slack / 議事録・ナレッジ：Notion

## ツールの使い分け
- 顧客・案件・プロジェクトに関する質問 → まず query_project_db を使う
- 議事録・ナレッジ・特定ページの検索 → search_notion を使う
- Slackの会話・やり取り・まとめ → get_slack_history を使う
- 複数の情報源が必要なら複数のツールを使う

## 回答スタイル
- 結論ファーストで端的に
- Slackの書式を使う（*太字*、• 箇条書き、見出しは絵文字+太字）
- 日本語で回答する`;

const TOOLS = [
  {
    name: 'query_project_db',
    description: 'GOROのパートナープロジェクト一覧DBを検索する。顧客名・案件名・プロジェクト情報・ステータス・担当者を調べる時に使う。',
    input_schema: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: '検索キーワード（顧客名・案件名など。例: "東京国際ツアーズ", "銀座美容外科"）',
        },
      },
      required: ['keyword'],
    },
  },
  {
    name: 'search_notion',
    description: 'GOROのNotionワークスペースを横断検索する。議事録・ナレッジ・マニュアルなどプロジェクトDB以外の情報を調べる時に使う。',
    input_schema: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: '検索キーワード（例: "キックオフ議事録", "デザインガイドライン"）',
        },
      },
      required: ['keyword'],
    },
  },
  {
    name: 'get_slack_history',
    description: 'Slackチャンネルの過去のメッセージを取得する。会話の要約・未返信確認・最近の議論を調べる時に使う。',
    input_schema: {
      type: 'object',
      properties: {
        channel_id: {
          type: 'string',
          description: '取得するSlackチャンネルのID',
        },
        limit: {
          type: 'number',
          description: '取得するメッセージ数（デフォルト30、最大100）',
        },
      },
      required: ['channel_id'],
    },
  },
];

export async function askClaude(userMessage, channelId) {
  const messages = [{ role: 'user', content: userMessage }];

  for (let i = 0; i < 4; i++) {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages,
    });

    if (response.stop_reason === 'end_turn') {
      return response.content.find(b => b.type === 'text')?.text ?? '';
    }

    const toolUseBlocks = response.content.filter(b => b.type === 'tool_use');
    if (toolUseBlocks.length === 0) {
      return response.content.find(b => b.type === 'text')?.text ?? '';
    }

    messages.push({ role: 'assistant', content: response.content });

    const toolResults = await Promise.all(
      toolUseBlocks.map(async tool => {
        console.log('Tool call:', tool.name, tool.input);
        let result = '';

        if (tool.name === 'query_project_db') {
          result = await queryProjectDB(tool.input.keyword);
          if (!result) result = 'プロジェクトDBに該当する情報は見つかりませんでした。';
        } else if (tool.name === 'search_notion') {
          result = await searchNotion(tool.input.keyword);
          if (!result) result = '該当するNotionページは見つかりませんでした。';
        } else if (tool.name === 'get_slack_history') {
          const msgs = await getChannelHistory(
            process.env.SLACK_BOT_TOKEN,
            tool.input.channel_id ?? channelId,
            tool.input.limit ?? 30,
          );
          if (msgs.length > 0) {
            result = msgs
              .filter(m => m.text && !m.bot_id)
              .map(m => `[${new Date(Number(m.ts) * 1000).toLocaleString('ja-JP')}] ${m.text}`)
              .reverse()
              .join('\n');
          } else {
            result = 'メッセージが見つかりませんでした。';
          }
        }

        return { type: 'tool_result', tool_use_id: tool.id, content: result };
      })
    );

    messages.push({ role: 'user', content: toolResults });
  }

  return 'うまく処理できませんでした。もう一度試してください。';
}
