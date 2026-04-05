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

// 日本語の助詞・動詞・質問ワードを除いてキーワードを抽出
function extractKeyword(message) {
  return message
    .replace(/を教えて|について|のリンク|のページ|のNotionページ|はどこ|教えて|お願い|ください|してほしい/g, '')
    .replace(/Notionの?|notionの?/gi, '')
    .replace(/pj_/g, '')
    .trim();
}

export async function searchNotion(query) {
  const keyword = extractKeyword(query);
  console.log('Notion search keyword:', keyword);
  try {
    const data = await notionFetch('/search', {
      query: keyword,
      filter: { value: 'page', property: 'object' },
      page_size: 3,
    });

    console.log('Notion search results count:', data.results?.length ?? 0);

    if (!data.results || data.results.length === 0) return '';

    const summaries = data.results.map(page => {
      const props = page.properties ?? {};
      const propKeys = Object.keys(props);
      console.log('Page prop keys:', propKeys);

      // タイトルプロパティを動的に探す
      let title = '無題';
      for (const key of propKeys) {
        const prop = props[key];
        if (prop?.type === 'title' && prop.title?.[0]?.plain_text) {
          title = prop.title[0].plain_text;
          break;
        }
      }
      console.log('Found title:', title);
      return `- ${title}`;
    });

    return `関連するNotionページ:\n${summaries.join('\n')}`;
  } catch (error) {
    console.error('Notion search error:', error.name === 'AbortError' ? 'Timeout' : error.message);
    return '';
  }
}
