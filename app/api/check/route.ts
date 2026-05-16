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
        const message = `
🔔 *New Content on Arc House!*

*Title:* ${item.title}
*Type:* ${item.type}
${item.date ? `*Date:* ${item.date}` : ''}

🔗 [Read Article](${item.url})

#ArcHouse #${item.type.toLowerCase()} #NewPoints
        `.trim();

        await sendTelegramMessage(message);

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
