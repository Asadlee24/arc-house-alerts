import { NextResponse } from 'next/server';
import { scrapeArcHouse } from '@/lib/scraper';
import { isNewContent, markAsSeen, saveContent, updateStats } from '@/lib/storage';
import { sendTelegramMessage } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const items = await scrapeArcHouse();
    let newItemsCount = 0;

    for (const item of items) {
      if (await isNewContent(item.id)) {
        // Prepare Message
        const message = `
🌟 *New Content on Arc House!* 🚀

*Title:* ${item.title}
*Type:* ${item.type}
${item.date ? `*Date:* ${item.date}` : ''}

💰 *Points Reminder:* Naye articles se aapko daily points milte hain. Foran check karein aur apne points claim karein!

---
🛠️ *Developed by:* [Asad Lee](https://asad-lee-portfolio.vercel.app)
        `.trim();

        // Prepare Pro Inline Buttons
        const reply_markup = {
          inline_keyboard: [
            [
              { text: '📖 Read Article', url: item.url },
              { text: '🐦 Follow Developer', url: 'https://x.com/asadleo416?s=21' }
            ],
            [
              { text: '👨‍💻 Portfolio', url: 'https://asad-lee-portfolio.vercel.app' }
            ]
          ]
        };

        await sendTelegramMessage(message, 'Markdown', reply_markup);

        // Save to DB
        await markAsSeen(item.id);
        await saveContent({
          ...item,
          detectedAt: new Date().toISOString()
        });

        newItemsCount++;
      }
    }

    await updateStats(newItemsCount);

    return NextResponse.json({
      success: true,
      scanned: items.length,
      newlyDetected: newItemsCount,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Check route error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
