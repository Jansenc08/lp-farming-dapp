"use client";

import { useAccount, useReadContract } from "wagmi";
import { CONTRACT, MASTERCHEF_ABI, ERC20_ABI, REFETCH_INTERVAL_MS } from "@/constants";

/** Pool + user stats for one pool. Pending rewards refetch every 15s. */
export function usePool(pid, lpAddress) {
  const { address } = useAccount();
  const hasAddress = !!CONTRACT.MASTERCHEF && !!lpAddress;

  const poolInfo = useReadContract({
    address: CONTRACT.MASTERCHEF,
    abi: MASTERCHEF_ABI,
    functionName: "poolInfo",
    args: [BigInt(pid)],
  });

  const userInfo = useReadContract({
    address: CONTRACT.MASTERCHEF,
    abi: MASTERCHEF_ABI,
    functionName: "userInfo",
    args: address && hasAddress ? [BigInt(pid), address] : undefined,
  });

  const pendingReward = useReadContract({
    address: CONTRACT.MASTERCHEF,
    abi: MASTERCHEF_ABI,
    functionName: "pendingReward",
    args: address && hasAddress ? [BigInt(pid), address] : undefined,
    query: { refetchInterval: address && hasAddress ? REFETCH_INTERVAL_MS : false },
  });

  const lpBalance = useReadContract({
    address: lpAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address && lpAddress ? [address] : undefined,
  });

  const allowance = useReadContract({
    address: lpAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && CONTRACT.MASTERCHEF && lpAddress ? [address, CONTRACT.MASTERCHEF] : undefined,
  });

  const refetch = () =>
    Promise.all([poolInfo.refetch(), userInfo.refetch(), pendingReward.refetch(), lpBalance.refetch(), allowance.refetch()]);

  return {
    poolInfo: poolInfo.data,
    userInfo: userInfo.data,
    pendingReward: pendingReward.data,
    lpBalance: lpBalance.data,
    allowance: allowance.data,
    refetch,
    isLoading: [poolInfo, userInfo, pendingReward, lpBalance, allowance].some((q) => q.isLoading),
  };
}
