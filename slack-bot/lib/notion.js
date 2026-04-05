import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export async function searchNotion(query) {
  try {
    const results = await notion.search({
      query,
      filter: { value: 'page', property: 'object' },
      page_size: 3,
    });

    if (results.results.length === 0) return '';

    const summaries = await Promise.all(
      results.results.map(async page => {
        const title =
          page.properties?.title?.title?.[0]?.plain_text ||
          page.properties?.Name?.title?.[0]?.plain_text ||
          '無題';

        // ページの先頭ブロックを取得してコンテキストに含める
        const blocks = await notion.blocks.children.list({
          block_id: page.id,
          page_size: 5,
        });

        const text = blocks.results
          .filter(b => b.type === 'paragraph' && b.paragraph.rich_text.length > 0)
          .map(b => b.paragraph.rich_text.map(t => t.plain_text).join(''))
          .join(' ')
          .slice(0, 300);

        return `### ${title}\n${text}`;
      })
    );

    return summaries.filter(Boolean).join('\n\n');
  } catch (error) {
    console.error('Notion search error:', error);
    return '';
  }
}
