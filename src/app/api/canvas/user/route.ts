import { NextRequest, NextResponse } from 'next/server';
import { DAILY_PIXEL_LIMIT } from '~/lib/constants';

const userDailyPixels: Record<string, number> = {};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    const today = new Date().toDateString();
    const userKey = `${address}-${today}`;
    const userPixelsToday = userDailyPixels[userKey] || 0;
    const remainingPixels = DAILY_PIXEL_LIMIT - userPixelsToday;

    return NextResponse.json({
      success: true,
      remainingPixels: Math.max(0, remainingPixels),
      usedPixels: userPixelsToday,
      dailyLimit: DAILY_PIXEL_LIMIT
    });
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: 'Failed to get user pixels' },
      { status: 500 }
    );
  }
} 