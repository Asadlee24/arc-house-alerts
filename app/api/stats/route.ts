import { NextResponse } from 'next/server';
import { getLatestContent, getStats } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const latest = await getLatestContent();
    const stats = await getStats();
    
    return NextResponse.json({
      latest,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
