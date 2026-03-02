"use client";

import { useAccount } from "wagmi";
import { Header } from "@/components/Header";
import { StatsBar } from "@/components/StatsBar";
import { PoolCard } from "@/components/PoolCard";
import { ConnectWalletPrompt } from "@/components/ConnectWalletPrompt";
import { PendingPoolProvider } from "@/app/PendingPoolContext";
import { POOLS } from "@/constants";

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-5xl font-bold text-gray-900 sm:text-6xl">
            LP Token <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">Farming</span>
          </h1>
          <p className="text-lg text-gray-600">Stake your LP tokens and earn FRT rewards automatically.</p>
        </div>

        <div className="mb-10">
          <StatsBar />
        </div>

        {!isConnected ? (
          <ConnectWalletPrompt />
        ) : (
          <PendingPoolProvider>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {POOLS.map((pool) => (
                <PoolCard key={pool.pid} pool={pool} />
              ))}
            </div>
          </PendingPoolProvider>
        )}
      </main>
    </div>
  );
}
