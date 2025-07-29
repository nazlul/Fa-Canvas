'use client';

import { WagmiProvider } from "~/components/providers/WagmiProvider";
import { NeynarProvider } from "~/components/providers/NeynarProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider>
      <NeynarProvider>
        {children}
      </NeynarProvider>
    </WagmiProvider>
  );
}
