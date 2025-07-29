"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAccount, useWriteContract, useChainId, useSwitchChain } from "wagmi";
import { parseEther } from "viem";
import { CANVAS_SIZE, DAILY_PIXEL_LIMIT, PIXELS_PER_PURCHASE, PRICE_PER_PURCHASE, REQUIRED_CHAIN_ID } from "~/lib/constants";

const CONTRACT_ABI = [
  "function purchasePixels() external payable",
  "function getAvailablePixels(address user) external view returns (uint256)",
  "function getDailyPixels(address user) external view returns (uint256)",
  "function userPurchasedPixels(address user) external view returns (uint256)",
  "event PixelPurchased(address indexed user, uint256 amount, uint256 pixels)"
];

const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

interface Pixel {
  x: number;
  y: number;
  color: string;
  timestamp: number;
  user: string;
}

const DEFAULT_COLORS = [
  "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF", 
  "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500", "#800080",
  "#008000", "#FFC0CB", "#A52A2A", "#808080", "#FFD700"
];

export function HomeTab() {
  const [selectedColor, setSelectedColor] = useState("#FFFFFF");
  const [customColor, setCustomColor] = useState("#FFFFFF");
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastDragPos, setLastDragPos] = useState({ x: 0, y: 0 });
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [remainingPixels, setRemainingPixels] = useState(DAILY_PIXEL_LIMIT);
  const [isLoading, setIsLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { writeContract, isPending, error } = useWriteContract();

  useEffect(() => {
    const loadPixels = async () => {
      try {
        const response = await fetch('/api/canvas');
        const data = await response.json();
        if (data.success) {
          setPixels(data.pixels);
        }
      } catch (_error) {
        console.error('Failed to load pixels:', _error);
      }
    };

    loadPixels();
  }, []);

  useEffect(() => {
    if (address) {
      const loadUserPixels = async () => {
        try {
          const response = await fetch(`/api/canvas/user?address=${address}`);
          const data = await response.json();
          if (data.success) {
            setRemainingPixels(data.remainingPixels);
          }
        } catch (_error) {
          console.error('Failed to load user pixels:', _error);
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
    } catch (_error) {
      console.error('Failed to place pixel:', _error);
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
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(20, zoom * zoomFactor));
    
    const zoomRatio = newZoom / zoom;
    const newOffsetX = mouseX - (mouseX - offset.x) * zoomRatio;
    const newOffsetY = mouseY - (mouseY - offset.y) * zoomRatio;
    
    setZoom(newZoom);
    setOffset({ x: newOffsetX, y: newOffsetY });
  }, [zoom, offset]);

  const handlePurchasePixels = async () => {
    if (!address) {
      alert("Please connect your wallet first!");
      return;
    }

    if (chainId !== REQUIRED_CHAIN_ID) {
      try {
        await switchChain({ chainId: REQUIRED_CHAIN_ID });
      } catch (_error) {
        alert("Please switch to Base network to purchase pixels!");
        return;
      }
    }

    setPurchaseError("");
    setIsLoading(true);

    try {
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'purchasePixels',
        value: parseEther(PRICE_PER_PURCHASE.toString()),
      });
    } catch (_error) {
      console.error('Failed to purchase pixels:', _error);
      setPurchaseError("Failed to purchase pixels. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isPending && !error && address) {
      const refreshPixels = async () => {
        try {
          const response = await fetch(`/api/canvas/user?address=${address}`);
          const data = await response.json();
          if (data.success) {
            setRemainingPixels(data.remainingPixels);
          }
        } catch (_error) {
          console.error('Failed to refresh pixels:', _error);
        }
      };

      refreshPixels();
    }
  }, [isPending, error, address]);

  return (
    <div className="flex flex-col h-full">
      <div className="bg-black text-white p-2 rounded-lg mb-2 shadow-sm">
        <div className="flex justify-between items-center text-sm">
          <span className="font-bold">CastCanvas</span>
          <span>{remainingPixels} pixels left</span>
        </div>
        {chainId !== REQUIRED_CHAIN_ID && (
          <div className="text-xs text-yellow-400 mt-1">
            ⚠️ Switch to Base network to purchase pixels
          </div>
        )}
      </div>

      <div className="flex-1 relative bg-black rounded-lg overflow-hidden border border-gray-700">
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
          <div
            className="absolute"
            style={{
              width: CANVAS_SIZE * zoom,
              height: CANVAS_SIZE * zoom,
              transform: `translate(${offset.x}px, ${offset.y}px)`,
              backgroundColor: '#000000',
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: `${zoom}px ${zoom}px`
            }}
          >
            {pixels.map((pixel) => (
              <div
                key={`${pixel.x}-${pixel.y}-${pixel.timestamp}`}
                className="pixel"
                style={{
                  left: pixel.x * zoom,
                  top: pixel.y * zoom,
                  width: zoom,
                  height: zoom,
                  backgroundColor: pixel.color,
                  border: zoom > 2 ? '1px solid rgba(255,255,255,0.2)' : 'none'
                }}
                title={`${pixel.color} at (${pixel.x}, ${pixel.y})`}
              />
            ))}
          </div>
        </div>

        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => setZoom(prev => Math.min(20, prev * 1.2))}
            className="zoom-button bg-gray-800 text-white hover:bg-gray-700"
          >
            +
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(0.1, prev / 1.2))}
            className="zoom-button bg-gray-800 text-white hover:bg-gray-700"
          >
            -
          </button>
          <button
            onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}
            className="zoom-button bg-gray-800 text-white hover:bg-gray-700"
            title="Reset View"
          >
            ⌂
          </button>
        </div>

        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      <div className="bg-black text-white p-3 rounded-lg mt-2 shadow-sm">
        <div className="color-palette mb-3">
          {DEFAULT_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`color-swatch ${selectedColor === color ? 'selected' : 'border-gray-600'}`}
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
              className="color-swatch border-gray-600 cursor-pointer"
            />
            <span className="text-xs text-gray-400">Custom</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-400">
            Selected: <span className="font-mono" style={{ color: selectedColor }}>{selectedColor}</span>
          </div>
          <button
            onClick={handlePurchasePixels}
            disabled={isLoading || isPending || chainId !== REQUIRED_CHAIN_ID}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-xs font-medium transition-colors"
          >
            {isLoading || isPending ? "Processing..." : `Buy ${PIXELS_PER_PURCHASE} Pixels (${PRICE_PER_PURCHASE} ETH)`}
          </button>
        </div>
        {purchaseError && (
          <div className="text-xs text-red-400 mt-1">{purchaseError}</div>
        )}
      </div>
    </div>
  );
} 