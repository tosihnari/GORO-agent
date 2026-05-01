import Anthropic from '@anthropic-ai/sdk';
import { queryProjectDB, queryMarketingDB, queryNotionDB, searchNotion, readNotionPage } from './notion.js';
import { getChannelHistory, searchChannels } from './slack.js';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `あなたはGOROの社内AIアシスタントです。

## 会社情報
- 会社名：株式会社GORO
- 代表：旭俊成
- 事業：UIUX事業 / デザイン・マーケ支援事業
- 社内連絡：Slack / 議事録・ナレッジ：Notion

## ツールの使い分け
- 顧客名・クライアント名・案件名が含まれる質問 → まず query_project_db を使う
- 自社のマーケ活動・施策・キャンペーン・SNS・広告・集客に関する質問 → まず query_marketing_db を使う
- プロジェクトの概要・詳細・子ページの内容を知りたい → read_notion_page でページ本文を取得する
- 議事録・ナレッジ・特定ページの検索 → search_notion を使う
- Slackチャンネルの特定 → まず search_slack_channel でチャンネルIDを見つける
- Slackの会話・やり取り・まとめ → チャンネルIDが分かったら get_slack_history を使う
- 複数の情報源が必要なら複数のツールを使う
- どちらのDBか判断できない場合は query_project_db → query_marketing_db の順で試す

## Slackチャンネルの探し方（厳守）
チャンネルIDが不明な場合は必ず search_slack_channel を使う。ユーザーに聞くのは絶対禁止。
- プロジェクト内部チャンネルのプレフィックス：pj_
- 顧客共有チャンネルのプレフィックス：share_
- チャンネル名は日本語の場合も英語の場合もある
- 検索手順（この順番で試す）：
  1. 案件名の日本語キーワードで検索（例: "東京国際"）
  2. 見つからなければ英語キーワードで検索（例: "tokyo"）
  3. プレフィックスで検索（例: "pj_"）して一覧から選ぶ
- 見つかったら channel_id を使って get_slack_history でメッセージ取得する

## ページ内容の読み方
- query_project_db でURLを取得したら、詳細を聞かれた場合は read_notion_page でそのURLを読む
- read_notion_page の結果に子ページ・子データベース一覧が含まれる場合、関連するものも read_notion_page や query_notion_db で読んで回答する
- 「概要」「サービス」「ターゲット」など詳細情報はページ本文にあるため必ず read_notion_page を使う

## 議事録・会議履歴の探し方（厳守）
「議事録」「会議」「MTG」「打ち合わせ」などの質問には以下の手順を必ず守ること。search_notion を使うことは絶対禁止。
1. query_project_db でプロジェクトページのURLを取得する
2. read_notion_page でそのプロジェクトページを読む（子ページ・子データベース一覧が返る）
3. 一覧に「議事録」「会議録」「MTG」などの[データベース]が見つかったら query_notion_db でそのURLを指定してエントリ一覧を取得する
4. 個別の議事録ページの内容が必要なら read_notion_page で読む
※ search_notion は全ワークスペースを横断するため、全く関係ないページがヒットする。議事録検索には絶対に使わない。

## 回答スタイル
- 結論ファーストで端的に
- 日本語で回答する
- Slack mrkdwn記法のみ使う：
  - 箇条書きは • （中黒）を使う（- ハイフンは使わない）
  - フィールド表示は 「• ステータス：進行中」 のようにラベルも値も装飾なしのプレーンテキスト
  - 太字 *テキスト* は見出し・強調したい単語のみに限定して使う
  - 見出しは 📋 タイトル のように絵文字+プレーンテキスト（アスタリスク不要）
- 絶対に使ってはいけない記法：**二重アスタリスク** / ## ハッシュ見出し / --- 区切り線 / - ハイフン箇条書き`;

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
    name: 'query_marketing_db',
    description: 'GOROの社内マーケティング活動プロジェクト管理DBを検索する。自社の施策・キャンペーン・SNS運用・広告・集客など社内マーケ活動に関する質問に使う。クライアント案件ではなく自社活動の話題の時に使う。',
    input_schema: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: '検索キーワード（プロジェクト名・施策名など。例: "Instagram", "LP", "SEO"）',
        },
      },
      required: ['keyword'],
    },
  },
  {
    name: 'query_notion_db',
    description: '任意のNotionデータベースURLまたはIDを指定してエントリ一覧（タイトル・URL・日付）を取得する。議事録DB・タスクDBなどプロジェクト内のサブデータベースを調べる時に使う。read_notion_pageで子データベースのURLが見つかったら使う。',
    input_schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'NotionデータベースのURL（例: https://www.notion.so/xxx）',
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'search_notion',
    description: 'GOROのNotionワークスペースを横断検索する。ナレッジ・マニュアルなどプロジェクトDB以外の一般情報を調べる時に使う。【禁止】特定プロジェクトの議事録・会議録の検索には絶対に使わない（無関係なページがヒットするため）。議事録はquery_project_db→read_notion_page→query_notion_dbの順で取得する。',
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
    name: 'search_slack_channel',
    description: 'キーワードでSlackチャンネル名を検索してチャンネルID・名前の一覧を返す。get_slack_historyを使う前にチャンネルIDを特定するために必ず使う。チャンネル名は日本語・英語どちらもある。日本語キーワードで検索してから英語でも試す。',
    input_schema: {
      type: 'object',
      properties: {
        keyword: {
          type: 'string',
          description: '検索キーワード（チャンネル名の一部。例: "tokyo", "pj_", "share_goro"）',
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

  for (let i = 0; i < 6; i++) {
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
        } else if (tool.name === 'query_marketing_db') {
          result = await queryMarketingDB(tool.input.keyword);
          if (!result) result = 'マーケティングDBに該当する情報は見つかりませんでした。';
        } else if (tool.name === 'query_notion_db') {
          result = await queryNotionDB(tool.input.url);
          if (!result) result = 'データベースのエントリを取得できませんでした。';
        } else if (tool.name === 'read_notion_page') {
          result = await readNotionPage(tool.input.url);
          if (!result) result = 'ページの内容を取得できませんでした。';
        } else if (tool.name === 'search_notion') {
          result = await searchNotion(tool.input.keyword);
          if (!result) result = '該当するNotionページは見つかりませんでした。';
        } else if (tool.name === 'search_slack_channel') {
          const channels = await searchChannels(
            process.env.SLACK_BOT_TOKEN,
            tool.input.keyword,
          );
          if (channels.length > 0) {
            result = channels.map(ch => `• ${ch.name} (ID: ${ch.id})`).join('\n');
          } else {
            result = `"${tool.input.keyword}" に一致するチャンネルは見つかりませんでした。`;
          }
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
