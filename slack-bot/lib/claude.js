import Anthropic from '@anthropic-ai/sdk';
import { queryProjectDB, searchNotion, readNotionPage } from './notion.js';
import { getChannelHistory } from './slack.js';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `あなたはGOROの社内AIアシスタントです。

## 会社情報
- 会社名：株式会社GORO
- 代表：旭俊成
- 事業：UIUX事業 / デザイン・マーケ支援事業
- 社内連絡：Slack / 議事録・ナレッジ：Notion

## ツールの使い分け
- 顧客名・案件名が含まれる質問（リンク・情報・ステータス・担当者など）→ まず query_project_db を使う
- プロジェクトの概要・詳細・子ページの内容を知りたい → read_notion_page でページ本文を取得する
- 議事録・ナレッジ・特定ページの検索 → search_notion を使う
- Slackの会話・やり取り・まとめ → get_slack_history を使う
- 複数の情報源が必要なら複数のツールを使う

## ページ内容の読み方
- query_project_db でURLを取得したら、詳細を聞かれた場合は read_notion_page でそのURLを読む
- read_notion_page の結果に子ページ一覧が含まれる場合、関連する子ページも read_notion_page で読んで回答する
- 「概要」「サービス」「ターゲット」など詳細情報はページ本文にあるため必ず read_notion_page を使う

## 回答スタイル
- 結論ファーストで端的に
- 日本語で回答する
- Slack mrkdwn記法のみ使う：
  - 太字は *テキスト*（アスタリスク1つ）
  - 箇条書きは • または -
  - 見出しは絵文字+太字（例: 📋 *タイトル*）
- 絶対に使ってはいけない記法：**二重アスタリスク** / ## ハッシュ見出し / --- 区切り線`;

const TOOLS = [
  {
    name: 'query_project_db',
    description: 'GOROのパートナープロジェクト一覧DBを検索する。顧客名・案件名が出てきたら使う。リンク・URL・ページ・情報・ステータス・担当者など何を聞かれても対応できる。',
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
    name: 'read_notion_page',
    description: 'NotionページのURLまたはIDを指定してページの本文・子ページ一覧を取得する。プロジェクト概要・サービス内容・ターゲットなど詳細情報を調べる時に使う。',
    input_schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'NotionページのURL（例: https://www.notion.so/xxx）',
        },
      },
      required: ['url'],
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

export async function askClaude(userMessage, channelId, threadHistory = []) {
  // スレッド履歴をClaudeの会話形式に変換（最新メッセージ除く）
  const historyMessages = [];
  const pastMessages = threadHistory
    .filter(m => m.text && m.ts !== threadHistory.at(-1)?.ts) // 最新メッセージは除く
    .slice(-10); // 直近10件まで

  for (const m of pastMessages) {
    const text = m.text.replace(/<@[A-Z0-9]+>/g, '').trim();
    if (!text) continue;
    if (m.bot_id) {
      historyMessages.push({ role: 'assistant', content: text });
    } else {
      historyMessages.push({ role: 'user', content: text });
    }
  }

  // 会話が交互になるよう調整（Claudeは必ずuser→assistantの順が必要）
  const messages = historyMessages.length > 0
    ? [...historyMessages, { role: 'user', content: userMessage }]
    : [{ role: 'user', content: userMessage }];

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
        } else if (tool.name === 'read_notion_page') {
          result = await readNotionPage(tool.input.url);
          if (!result) result = 'ページの内容を取得できませんでした。';
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
