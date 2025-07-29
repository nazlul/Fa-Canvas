import { NextRequest, NextResponse } from 'next/server';
import { CANVAS_SIZE, DAILY_PIXEL_LIMIT } from '~/lib/constants';

interface Pixel {
  x: number;
  y: number;
  color: string;
  timestamp: number;
  user: string;
}

// In-memory storage for demo purposes
// In production, this would be a database
let canvasPixels: Pixel[] = [];
let userDailyPixels: Record<string, number> = {};

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      pixels: canvasPixels,
      totalPixels: canvasPixels.length,
      canvasSize: CANVAS_SIZE
    });
  } catch (error) {
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

    // Validate input
    if (typeof x !== 'number' || typeof y !== 'number' || typeof color !== 'string' || typeof user !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid input parameters' },
        { status: 400 }
      );
    }

    // Validate coordinates
    if (x < 0 || x >= CANVAS_SIZE || y < 0 || y >= CANVAS_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Coordinates out of bounds' },
        { status: 400 }
      );
    }

    // Validate color format
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      return NextResponse.json(
        { success: false, error: 'Invalid color format' },
        { status: 400 }
      );
    }

    // Check daily limit
    const today = new Date().toDateString();
    const userKey = `${user}-${today}`;
    const userPixelsToday = userDailyPixels[userKey] || 0;

    if (userPixelsToday >= DAILY_PIXEL_LIMIT) {
      return NextResponse.json(
        { success: false, error: 'Daily pixel limit reached' },
        { status: 429 }
      );
    }

    // Create new pixel
    const newPixel: Pixel = {
      x: Math.floor(x),
      y: Math.floor(y),
      color,
      timestamp: Date.now(),
      user
    };

    // Remove any existing pixel at this position
    canvasPixels = canvasPixels.filter(pixel => !(pixel.x === x && pixel.y === y));
    
    // Add new pixel
    canvasPixels.push(newPixel);

    // Update daily count
    userDailyPixels[userKey] = userPixelsToday + 1;

    return NextResponse.json({
      success: true,
      pixel: newPixel,
      remainingPixels: DAILY_PIXEL_LIMIT - (userPixelsToday + 1)
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to add pixel' },
      { status: 500 }
    );
  }
}

// Helper function to get user's remaining pixels for today
export async function GET_USER_PIXELS(user: string) {
  const today = new Date().toDateString();
  const userKey = `${user}-${today}`;
  const userPixelsToday = userDailyPixels[userKey] || 0;
  return DAILY_PIXEL_LIMIT - userPixelsToday;
} 