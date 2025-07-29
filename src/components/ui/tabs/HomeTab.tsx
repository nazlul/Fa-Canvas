"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAccount, useBalance, useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { CANVAS_SIZE, DAILY_PIXEL_LIMIT, PIXELS_PER_PURCHASE, PRICE_PER_PURCHASE, PAYMENT_WALLET } from "~/lib/constants";

interface Pixel {
  x: number;
  y: number;
  color: string;
  timestamp: number;
  user: string;
}

interface CastCanvasProps {
  pixels: Pixel[];
  onPixelPlace: (x: number, y: number, color: string) => void;
  remainingPixels: number;
  onPurchasePixels: () => void;
  isLoading: boolean;
}

const DEFAULT_COLORS = [
  "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF", 
  "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500", "#800080",
  "#008000", "#FFC0CB", "#A52A2A", "#808080", "#FFD700"
];

export function HomeTab() {
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [customColor, setCustomColor] = useState("#000000");
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastDragPos, setLastDragPos] = useState({ x: 0, y: 0 });
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [remainingPixels, setRemainingPixels] = useState(DAILY_PIXEL_LIMIT);
  const [isLoading, setIsLoading] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { writeContract, isPending } = useWriteContract();

  // Mock data - in real app this would come from API
  useEffect(() => {
    // Load existing pixels from API
    const loadPixels = async () => {
      try {
        const response = await fetch('/api/canvas');
        const data = await response.json();
        if (data.success) {
          setPixels(data.pixels);
        }
      } catch (error) {
        console.error('Failed to load pixels:', error);
      }
    };

    loadPixels();
  }, []);

  // Load user's remaining pixels when wallet connects
  useEffect(() => {
    if (address) {
      const loadUserPixels = async () => {
        try {
          const response = await fetch(`/api/canvas/user?address=${address}`);
          const data = await response.json();
          if (data.success) {
            setRemainingPixels(data.remainingPixels);
          }
        } catch (error) {
          console.error('Failed to load user pixels:', error);
        }
      };

      loadUserPixels();
    }
  }, [address]);

  const handlePixelPlace = useCallback(async (x: number, y: number) => {
    if (remainingPixels <= 0) {
      alert("You've used all your daily pixels! Purchase more to continue.");
      return;
    }

    if (!address) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      const response = await fetch('/api/canvas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          x: Math.floor(x),
          y: Math.floor(y),
          color: selectedColor,
          user: address
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setPixels(prev => [...prev.filter(p => !(p.x === x && p.y === y)), data.pixel]);
        setRemainingPixels(data.remainingPixels);
      } else {
        alert(data.error || 'Failed to place pixel');
      }
    } catch (error) {
      console.error('Failed to place pixel:', error);
      alert('Failed to place pixel. Please try again.');
    }
  }, [selectedColor, remainingPixels, address]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / zoom;
    const y = (e.clientY - rect.top - offset.y) / zoom;
    
    if (x >= 0 && x < CANVAS_SIZE && y >= 0 && y < CANVAS_SIZE) {
      handlePixelPlace(x, y);
    }
  }, [offset, zoom, handlePixelPlace]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setLastDragPos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastDragPos.x;
    const deltaY = e.clientY - lastDragPos.y;
    
    setOffset(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setLastDragPos({ x: e.clientX, y: e.clientY });
  }, [isDragging, lastDragPos]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(10, prev * delta)));
  }, []);

  const handlePurchasePixels = async () => {
    if (!address) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      setIsLoading(true);
      
      // In a real app, you'd send a transaction to the blockchain here
      // For demo purposes, we'll simulate the transaction
      const mockTransactionHash = `0x${Math.random().toString(16).substring(2)}`;
      
      const response = await fetch('/api/canvas/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: address,
          transactionHash: mockTransactionHash
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setRemainingPixels(prev => prev + PIXELS_PER_PURCHASE);
        alert(`Successfully purchased ${PIXELS_PER_PURCHASE} pixels!`);
      } else {
        alert(data.error || 'Failed to purchase pixels');
      }
    } catch (error) {
      console.error('Failed to purchase pixels:', error);
      alert('Failed to purchase pixels. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPixelAt = (x: number, y: number) => {
    return pixels.find(pixel => pixel.x === Math.floor(x) && pixel.y === Math.floor(y));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">CastCanvas</h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {remainingPixels} pixels remaining today
          </div>
        </div>
        <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Canvas: {CANVAS_SIZE}x{CANVAS_SIZE}</span>
          <span>Zoom: {Math.round(zoom * 100)}%</span>
          <span>Position: ({Math.round(offset.x)}, {Math.round(offset.y)})</span>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="canvas-container flex-1">
        <div
          ref={canvasRef}
          className="w-full h-full relative cursor-crosshair"
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ cursor: isDragging ? 'grabbing' : 'crosshair' }}
        >
          {/* Canvas Grid */}
          <div
            className="canvas-grid"
            style={{
              width: CANVAS_SIZE * zoom,
              height: CANVAS_SIZE * zoom,
              transform: `translate(${offset.x}px, ${offset.y}px)`,
              backgroundSize: `${zoom}px ${zoom}px`
            }}
          >
            {/* Render Pixels */}
            {pixels.map((pixel, index) => (
              <div
                key={`${pixel.x}-${pixel.y}-${pixel.timestamp}`}
                className="pixel"
                style={{
                  left: pixel.x * zoom,
                  top: pixel.y * zoom,
                  width: zoom,
                  height: zoom,
                  backgroundColor: pixel.color,
                  border: zoom > 2 ? '1px solid rgba(0,0,0,0.1)' : 'none'
                }}
                title={`${pixel.color} at (${pixel.x}, ${pixel.y})`}
              />
            ))}
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="zoom-controls">
          <button
            onClick={() => setZoom(prev => Math.min(10, prev * 1.2))}
            className="zoom-button"
          >
            +
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(0.1, prev / 1.2))}
            className="zoom-button"
          >
            -
          </button>
          <button
            onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}
            className="zoom-button"
            title="Reset View"
          >
            ⌂
          </button>
        </div>
      </div>

      {/* Color Palette and Controls */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mt-4 shadow-sm">
        <div className="color-palette mb-4">
          {DEFAULT_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`color-swatch ${selectedColor === color ? 'selected' : 'border-gray-300'}`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={customColor}
              onChange={(e) => {
                setCustomColor(e.target.value);
                setSelectedColor(e.target.value);
              }}
              className="color-swatch border-gray-300 cursor-pointer"
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">Custom</span>
          </div>
        </div>

        {/* Purchase Section */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Selected: <span className="font-mono" style={{ color: selectedColor }}>{selectedColor}</span>
          </div>
          <button
            onClick={handlePurchasePixels}
            disabled={isLoading || isPending}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {isLoading || isPending ? "Processing..." : `Buy ${PIXELS_PER_PURCHASE} Pixels ($${PRICE_PER_PURCHASE * 1000} ETH)`}
          </button>
        </div>
      </div>
    </div>
  );
} 