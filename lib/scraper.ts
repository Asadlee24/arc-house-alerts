import * as cheerio from 'cheerio';

export interface ScrapedItem {
  id: string;
  title: string;
  url: string;
  type: string;
  date?: string;
}

const TARGET_URLS = [
  'https://community.arc.network/public/content',
  'https://community.arc.io/home'
];

const CONTENT_PATTERNS = [
  '/public/blogs/',
  '/public/externals/',
  '/public/videos/',
  '/public/resources/',
  '/public/events/',
  '/public/clubs/'
];

export async function scrapeArcHouse(): Promise<ScrapedItem[]> {
  const items: ScrapedItem[] = [];

  for (const url of TARGET_URLS) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (!response.ok) continue;

      const html = await response.text();
      const $ = cheerio.load(html);

      $('a').each((_, el) => {
        const href = $(el).attr('href');
        if (!href) return;

        // Normalize URL
        let fullUrl = href;
        if (href.startsWith('/')) {
          fullUrl = `https://community.arc.network${href}`;
        }

        const isMatch = CONTENT_PATTERNS.some(p => fullUrl.includes(p));
        if (isMatch) {
          const title = $(el).text().trim() || $(el).attr('title')?.trim() || 'Untitled Content';
          
          // Basic type detection from URL
          let type = 'Article';
          if (fullUrl.includes('/blogs/')) type = 'Blog';
          else if (fullUrl.includes('/videos/')) type = 'Video';
          else if (fullUrl.includes('/events/')) type = 'Event';
          else if (fullUrl.includes('/resources/')) type = 'Resource';
          else if (fullUrl.includes('/externals/')) type = 'External';

          // Basic date extraction from URL if present (e.g., -2026-05-15)
          const dateMatch = fullUrl.match(/(\d{4}-\d{2}-\d{2})/);
          const date = dateMatch ? dateMatch[0] : undefined;

          // Deduplicate within the same scrape
          if (!items.find(i => i.url === fullUrl) && title.length > 5) {
            items.push({
              id: fullUrl, // Use URL as ID
              title,
              url: fullUrl,
              type,
              date
            });
          }
        }
      });
    } catch (error) {
      console.error(`Scraping failed for ${url}:`, error);
    }
  }

  return items;
}
