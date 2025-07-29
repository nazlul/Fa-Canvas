'use client';

import { WagmiProviderWrapper } from "~/components/providers/WagmiProvider";
import { NeynarProvider } from "~/components/providers/NeynarProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProviderWrapper>
      <NeynarProvider>
        {children}
      </NeynarProvider>
    </WagmiProviderWrapper>
  );
}
