import { NextRequest, NextResponse } from 'next/server';
import { PIXELS_PER_PURCHASE, PRICE_PER_PURCHASE, PAYMENT_WALLET } from '~/lib/constants';

// In-memory storage for demo purposes
// In production, this would be a database
let userPurchasedPixels: Record<string, number> = {};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user, transactionHash } = body;

    if (!user || !transactionHash) {
      return NextResponse.json(
        { success: false, error: 'User and transaction hash are required' },
        { status: 400 }
      );
    }

    // In a real app, you would verify the transaction here
    // For demo purposes, we'll just simulate the purchase
    const userKey = `${user}-purchased`;
    const currentPurchased = userPurchasedPixels[userKey] || 0;
    userPurchasedPixels[userKey] = currentPurchased + PIXELS_PER_PURCHASE;

    return NextResponse.json({
      success: true,
      purchasedPixels: PIXELS_PER_PURCHASE,
      totalPurchased: userPurchasedPixels[userKey],
      price: PRICE_PER_PURCHASE,
      paymentWallet: PAYMENT_WALLET
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process purchase' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User parameter is required' },
        { status: 400 }
      );
    }

    const userKey = `${user}-purchased`;
    const purchasedPixels = userPurchasedPixels[userKey] || 0;

    return NextResponse.json({
      success: true,
      purchasedPixels,
      pricePerPurchase: PRICE_PER_PURCHASE,
      pixelsPerPurchase: PIXELS_PER_PURCHASE,
      paymentWallet: PAYMENT_WALLET
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to get purchase info' },
      { status: 500 }
    );
  }
} 