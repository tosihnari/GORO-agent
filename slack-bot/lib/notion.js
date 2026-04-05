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

export async function searchNotion(query) {
  const keyword = extractKeyword(query);
  const pjKeyword = `pj_${keyword}`;
  console.log('Notion search keywords:', keyword, '/', pjKeyword);

  try {
    // 通常キーワードとpj_プレフィックス付きを並行検索
    const [data1, data2] = await Promise.all([
      notionFetch('/search', { query: keyword, filter: { value: 'page', property: 'object' }, page_size: 6 }),
      notionFetch('/search', { query: pjKeyword, filter: { value: 'page', property: 'object' }, page_size: 4 }),
    ]);

    // 結果をマージしてIDで重複排除
    const seen = new Set();
    const allResults = [...(data2.results ?? []), ...(data1.results ?? [])].filter(page => {
      if (seen.has(page.id)) return false;
      seen.add(page.id);
      return true;
    });

    console.log('Merged results count:', allResults.length);
    if (allResults.length === 0) return '該当するNotionページは見つかりませんでした。';

    const kw = keyword.toLowerCase();

    const pages = allResults.map(page => {
      // タイトル抽出の詳細ログ
      const propKeys = Object.keys(page.properties ?? {});
      const titleProp = propKeys.find(k => page.properties[k]?.type === 'title');
      const rawTitle = titleProp ? JSON.stringify(page.properties[titleProp].title) : 'NO_TITLE_PROP';
      console.log(`[RAW] id=${page.id} child_page=${page.child_page?.title ?? 'none'} titleProp=${titleProp} raw=${rawTitle}`);

      const title = extractTitle(page);
      const pageId = page.id.replace(/-/g, '');
      const url = `https://www.notion.so/${pageId}`;

      const isPjPage = title.toLowerCase().startsWith('pj_');
      const isTitleMatch = title.toLowerCase().includes(kw);

      const score = (isPjPage ? 2 : 0) + (isTitleMatch ? 1 : 0);
      const label = isPjPage && isTitleMatch ? '[プロジェクトページ]' : isTitleMatch ? '[タイトル一致]' : '[本文に言及あり]';

      console.log(`[Candidate] title="${title}" score=${score} label=${label} url=${url}`);
      return { title, url, score, label };
    });

    // スコア順に並び替え
    pages.sort((a, b) => b.score - a.score);

    const candidates = pages.map(p => `- ${p.title} ${p.label}: ${p.url}`);

    return `Notion検索候補（[プロジェクトページ]を最優先に、ユーザーの意図に最も合うページを選んで回答してください）:\n${candidates.join('\n')}`;
  } catch (error) {
    console.error('Notion search error:', error.name === 'AbortError' ? 'Timeout' : error.message);
    return '';
  }
}
