"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { useAccount } from "wagmi";
import { useVault } from "@/hooks/useVault";
import { formatTokenAmount, formatAmountForInput, parseAmount, formatNumberWithCommas, sanitizeAmountInput } from "@/utils/format";
import { INPUT_CLASS, VAULT_TOAST_IDS } from "@/constants";
import { Spinner } from "@/components/Spinner";
import { CardLoading } from "@/components/CardLoading";
import { ConnectWalletPrompt } from "@/components/ConnectWalletPrompt";
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

  const depositButtonDisabled =
    disabled ||
    needsApproval(depositAmountWei) ||
    depositAmountWei <= 0n ||
    (stkBalance != null && depositAmountWei > stkBalance);
  const depositButtonGrey = depositAmountWei > 0n && stkBalance != null && depositAmountWei > stkBalance;

  const withdrawButtonDisabled =
    disabled || withdrawAmountWei <= 0n || (vstkBalance != null && withdrawAmountWei > vstkBalance);
  const withdrawButtonGrey = withdrawAmountWei > 0n && vstkBalance != null && withdrawAmountWei > vstkBalance;

  const balanceError =
    depositAmountWei > 0n && stkBalance != null && depositAmountWei > stkBalance
      ? "Not enough balance."
      : withdrawAmountWei > 0n && vstkBalance != null && withdrawAmountWei > vstkBalance
        ? "Not enough vault shares."
        : null;

  const btnBase = "shrink-0 cursor-pointer rounded-xl px-4 py-2.5 text-base font-medium transition disabled:cursor-not-allowed disabled:opacity-50";
  const btnPrimary = "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-sm hover:from-violet-500 hover:to-blue-500 hover:shadow";
  const btnSecondary = "border border-gray-300 bg-white text-gray-700 hover:border-violet-400 hover:bg-gray-50";
  const btnMuted = "bg-gray-200 text-gray-500";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-5xl font-bold text-gray-900 sm:text-6xl">
            Auto-Compound <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">Vault</span>
          </h1>
          <p className="text-lg text-gray-600">Deposit STK tokens and earn more STK automatically. Rewards are compounded for you.</p>
        </div>

        {!isConnected ? (
          <div className="mx-auto max-w-lg">
            <ConnectWalletPrompt />
          </div>
        ) : (
        <div className="mx-auto max-w-lg">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-6">
            {vaultLoading ? (
              <CardLoading />
            ) : (
            <>
            <div className="mb-5 grid gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Available STK</span>
                <span className="font-semibold text-gray-900">{formatTokenAmount(stkBalance)} STK</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Your Vault Shares (vSTK)</span>
                <span className="font-semibold text-gray-900">{formatTokenAmount(vstkBalance)} vSTK</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Your Total Vault Value</span>
                <span className="font-semibold text-gray-900">{formatTokenAmount(stkValueInVault)} STK</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Value Per Share</span>
                <span className="font-semibold text-violet-600">
                  {pricePerShare != null ? formatTokenAmount(pricePerShare, 18, 6) : "—"} STK
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rewards Ready to Compound</span>
                <span className="font-semibold text-violet-600">{formatTokenAmount(pendingReward)} STK</span>
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
                className="mb-4 w-full cursor-pointer rounded-xl bg-amber-100 py-2.5 text-base font-medium text-amber-800 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner className="h-4 w-4 border-amber-600" />
                    Approving...
                  </span>
                ) : (
                  "Approve STK"
                )}
              </button>
            )}

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-gray-600">Stake STK</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.0"
                    value={formatNumberWithCommas(depositAmount)}
                    onChange={(e) => setDepositAmount(sanitizeAmountInput(e.target.value))}
                    disabled={disabled || isPending}
                    className={INPUT_CLASS}
                  />
                  <button
                    type="button"
                    onClick={() => stkBalance != null && stkBalance > 0n && setDepositAmount(formatAmountForInput(stkBalance))}
                    disabled={disabled || !stkBalance || stkBalance === 0n}
                    className="shrink-0 rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-violet-600 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Max
                  </button>
                  <button
                    type="button"
                    disabled={depositButtonDisabled}
                    onClick={() => {
                      setLastActionId(VAULT_TOAST_IDS.deposit);
                      deposit(depositAmountWei);
                    }}
                    className={`${btnBase} min-w-[100px] ${depositButtonGrey ? btnMuted : btnPrimary}`}
                  >
                    {isPending ? <span className="inline-flex items-center gap-1"><Spinner className="h-4 w-4 border-white" />...</span> : "Stake"}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-gray-600">Unstake (enter vSTK shares)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.0"
                    value={formatNumberWithCommas(withdrawAmount)}
                    onChange={(e) => setWithdrawAmount(sanitizeAmountInput(e.target.value))}
                    disabled={disabled || isPending}
                    className={INPUT_CLASS}
                  />
                  <button
                    type="button"
                    onClick={() => vstkBalance != null && vstkBalance > 0n && setWithdrawAmount(formatAmountForInput(vstkBalance))}
                    disabled={disabled || !vstkBalance || vstkBalance === 0n}
                    className="shrink-0 rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-violet-600 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Max
                  </button>
                  <button
                    type="button"
                    disabled={withdrawButtonDisabled}
                    onClick={() => {
                      setLastActionId(VAULT_TOAST_IDS.withdraw);
                      withdraw(withdrawAmountWei);
                    }}
                    className={`${btnBase} min-w-[100px] ${withdrawButtonGrey ? btnMuted : btnSecondary}`}
                  >
                    {isPending ? <span className="inline-flex items-center gap-1"><Spinner className="h-4 w-4 border-violet-600" />...</span> : "Unstake"}
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
                className={`w-full ${btnBase} py-2.5 bg-emerald-600 text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner className="h-4 w-4 border-white" />
                    ...
                  </span>
                ) : (
                  "Compound Now"
                )}
              </button>
              {balanceError && (
                <p className="mt-2 text-center text-sm text-red-600" role="alert">{balanceError}</p>
              )}
            </div>
            </>
            )}
          </div>
        </div>
        )}
      </main>
    </div>
  );
}
