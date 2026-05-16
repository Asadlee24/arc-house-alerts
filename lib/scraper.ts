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
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isRecent = (dateStr?: string) => {
    if (!dateStr) return true; // If no date, assume it's new
    const itemDate = new Date(dateStr);
    return itemDate >= yesterday;
  };

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

        let fullUrl = href;
        if (href.startsWith('/')) {
          fullUrl = `https://community.arc.network${href}`;
        }

        const isMatch = CONTENT_PATTERNS.some(p => fullUrl.includes(p));
        if (isMatch) {
          // Clean title parsing: ignore elements that look like CSS or are too long/short
          let title = $(el).find('h2, h3, span, p').first().text().trim() || $(el).text().trim();
          
          // Remove CSS junk if detected
          if (title.includes('{') || title.includes('.css-') || title.length < 5) {
             title = $(el).attr('aria-label') || $(el).attr('title') || '';
          }
          
          // Final fallback: try to get text from parent if needed, or clean up the string
          title = title.replace(/\.css-[\w-]+{[^}]+}/g, '').trim();

          if (!title || title.length < 5) return;

          let type = 'Article';
          if (fullUrl.includes('/blogs/')) type = 'Blog';
          else if (fullUrl.includes('/videos/')) type = 'Video';
          else if (fullUrl.includes('/events/')) type = 'Event';
          else if (fullUrl.includes('/resources/')) type = 'Resource';

          const dateMatch = fullUrl.match(/(\d{4}-\d{2}-\d{2})/);
          const date = dateMatch ? dateMatch[0] : undefined;

          // FILTER: Only keep recent items to avoid spamming old content
          if (isRecent(date)) {
            if (!items.find(i => i.url === fullUrl)) {
              items.push({
                id: fullUrl,
                title,
                url: fullUrl,
                type,
                date
              });
            }
          }
        }
      });
    } catch (error) {
      console.error(`Scraping failed for ${url}:`, error);
    }
  }

  return items;
}
