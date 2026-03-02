"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http, injected } from "wagmi";
import { sepolia } from "viem/chains";
import { RainbowKitProvider, lightTheme, getDefaultConfig } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

const config = projectId
  ? getDefaultConfig({
      appName: "FarmX",
      projectId,
      chains: [sepolia],
      ssr: true,
    })
  : createConfig({
      chains: [sepolia],
      transports: { [sepolia.id]: http() },
      connectors: [injected()],
      ssr: true,
    });

const queryClient = new QueryClient();

const rainbowTheme = lightTheme({
  accentColor: "#7c3aed",
  accentColorForeground: "white",
  borderRadius: "medium",
});

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider initialChain={sepolia} theme={rainbowTheme}>
          {children}
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
