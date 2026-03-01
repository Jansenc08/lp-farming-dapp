"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSwitchChain } from "wagmi";
import { formatAddress } from "@/utils/format";
import { APP_CHAIN_ID, CHAIN_ID_SEPOLIA } from "@/constants";

export function Header() {
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const isWrongNetwork = isConnected && chain?.id !== APP_CHAIN_ID;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <span className="bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-xl font-bold text-transparent">
          FarmX
        </span>

        <div className="flex items-center gap-3">
          {isWrongNetwork && (
            <button
              type="button"
              onClick={() => switchChain?.({ chainId: CHAIN_ID_SEPOLIA })}
              className="rounded-lg bg-amber-500/20 px-3 py-1.5 text-sm font-medium text-amber-400 transition hover:bg-amber-500/30"
            >
              Switch to Sepolia
            </button>
          )}
          <ConnectButton
            showBalance={false}
            chainStatus="icon"
            accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
          />
          {isConnected && address && (
            <span className="hidden text-sm text-slate-400 sm:inline">{formatAddress(address)}</span>
          )}
        </div>
      </div>
    </header>
  );
}
