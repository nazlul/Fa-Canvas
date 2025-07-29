# CastCanvas - Collaborative Pixel Art for Farcaster 🎨

A collaborative pixel art canvas built as a Farcaster mini app on Base network. Users can place pixels on a 1000x1000 canvas, zoom and pan around, and purchase additional pixels with ETH.

## Features

- **1000x1000 Pixel Canvas**: Large collaborative canvas for community art
- **Zoom & Pan**: Navigate around the canvas with mouse/touch controls
- **Color Palette**: 15 preset colors plus custom color picker
- **Daily Limits**: 5 free pixels per day per user
- **Pixel Purchases**: Buy 10 additional pixels for 0.001 ETH on Base network
- **Smart Contract**: On-chain pixel tracking and purchases
- **Real-time Updates**: See other users' pixels in real-time
- **Wallet Integration**: Connect your Farcaster wallet to participate

## Smart Contract

The project includes a smart contract deployed on Base network that handles:
- Pixel purchases with ETH
- Daily pixel limits
- User pixel tracking
- Secure payment processing

### Contract Details
- **Network**: Base Mainnet (Chain ID: 8453)
- **Price**: 0.001 ETH for 10 pixels
- **Daily Limit**: 5 free pixels per day
- **Payment Wallet**: `0xD283D8510c859654da74910240d56CC571329761`

## How to Use

1. **Connect Wallet**: Click the wallet button to connect your Farcaster wallet
2. **Switch to Base**: Ensure you're on Base network (Chain ID: 8453)
3. **Select Color**: Choose from the color palette or use the custom color picker
4. **Place Pixels**: Click anywhere on the canvas to place pixels
5. **Navigate**: Use mouse wheel to zoom, drag to pan around
6. **Buy More**: Purchase additional pixels when you run out of daily allowance

## Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Base network ETH for deployment

### Installation

```bash
# Install dependencies
npm install

# Install Hardhat dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
npm run deploy:vercel
```

### Smart Contract Deployment

1. **Set up environment variables**:
   ```bash
   # Create .env file
   echo "PRIVATE_KEY=your_private_key_here" > .env
   echo "BASESCAN_API_KEY=your_basescan_api_key" >> .env
   ```

2. **Deploy the contract**:
   ```bash
   npm run deploy:contract
   ```

3. **Verify on BaseScan**:
   - Go to https://basescan.org
   - Search for your contract address
   - Click "Contract" → "Verify and Publish"
   - Upload the contract source code

### Environment Variables

Create a `.env` file with:
```env
PRIVATE_KEY=your_wallet_private_key
BASESCAN_API_KEY=your_basescan_api_key
BASE_RPC_URL=https://mainnet.base.org
```

## API Endpoints

- `GET /api/canvas` - Get all pixels on the canvas
- `POST /api/canvas` - Place a new pixel
- `GET /api/canvas/user?address=<address>` - Get user's remaining pixels
- `POST /api/canvas/purchase` - Purchase additional pixels

## Smart Contract Functions

- `purchasePixels()` - Purchase 10 pixels for 0.001 ETH
- `getAvailablePixels(address user)` - Get user's total available pixels
- `getDailyPixels(address user)` - Get user's daily pixel count
- `usePixel(address user)` - Use a pixel (called by API)
- `withdraw()` - Withdraw ETH to contract owner

## Technical Details

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Wallet**: Wagmi + Farcaster Frame connector
- **Blockchain**: Base network (Ethereum L2)
- **Smart Contract**: Solidity 0.8.19 + OpenZeppelin
- **Deployment**: Hardhat + Base network

## Configuration

Update the constants in `src/lib/constants.ts`:
- `CANVAS_SIZE`: Canvas dimensions (default: 1000)
- `DAILY_PIXEL_LIMIT`: Free pixels per day (default: 5)
- `PIXELS_PER_PURCHASE`: Pixels per purchase (default: 10)
- `PRICE_PER_PURCHASE`: ETH price per purchase (default: 0.001)
- `PAYMENT_WALLET`: Wallet address to receive payments
- `REQUIRED_CHAIN_ID`: Base network chain ID (8453)

## Contributing

This is a collaborative art project! Feel free to contribute by:
- Adding new features
- Improving the UI/UX
- Fixing bugs
- Adding more color palettes
- Implementing additional payment methods
- Optimizing the smart contract

## License

MIT License - see LICENSE file for details.

