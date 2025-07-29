import { NextRequest, NextResponse } from 'next/server';
import { PIXELS_PER_PURCHASE, PRICE_PER_PURCHASE, PAYMENT_WALLET } from '~/lib/constants';
import { createPublicClient, http, parseEther } from 'viem';
import { base } from 'viem/chains';

// Viem client for Base network
const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

// Contract ABI for verification
const CONTRACT_ABI = [
  "function purchasePixels() external payable",
  "function getAvailablePixels(address user) external view returns (uint256)",
  "function getDailyPixels(address user) external view returns (uint256)",
  "function userPurchasedPixels(address user) external view returns (uint256)",
  "event PixelPurchased(address indexed user, uint256 amount, uint256 pixels)"
];

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

    // Verify the transaction on Base network
    try {
      const transaction = await publicClient.getTransaction({
        hash: transactionHash as `0x${string}`,
      });

      // Verify transaction details
      if (transaction.to?.toLowerCase() !== PAYMENT_WALLET.toLowerCase()) {
        return NextResponse.json(
          { success: false, error: 'Invalid recipient address' },
          { status: 400 }
        );
      }

      if (transaction.value !== parseEther(PRICE_PER_PURCHASE.toString())) {
        return NextResponse.json(
          { success: false, error: 'Incorrect payment amount' },
          { status: 400 }
        );
      }

      // Verify transaction is confirmed
      const receipt = await publicClient.getTransactionReceipt({
        hash: transactionHash as `0x${string}`,
      });

      if (receipt.status !== 'success') {
        return NextResponse.json(
          { success: false, error: 'Transaction failed' },
          { status: 400 }
        );
      }

      // Add pixels to user's account
      const userKey = `${user}-purchased`;
      const currentPurchased = userPurchasedPixels[userKey] || 0;
      userPurchasedPixels[userKey] = currentPurchased + PIXELS_PER_PURCHASE;

      return NextResponse.json({
        success: true,
        purchasedPixels: PIXELS_PER_PURCHASE,
        totalPurchased: userPurchasedPixels[userKey],
        price: PRICE_PER_PURCHASE,
        paymentWallet: PAYMENT_WALLET,
        transactionHash: transactionHash
      });

    } catch (error) {
      console.error('Transaction verification failed:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to verify transaction' },
        { status: 500 }
      );
    }

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