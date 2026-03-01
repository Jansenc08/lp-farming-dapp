"use client";

import { Header } from "@/components/Header";
import { StatsBar } from "@/components/StatsBar";
import { PoolCard } from "@/components/PoolCard";
import { PendingPoolProvider } from "@/app/PendingPoolContext";
import { POOLS } from "@/constants";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-blue-950/20 pointer-events-none" />
      <Header />

      <main className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">
            LP Token <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">Farming</span>
          </h1>
          <p className="text-slate-400">Deposit LP tokens, earn FRT rewards. 200 FRT per block.</p>
        </div>

        <div className="mb-8">
          <StatsBar />
        </div>

        <PendingPoolProvider>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {POOLS.map((pool) => (
              <PoolCard key={pool.pid} pool={pool} />
            ))}
          </div>
        </PendingPoolProvider>
      </main>
    </div>
  );
}
