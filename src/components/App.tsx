"use client";

import { useEffect } from "react";
import { useMiniApp } from "@neynar/react";
import { Header } from "~/components/ui/Header";
import { HomeTab } from "~/components/ui/tabs";
import { useNeynarUser } from "../hooks/useNeynarUser";

export enum Tab {
  Home = "home",
}

export interface AppProps {
  title?: string;
}

export default function App(
  { title }: AppProps = { title: "CastCanvas" }
) {
  const {
    isSDKLoaded,
    context,
    setInitialTab,
    currentTab,
  } = useMiniApp();

  const { user: neynarUser } = useNeynarUser(context || undefined);

  useEffect(() => {
    if (isSDKLoaded) {
      setInitialTab(Tab.Home);
    }
  }, [isSDKLoaded, setInitialTab]);

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

  return (
    <div
      className="h-screen flex flex-col"
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
    >
      <Header neynarUser={neynarUser} />

      <div className="flex-1">
        {currentTab === Tab.Home && <HomeTab />}
      </div>
    </div>
  );
}

