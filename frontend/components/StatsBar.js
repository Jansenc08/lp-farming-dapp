"use client";

import { useReadContract } from "wagmi";
import { CONTRACT, MASTERCHEF_ABI, REWARD_PER_BLOCK } from "@/constants";

export function StatsBar() {
  const { data: poolLength } = useReadContract({
    address: CONTRACT.MASTERCHEF,
    abi: MASTERCHEF_ABI,
    functionName: "poolLength",
  });

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-slate-800/60 px-4 py-3 backdrop-blur sm:gap-6">
      <div className="flex items-center gap-2">
        <span className="text-slate-400">Rewards per block</span>
        <span className="font-semibold text-white">
          {REWARD_PER_BLOCK} <span className="text-violet-400">FRT</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-slate-400">Pools</span>
        <span className="font-semibold text-white">{poolLength != null ? Number(poolLength) : "—"}</span>
      </div>
    </div>
  );
}
