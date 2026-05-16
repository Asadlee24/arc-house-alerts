import { scrapeArcHouse } from './lib/scraper';
import { isNewContent, markAsSeen, saveContent, updateStats, getStats } from './lib/storage';

async function test() {
  console.log('🔍 Starting test scrape...');
  try {
    const items = await scrapeArcHouse();
    console.log(`✅ Scraped ${items.length} items.`);
    
    let newItems = 0;
    for (const item of items) {
      if (await isNewContent(item.id)) {
        console.log(`✨ New item found: ${item.title}`);
        await markAsSeen(item.id);
        await saveContent({
          ...item,
          detectedAt: new Date().toISOString()
        });
        newItems++;
      }
    }
    
    await updateStats(newItems);
    const stats = await getStats();
    console.log('📊 Stats:', stats);
    console.log('✅ Test complete. check local_db.json');
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

test();
