"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT, MASTERCHEF_ABI } from "@/constants";
import toast from "react-hot-toast";

const MASTERCHEF = CONTRACT.MASTERCHEF;

/** Deposit, withdraw, claim. Toasts are loading only; success/error handled in component. */
export function useFarm(pid, refetchPool) {
  const { writeContract, data: hash, isPending: isTxPending, error: writeError, reset: resetWrite } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const isPending = isTxPending || isConfirming;

  const deposit = (amountWei) => {
    if (!MASTERCHEF || pid === undefined) return;
    if (!amountWei || amountWei <= 0n) {
      toast.error("Enter a valid amount");
      return;
    }
    try {
      writeContract({ address: MASTERCHEF, abi: MASTERCHEF_ABI, functionName: "deposit", args: [BigInt(pid), amountWei] });
      toast.loading("Deposit pending...", { id: "deposit" });
    } catch (e) {
      console.error(e);
      toast.error(e?.shortMessage || e?.message || "Deposit failed");
    }
  };

  const withdraw = (amountWei) => {
    if (!MASTERCHEF || pid === undefined) return;
    if (!amountWei || amountWei <= 0n) {
      toast.error("Enter a valid amount");
      return;
    }
    try {
      writeContract({ address: MASTERCHEF, abi: MASTERCHEF_ABI, functionName: "withdraw", args: [BigInt(pid), amountWei] });
      toast.loading("Withdraw pending...", { id: "withdraw" });
    } catch (e) {
      console.error(e);
      toast.error(e?.shortMessage || e?.message || "Withdraw failed");
    }
  };

  const claim = () => {
    if (!MASTERCHEF || pid === undefined) return;
    try {
      writeContract({ address: MASTERCHEF, abi: MASTERCHEF_ABI, functionName: "claim", args: [BigInt(pid)] });
      toast.loading("Claim pending...", { id: "claim" });
    } catch (e) {
      console.error(e);
      toast.error(e?.shortMessage || e?.message || "Claim failed");
    }
  };

  const handleTxError = () => {
    if (writeError) resetWrite();
  };

  return { deposit, withdraw, claim, isPending, isConfirmed, hash, writeError, handleTxError };
}
