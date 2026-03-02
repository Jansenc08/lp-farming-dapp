"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { useAccount } from "wagmi";
import { useVault } from "@/hooks/useVault";
import { formatTokenAmount, parseAmount } from "@/utils/format";
import { INPUT_CLASS, VAULT_TOAST_IDS } from "@/constants";
import { Spinner } from "@/components/Spinner";
import { CardLoading } from "@/components/CardLoading";
import toast from "react-hot-toast";

export default function VaultPage() {
  const { isConnected } = useAccount();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [lastActionId, setLastActionId] = useState(null);

  const {
    stkBalance,
    vstkBalance,
    pricePerShare,
    pendingReward,
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
    isLoading: vaultLoading,
  } = useVault();

  const depositAmountWei = parseAmount(depositAmount);
  const withdrawAmountWei = parseAmount(withdrawAmount);
  const hasPendingReward = pendingReward != null && pendingReward > 0n;
  const stkValueInVault =
    vstkBalance != null && pricePerShare != null
      ? (vstkBalance * pricePerShare) / BigInt(1e18)
      : 0n;

  useEffect(() => {
    if (!isConfirmed || !hash || !lastActionId) return;
    toast.success("Transaction successful.", { id: lastActionId });
    refetch();
    setDepositAmount("");
    setWithdrawAmount("");
    setLastActionId(null);
    resetWrite();
  }, [isConfirmed, hash, lastActionId, refetch, resetWrite]);

  useEffect(() => {
    if (!writeError) return;
    if (lastActionId) toast.dismiss(lastActionId);
    toast.error("Transaction unsuccessful. Please try again.");
    setLastActionId(null);
    resetWrite();
  }, [writeError, lastActionId, resetWrite]);

  const canDeposit =
    depositAmountWei > 0n &&
    stkBalance != null &&
    stkBalance >= depositAmountWei &&
    !needsApproval(depositAmountWei);
  const canWithdraw =
    withdrawAmountWei > 0n && vstkBalance != null && vstkBalance >= withdrawAmountWei;
  const disabled = !isConnected || isPending;

  const depositLabel =
    depositAmountWei > 0n && stkBalance != null && depositAmountWei > stkBalance ? "Insufficient Balance" : "Deposit";
  const depositButtonDisabled =
    disabled ||
    needsApproval(depositAmountWei) ||
    depositAmountWei <= 0n ||
    (stkBalance != null && depositAmountWei > stkBalance);
  const depositButtonGrey = depositLabel === "Insufficient Balance";

  const withdrawLabel =
    withdrawAmountWei > 0n && vstkBalance != null && withdrawAmountWei > vstkBalance ? "Insufficient Balance" : "Withdraw";
  const withdrawButtonDisabled =
    disabled || withdrawAmountWei <= 0n || (vstkBalance != null && withdrawAmountWei > vstkBalance);
  const withdrawButtonGrey = withdrawLabel === "Insufficient Balance";

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-blue-950/20 pointer-events-none" />
      <Header />

      <main className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">
            Auto-Compound <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">Vault</span>
          </h1>
          <p className="text-slate-400">Deposit STK, earn more STK. Compound rewards automatically.</p>
        </div>

        <div className="mx-auto max-w-lg">
          <div className="rounded-2xl border border-white/10 bg-slate-800/40 p-5 shadow-xl backdrop-blur sm:p-6">
            {vaultLoading ? (
              <CardLoading />
            ) : (
            <>
            <div className="mb-4 grid gap-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Your STK balance</span>
                <span className="text-white">{formatTokenAmount(stkBalance)} STK</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Your vSTK (shares)</span>
                <span className="text-white">{formatTokenAmount(vstkBalance)} vSTK</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Your STK value in vault</span>
                <span className="text-white">{formatTokenAmount(stkValueInVault)} STK</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Price per share</span>
                <span className="text-violet-300">
                  {pricePerShare != null ? formatTokenAmount(pricePerShare, 18, 6) : "—"} STK
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Pending rewards (to compound)</span>
                <span className="text-violet-300">{formatTokenAmount(pendingReward)} STK</span>
              </div>
            </div>

            {needsApproval(depositAmountWei) && (
              <button
                type="button"
                disabled={disabled || isPending}
                onClick={() => {
                  setLastActionId(VAULT_TOAST_IDS.approve);
                  approveStk();
                }}
                className="mb-3 w-full cursor-pointer rounded-xl bg-amber-500/20 py-2.5 font-medium text-amber-400 transition hover:bg-amber-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner className="h-4 w-4 border-white" />
                    Approving...
                  </span>
                ) : (
                  "Approve STK"
                )}
              </button>
            )}

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-slate-400">Deposit STK</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.0"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    disabled={disabled || isPending}
                    className={INPUT_CLASS}
                  />
                  <button
                    type="button"
                    disabled={depositButtonDisabled}
                    onClick={() => {
                      setLastActionId(VAULT_TOAST_IDS.deposit);
                      deposit(depositAmountWei);
                    }}
                    className={`shrink-0 cursor-pointer rounded-xl px-4 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${depositButtonGrey ? "bg-slate-600 text-slate-400" : "bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:from-violet-500 hover:to-blue-500"}`}
                  >
                    {isPending ? <span className="inline-flex items-center gap-1"><Spinner className="h-4 w-4 border-white" />...</span> : depositLabel}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-400">Withdraw (vSTK shares)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.0"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    disabled={disabled || isPending}
                    className={INPUT_CLASS}
                  />
                  <button
                    type="button"
                    disabled={withdrawButtonDisabled}
                    onClick={() => {
                      setLastActionId(VAULT_TOAST_IDS.withdraw);
                      withdraw(withdrawAmountWei);
                    }}
                    className={`shrink-0 cursor-pointer rounded-xl px-4 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${withdrawButtonGrey ? "bg-slate-600 text-slate-400" : "border border-white/20 bg-slate-800 text-white hover:border-violet-500/50 hover:bg-slate-700"}`}
                  >
                    {isPending ? <span className="inline-flex items-center gap-1"><Spinner className="h-4 w-4 border-white" />...</span> : withdrawLabel}
                  </button>
                </div>
              </div>

              <button
                type="button"
                disabled={!isConnected || isPending}
                onClick={() => {
                  setLastActionId(VAULT_TOAST_IDS.compound);
                  compound();
                }}
                className="w-full cursor-pointer rounded-xl bg-emerald-600 py-2.5 font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner className="h-4 w-4 border-white" />
                    ...
                  </span>
                ) : (
                  "Compound"
                )}
              </button>
            </div>
            </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
