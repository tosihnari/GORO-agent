const NOTION_API = 'https://api.notion.com/v1';

// DBのID（Vercel環境変数で管理。将来DBが増えたら環境変数を追加する）
const DB_IDS = {
  partnerProjects: process.env.NOTION_PARTNER_PROJECT_DB_ID ?? 'bb9b7945290f442694de5a75013cfee2',
  // taskManagement: process.env.NOTION_TASK_DB_ID,  // 将来追加
};

async function notionFetch(path, body, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${NOTION_API}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function extractTitle(page) {
  const props = page.properties ?? {};
  for (const key of Object.keys(props)) {
    const prop = props[key];
    if (prop?.type === 'title' && prop.title?.[0]?.plain_text) {
      return prop.title[0].plain_text;
    }
  }
  return page.child_page?.title ?? '無題';
}

function getPropText(prop) {
  if (!prop) return null;
  switch (prop.type) {
    case 'select':       return prop.select?.name ?? null;
    case 'multi_select': return prop.multi_select?.map(s => s.name).join(', ') || null;
    case 'status':       return prop.status?.name ?? null;
    case 'people':       return prop.people?.map(p => p.name).join(', ') || null;
    case 'date':         return prop.date?.start ?? null;
    case 'rich_text':    return prop.rich_text?.[0]?.plain_text ?? null;
    case 'url':          return prop.url ?? null;
    default:             return null;
  }
}

// パートナープロジェクトDBを直接クエリ
export async function queryProjectDB(keyword) {
  console.log('ProjectDB query keyword:', keyword);
  try {
    const data = await notionFetch(`/databases/${DB_IDS.partnerProjects}/query`, {
      filter: {
        property: 'プロジェクト名',
        title: { contains: keyword },
      },
      page_size: 5,
    });

    const results = data.results ?? [];
    console.log('ProjectDB results:', results.length);

    if (results.length === 0) return 'プロジェクトDBに該当するプロジェクトは見つかりませんでした。';

    const summaries = results.map(page => {
      const props = page.properties ?? {};
      const title = extractTitle(page);
      const pageId = page.id.replace(/-/g, '');
      const url = `https://www.notion.so/${pageId}`;

      const lines = [`*${title}*`, `URL: ${url}`];
      const fieldMap = {
        'ステータス': 'ステータス',
        '事業カテゴリ': '事業カテゴリ',
        'P(推進者)': '推進者',
        'メンバー': 'メンバー',
        '開始日': '開始日',
        '終了日': '終了日',
      };
      for (const [propName, label] of Object.entries(fieldMap)) {
        const val = getPropText(props[propName]);
        if (val) lines.push(`• ${label}: ${val}`);
      }
      return lines.join('\n');
    });

    return summaries.join('\n\n---\n\n');
  } catch (error) {
    console.error('ProjectDB query error:', error.name === 'AbortError' ? 'Timeout' : error.message);
    return '';
  }
}

// 日本語の助詞・質問ワードのみ除去
function extractKeyword(message) {
  return message
    .replace(/を教えて|について|のリンク|のページ|のNotionページ|はどこ|教えて|お願い|ください|してほしい/g, '')
    .replace(/Notionの?|notionの?/gi, '')
    .trim();
}

// Notion全体の横断検索（議事録・ナレッジなどプロジェクトDB以外の情報）
export async function searchNotion(query) {
  const keyword = extractKeyword(query);
  console.log('Notion search keyword:', keyword);

  try {
    const data = await notionFetch('/search', {
      query: keyword,
      filter: { value: 'page', property: 'object' },
      page_size: 6,
    });

    const results = data.results ?? [];
    console.log('Notion search results:', results.length);
    if (results.length === 0) return '該当するNotionページは見つかりませんでした。';

    const kw = keyword.toLowerCase();
    const pages = results.map(page => {
      const title = extractTitle(page);
      const pageId = page.id.replace(/-/g, '');
      const url = `https://www.notion.so/${pageId}`;
      const isTitleMatch = title.toLowerCase().includes(kw);
      console.log(`[Candidate] "${title}" titleMatch=${isTitleMatch} ${url}`);
      return { title, url, isTitleMatch };
    });

    pages.sort((a, b) => (b.isTitleMatch ? 1 : 0) - (a.isTitleMatch ? 1 : 0));

    const candidates = pages.map(p =>
      `- ${p.title}${p.isTitleMatch ? ' [タイトル一致]' : ''}: ${p.url}`
    );

    return `Notion検索候補（ユーザーの意図に最も合うページを選んで回答してください）:\n${candidates.join('\n')}`;
  } catch (error) {
    console.error('Notion search error:', error.name === 'AbortError' ? 'Timeout' : error.message);
    return '';
  }
}
