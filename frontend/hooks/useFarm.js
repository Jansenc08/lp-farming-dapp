"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT, MASTERCHEF_ABI } from "@/constants";
import toast from "react-hot-toast";
import { getTransactionErrorMessage } from "@/utils/errorHandler";

/** Deposit, withdraw, claim. Toasts are loading only; success/error handled in component. */
export function useFarm(pid, refetchPool) {
  const { writeContract, data: hash, isPending: isTxPending, error: writeError, reset: resetWrite } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const isPending = isTxPending || isConfirming;

  const deposit = (amountWei) => {
    if (!CONTRACT.MASTERCHEF || pid === undefined) return;
    if (!amountWei || amountWei <= 0n) {
      toast.error("Please enter a valid amount.");
      return;
    }
    try {
      writeContract({
        address: CONTRACT.MASTERCHEF,
        abi: MASTERCHEF_ABI,
        functionName: "deposit",
        args: [BigInt(pid), amountWei],
      });
      toast.loading("Deposit pending...", { id: "deposit" });
    } catch (e) {
      toast.error(getTransactionErrorMessage(e, "Deposit failed. Please try again."));
    }
  };

  const withdraw = (amountWei) => {
    if (!CONTRACT.MASTERCHEF || pid === undefined) return;
    if (!amountWei || amountWei <= 0n) {
      toast.error("Please enter a valid amount.");
      return;
    }
    try {
      writeContract({
        address: CONTRACT.MASTERCHEF,
        abi: MASTERCHEF_ABI,
        functionName: "withdraw",
        args: [BigInt(pid), amountWei],
      });
      toast.loading("Withdraw pending...", { id: "withdraw" });
    } catch (e) {
      toast.error(getTransactionErrorMessage(e, "Withdraw failed. Please try again."));
    }
  };

  const claim = () => {
    if (!CONTRACT.MASTERCHEF || pid === undefined) return;
    try {
      writeContract({
        address: CONTRACT.MASTERCHEF,
        abi: MASTERCHEF_ABI,
        functionName: "claim",
        args: [BigInt(pid)],
      });
      toast.loading("Claim pending...", { id: "claim" });
    } catch (e) {
      toast.error(getTransactionErrorMessage(e, "Claim failed. Please try again."));
    }
  };

  const handleTxError = () => {
    if (writeError) resetWrite();
  };

  return { deposit, withdraw, claim, isPending, isConfirmed, hash, writeError, handleTxError };
}
