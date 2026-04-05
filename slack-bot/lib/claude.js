import Anthropic from '@anthropic-ai/sdk';
import { searchNotion } from './notion.js';
import { getChannelHistory } from './slack.js';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `あなたはGOROの社内AIアシスタントです。

## 会社情報
- 会社名：株式会社GORO
- 代表：旭俊成
- 事業：UIUX事業 / デザイン・マーケ支援事業
- 社内連絡：Slack / 議事録・ナレッジ：Notion

## 行動方針
- メンバーの質問の意図を読み取り、必要なツールを使って調べてから回答する
- Notionに関係しそうな質問（プロジェクト・情報・ページ）はsearch_notionを使う
- Slackの会話・やり取り・まとめに関する質問はget_slack_historyを使う
- 両方必要そうなら両方使う
- ツールで情報が取れたらそれをもとに回答する

## 回答スタイル
- 結論ファーストで端的に
- Slackの書式を使う（*太字*、• 箇条書き、見出しは絵文字+太字）
- 日本語で回答する`;

const TOOLS = [
  {
    name: 'search_notion',
    description: 'GOROのNotionワークスペースを検索してページや情報を取得する。プロジェクト情報・議事録・ナレッジなどを調べる時に使う。',
    input_schema: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: '検索キーワード（例: "東京国際ツアーズ", "プロジェクト進捗"）',
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

  // Claudeにツール使用を含めて推論させる（最大3回のツール呼び出しを許可）
  for (let i = 0; i < 3; i++) {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages,
    });

    // ツール呼び出しがない場合は回答を返す
    if (response.stop_reason === 'end_turn') {
      return response.content.find(b => b.type === 'text')?.text ?? '';
    }

    // ツール呼び出しを処理
    const toolUseBlocks = response.content.filter(b => b.type === 'tool_use');
    if (toolUseBlocks.length === 0) {
      return response.content.find(b => b.type === 'text')?.text ?? '';
    }

    // アシスタントの応答をmessagesに追加
    messages.push({ role: 'assistant', content: response.content });

    // 各ツールを実行して結果を収集
    const toolResults = await Promise.all(
      toolUseBlocks.map(async tool => {
        console.log('Tool call:', tool.name, tool.input);
        let result = '';

        if (tool.name === 'search_notion') {
          result = await searchNotion(tool.input.keyword);
          if (!result) result = '該当するNotionページは見つかりませんでした。';
        } else if (tool.name === 'get_slack_history') {
          const messages = await getChannelHistory(
            process.env.SLACK_BOT_TOKEN,
            tool.input.channel_id ?? channelId,
            tool.input.limit ?? 30,
          );
          if (messages.length > 0) {
            const lines = messages
              .filter(m => m.text && !m.bot_id)
              .map(m => `[${new Date(Number(m.ts) * 1000).toLocaleString('ja-JP')}] ${m.text}`)
              .reverse();
            result = lines.join('\n');
          } else {
            result = 'メッセージが見つかりませんでした。';
          }
        }

        return {
          type: 'tool_result',
          tool_use_id: tool.id,
          content: result,
        };
      })
    );

    // ツール結果をmessagesに追加して次のループへ
    messages.push({ role: 'user', content: toolResults });
  }

  return 'うまく処理できませんでした。もう一度試してください。';
}
