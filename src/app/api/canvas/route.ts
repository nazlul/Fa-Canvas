import { NextRequest, NextResponse } from 'next/server';
import { CANVAS_SIZE, DAILY_PIXEL_LIMIT } from '~/lib/constants';

interface Pixel {
  x: number;
  y: number;
  color: string;
  timestamp: number;
  user: string;
}

const canvasPixels: Pixel[] = [];
const userDailyPixels: Record<string, number> = {};

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      pixels: canvasPixels,
      totalPixels: canvasPixels.length,
      canvasSize: CANVAS_SIZE
    });
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch canvas data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { x, y, color, user } = body;

    if (typeof x !== 'number' || typeof y !== 'number' || typeof color !== 'string' || typeof user !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid input parameters' },
        { status: 400 }
      );
    }

    if (x < 0 || x >= CANVAS_SIZE || y < 0 || y >= CANVAS_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Coordinates out of bounds' },
        { status: 400 }
      );
    }

    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      return NextResponse.json(
        { success: false, error: 'Invalid color format' },
        { status: 400 }
      );
    }

    const today = new Date().toDateString();
    const userKey = `${user}-${today}`;
    const userPixelsToday = userDailyPixels[userKey] || 0;
    
    const availablePixels = DAILY_PIXEL_LIMIT - userPixelsToday;

    if (availablePixels <= 0) {
      return NextResponse.json(
        { success: false, error: 'No pixels available. Purchase more or wait for daily reset.' },
        { status: 429 }
      );
    }

    const newPixel: Pixel = {
      x: Math.floor(x),
      y: Math.floor(y),
      color,
      timestamp: Date.now(),
      user
    };

    canvasPixels.splice(0, canvasPixels.length, ...canvasPixels.filter(pixel => !(pixel.x === x && pixel.y === y)));
    canvasPixels.push(newPixel);

    userDailyPixels[userKey] = userPixelsToday + 1;

    return NextResponse.json({
      success: true,
      pixel: newPixel,
      remainingPixels: availablePixels - 1
    });
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: 'Failed to add pixel' },
      { status: 500 }
    );
  }
}

export async function GET_USER_PIXELS(user: string) {
  const today = new Date().toDateString();
  const userKey = `${user}-${today}`;
  const userPixelsToday = userDailyPixels[userKey] || 0;
  return DAILY_PIXEL_LIMIT - userPixelsToday;
} 