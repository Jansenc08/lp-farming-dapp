"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT, ERC20_ABI, VAULT_ABI, REFETCH_INTERVAL_MS, MAX_UINT256 } from "@/constants";
import toast from "react-hot-toast";
import { getTransactionErrorMessage } from "@/utils/errorHandler";

/** Vault reads and writes. Refetch every 15s when connected. */
export function useVault() {
  const { address } = useAccount();
  const hasAddress = !!address && !!CONTRACT.AUTO_COMPOUND_VAULT;

  const stkBalance = useReadContract({
    address: CONTRACT.STAKING_TOKEN,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const vstkBalance = useReadContract({
    address: CONTRACT.VAULT_TOKEN,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const pricePerShare = useReadContract({
    address: CONTRACT.AUTO_COMPOUND_VAULT,
    abi: VAULT_ABI,
    functionName: "getPricePerShare",
    query: { refetchInterval: hasAddress ? REFETCH_INTERVAL_MS : false },
  });

  const pendingReward = useReadContract({
    address: CONTRACT.AUTO_COMPOUND_VAULT,
    abi: VAULT_ABI,
    functionName: "pendingReward",
    query: { refetchInterval: hasAddress ? REFETCH_INTERVAL_MS : false },
  });

  const allowance = useReadContract({
    address: CONTRACT.STAKING_TOKEN,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && CONTRACT.AUTO_COMPOUND_VAULT ? [address, CONTRACT.AUTO_COMPOUND_VAULT] : undefined,
  });

  const vaultLoading = [stkBalance, vstkBalance, pricePerShare, pendingReward, allowance].some((q) => q.isLoading);

  const { writeContract, data: hash, isPending: isTxPending, error: writeError, reset: resetWrite } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const isPending = isTxPending || isConfirming;

  const refetch = () =>
    Promise.all([
      stkBalance.refetch(),
      vstkBalance.refetch(),
      pricePerShare.refetch(),
      pendingReward.refetch(),
      allowance.refetch(),
    ]);

  const deposit = (amountWei) => {
    if (!CONTRACT.AUTO_COMPOUND_VAULT || !amountWei || amountWei <= 0n) {
      toast.error("Please enter a valid amount.");
      return;
    }
    try {
      writeContract({
        address: CONTRACT.AUTO_COMPOUND_VAULT,
        abi: VAULT_ABI,
        functionName: "deposit",
        args: [amountWei],
      });
      toast.loading("Deposit pending...", { id: "vault-deposit" });
    } catch (e) {
      toast.error(getTransactionErrorMessage(e, "Deposit failed. Please try again."));
    }
  };

  const withdraw = (sharesWei) => {
    if (!CONTRACT.AUTO_COMPOUND_VAULT || !sharesWei || sharesWei <= 0n) {
      toast.error("Please enter a valid amount.");
      return;
    }
    try {
      writeContract({
        address: CONTRACT.AUTO_COMPOUND_VAULT,
        abi: VAULT_ABI,
        functionName: "withdraw",
        args: [sharesWei],
      });
      toast.loading("Withdraw pending...", { id: "vault-withdraw" });
    } catch (e) {
      toast.error(getTransactionErrorMessage(e, "Withdraw failed. Please try again."));
    }
  };

  const compound = () => {
    if (!CONTRACT.AUTO_COMPOUND_VAULT) return;
    try {
      writeContract({
        address: CONTRACT.AUTO_COMPOUND_VAULT,
        abi: VAULT_ABI,
        functionName: "compound",
      });
      toast.loading("Compound pending...", { id: "vault-compound" });
    } catch (e) {
      toast.error(getTransactionErrorMessage(e, "Compound failed. Please try again."));
    }
  };

  const approveStk = () => {
    if (!CONTRACT.STAKING_TOKEN || !CONTRACT.AUTO_COMPOUND_VAULT) return;
    try {
      writeContract({
        address: CONTRACT.STAKING_TOKEN,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [CONTRACT.AUTO_COMPOUND_VAULT, MAX_UINT256],
      });
      toast.loading("Approve pending...", { id: "vault-approve" });
    } catch (e) {
      toast.error(getTransactionErrorMessage(e, "Approve failed. Please try again."));
    }
  };

  /** Same as pools: true when allowance is 0 (show Approve even with no amount) or when allowance < amount. */
  const needsApproval = (amountWei) =>
    amountWei != null &&
    (allowance.data == null ? false : amountWei > 0n ? allowance.data < amountWei : allowance.data === 0n);

  return {
    stkBalance: stkBalance.data,
    vstkBalance: vstkBalance.data,
    pricePerShare: pricePerShare.data,
    pendingReward: pendingReward.data,
    allowance: allowance.data,
    isLoading: vaultLoading,
    refetch,
    deposit,
    withdraw,
    compound,
    approveStk,
    isPending,
    isConfirmed,
    hash,
    writeError,
    resetWrite,
    needsApproval,
  };
}
