"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT, ERC20_ABI, MAX_UINT256 } from "@/constants";

/** LP token approval for MasterChef. needsApproval when allowance < amount or allowance is zero. */
export function useApprove(lpAddress, amountWei) {
  const { address } = useAccount();

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: lpAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && CONTRACT.MASTERCHEF ? [address, CONTRACT.MASTERCHEF] : undefined,
  });

  const { writeContract, data: hash, isPending: isTxPending, error: approveError, reset: resetApprove } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const needsApproval =
    amountWei != null &&
    (amountWei > 0n ? (allowance == null || allowance < amountWei) : allowance === 0n);

  const approve = () => {
    if (!lpAddress || !CONTRACT.MASTERCHEF) return;
    writeContract({
      address: lpAddress,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CONTRACT.MASTERCHEF, MAX_UINT256],
    });
  };

  return {
    allowance,
    needsApproval: !!needsApproval,
    approve,
    isPending: isTxPending || isConfirming,
    isSuccess: isConfirmed,
    error: approveError,
    refetchAllowance,
    resetApprove,
    hash,
  };
}
