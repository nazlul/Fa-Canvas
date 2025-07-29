# CastCanvas - Collaborative Pixel Art for Farcaster 🎨

A collaborative pixel art canvas built as a Farcaster mini app. Users can place pixels on a 1000x1000 canvas, zoom and pan around, and purchase additional pixels with ETH.

## Features

- **1000x1000 Pixel Canvas**: Large collaborative canvas for community art
- **Zoom & Pan**: Navigate around the canvas with mouse/touch controls
- **Color Palette**: 15 preset colors plus custom color picker
- **Daily Limits**: 5 free pixels per day per user
- **Pixel Purchases**: Buy 10 additional pixels for $1 worth of ETH
- **Real-time Updates**: See other users' pixels in real-time
- **Wallet Integration**: Connect your Farcaster wallet to participate

## How to Use

1. **Connect Wallet**: Click the wallet button to connect your Farcaster wallet
2. **Select Color**: Choose from the color palette or use the custom color picker
3. **Place Pixels**: Click anywhere on the canvas to place pixels
4. **Navigate**: Use mouse wheel to zoom, drag to pan around
5. **Buy More**: Purchase additional pixels when you run out of daily allowance

## Technical Details

- Built with Next.js 15 and React 19
- Uses Neynar SDK for Farcaster integration
- Wagmi for wallet connectivity
- Tailwind CSS for styling
- TypeScript for type safety

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
npm run deploy:vercel
```

## API Endpoints

- `GET /api/canvas` - Get all pixels on the canvas
- `POST /api/canvas` - Place a new pixel
- `GET /api/canvas/user?address=<address>` - Get user's remaining pixels
- `POST /api/canvas/purchase` - Purchase additional pixels

## Configuration

Update the constants in `src/lib/constants.ts`:
- `CANVAS_SIZE`: Canvas dimensions (default: 1000)
- `DAILY_PIXEL_LIMIT`: Free pixels per day (default: 5)
- `PIXELS_PER_PURCHASE`: Pixels per purchase (default: 10)
- `PRICE_PER_PURCHASE`: ETH price per purchase (default: 0.001)
- `PAYMENT_WALLET`: Wallet address to receive payments

## Contributing

This is a collaborative art project! Feel free to contribute by:
- Adding new features
- Improving the UI/UX
- Fixing bugs
- Adding more color palettes
- Implementing additional payment methods

## License

MIT License - see LICENSE file for details.

