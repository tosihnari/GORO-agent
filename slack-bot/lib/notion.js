const NOTION_API = 'https://api.notion.com/v1';

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

// 日本語の助詞・質問ワードのみ除去（pj_ などのプレフィックスは保持）
function extractKeyword(message) {
  return message
    .replace(/を教えて|について|のリンク|のページ|のNotionページ|はどこ|教えて|お願い|ください|してほしい/g, '')
    .replace(/Notionの?|notionの?/gi, '')
    .trim();
}

export async function searchNotion(query) {
  const keyword = extractKeyword(query);
  console.log('Notion search keyword:', keyword);
  try {
    const data = await notionFetch('/search', {
      query: keyword,
      filter: { value: 'page', property: 'object' },
      page_size: 8,
    });

    console.log('Notion search results count:', data.results?.length ?? 0);

    if (!data.results || data.results.length === 0) return '該当するNotionページは見つかりませんでした。';

    // Claudeが意図に合うページを選べるよう、候補を全て渡す
    const candidates = data.results.map(page => {
      const props = page.properties ?? {};

      let title = '無題';
      for (const key of Object.keys(props)) {
        const prop = props[key];
        if (prop?.type === 'title' && prop.title?.[0]?.plain_text) {
          title = prop.title[0].plain_text;
          break;
        }
      }

      const pageId = page.id.replace(/-/g, '');
      const url = `https://www.notion.so/${pageId}`;
      console.log('Candidate:', title, url);
      return `- ${title}: ${url}`;
    });

    return `Notion検索候補（ユーザーの意図に最も合うものを選んで回答してください）:\n${candidates.join('\n')}`;
  } catch (error) {
    console.error('Notion search error:', error.name === 'AbortError' ? 'Timeout' : error.message);
    return '';
  }
}
