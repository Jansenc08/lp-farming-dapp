"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT, ERC20_ABI } from "@/constants";

const MASTERCHEF = CONTRACT.MASTERCHEF;
const MAX_UINT256 = 2n ** 256n - 1n;

/** LP token approval for MasterChef. needsApproval when allowance < amount or allowance is zero. */
export function useApprove(lpAddress, amountWei) {
  const { address } = useAccount();

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: lpAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && MASTERCHEF ? [address, MASTERCHEF] : undefined,
  });

  const { writeContract, data: hash, isPending: isTxPending, error: approveError, reset: resetApprove } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const needsApproval =
    amountWei != null &&
    (amountWei > 0n ? (allowance == null || allowance < amountWei) : allowance === 0n);

  const approve = () => {
    if (!lpAddress) return;
    try {
      writeContract({
        address: lpAddress,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [MASTERCHEF, MAX_UINT256],
      });
    } catch (e) {
      console.error(e);
      throw e;
    }
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
