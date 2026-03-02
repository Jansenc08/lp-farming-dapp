"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSwitchChain } from "wagmi";
import { APP_CHAIN_ID, CHAIN_ID_SEPOLIA } from "@/constants";

export function Header() {
  const pathname = usePathname();
  const { isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const isWrongNetwork = isConnected && chain?.id !== APP_CHAIN_ID;
  const linkClass = (path) =>
    `text-sm font-medium transition ${pathname === path ? "text-violet-600" : "text-gray-600 hover:text-gray-900"}`;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-2xl font-bold text-transparent">
            FarmX
          </Link>
          <nav className="flex gap-4">
            <Link href="/" className={linkClass("/")}>Farm</Link>
            <Link href="/vault" className={linkClass("/vault")}>Vault</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isWrongNetwork && (
            <button
              type="button"
              onClick={() => switchChain?.({ chainId: CHAIN_ID_SEPOLIA })}
              className="rounded-lg bg-amber-100 px-3 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-200"
            >
              Switch to Sepolia
            </button>
          )}
          <ConnectButton
            showBalance={false}
            chainStatus="icon"
            accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
          />
        </div>
      </div>
    </header>
  );
}
