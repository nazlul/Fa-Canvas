"use client";

import { useEffect } from "react";
import { useMiniApp } from "@neynar/react";
import { Header } from "~/components/ui/Header";
import { HomeTab } from "~/components/ui/tabs";
import { USE_WALLET } from "~/lib/constants";
import { useNeynarUser } from "../hooks/useNeynarUser";

// --- Types ---
export enum Tab {
  Home = "home",
}

export interface AppProps {
  title?: string;
}

/**
 * App component serves as the main container for the CastCanvas mini app.
 * 
 * This component orchestrates the CastCanvas experience by:
 * - Managing the canvas interface
 * - Handling Farcaster mini app initialization
 * - Coordinating wallet and context state
 * - Providing error handling and loading states
 * 
 * The component integrates with the Neynar SDK for Farcaster functionality
 * and Wagmi for wallet management.
 * 
 * Features:
 * - Collaborative pixel canvas
 * - Color palette selection
 * - Zoom and pan controls
 * - Pixel purchase system
 * - Wallet integration for payments
 * 
 * @param props - Component props
 * @param props.title - Optional title for the mini app (defaults to "CastCanvas")
 * 
 * @example
 * ```tsx
 * <App title="CastCanvas" />
 * ```
 */
export default function App(
  { title }: AppProps = { title: "CastCanvas" }
) {
  // --- Hooks ---
  const {
    isSDKLoaded,
    context,
    setInitialTab,
    setActiveTab,
    currentTab,
  } = useMiniApp();

  // --- Neynar user hook ---
  const { user: neynarUser } = useNeynarUser(context || undefined);

  // --- Effects ---
  /**
   * Sets the initial tab to "home" when the SDK is loaded.
   * 
   * This effect ensures that users start on the canvas when they first
   * load the mini app. It only runs when the SDK is fully loaded to
   * prevent errors during initialization.
   */
  useEffect(() => {
    if (isSDKLoaded) {
      setInitialTab(Tab.Home);
    }
  }, [isSDKLoaded, setInitialTab]);

  // --- Early Returns ---
  if (!isSDKLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="spinner h-8 w-8 mx-auto mb-4"></div>
          <p>Loading CastCanvas...</p>
        </div>
      </div>
    );
  }

  // --- Render ---
  return (
    <div
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
    >
      {/* Header should be full width */}
      <Header neynarUser={neynarUser} />

      {/* Main content */}
      <div className="container py-2 pb-20">
        {/* Main title */}
        <h1 className="text-2xl font-bold text-center mb-4">{title}</h1>

        {/* Canvas content */}
        {currentTab === Tab.Home && <HomeTab />}
      </div>
    </div>
  );
}

