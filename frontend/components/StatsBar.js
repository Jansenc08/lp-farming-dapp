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
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 text-base shadow-sm sm:gap-6">
      <div className="flex items-center gap-2">
        <span className="text-gray-600">Daily Rewards</span>
        <span className="font-semibold text-gray-900">
          {REWARD_PER_BLOCK} <span className="text-violet-600">FRT</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-600">Active Pools</span>
        <span className="font-semibold text-gray-900">{poolLength != null ? Number(poolLength) : "—"}</span>
      </div>
    </div>
  );
}
