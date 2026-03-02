"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import { usePool } from "@/hooks/usePool";
import { useApprove } from "@/hooks/useApprove";
import { useFarm } from "@/hooks/useFarm";
import { usePendingPool } from "@/app/PendingPoolContext";
import { formatTokenAmount, parseAmount, formatTxResultMessage } from "@/utils/format";
import { INPUT_CLASS } from "@/constants";
import { Spinner } from "@/components/Spinner";
import { CardLoading } from "@/components/CardLoading";

export function PoolCard({ pool }) {
  const { pid, name, symbol, lpAddress, allocationPercent } = pool;
  const { isConnected } = useAccount();
  const { pendingPoolId, setPendingPoolId } = usePendingPool();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [lastActionId, setLastActionId] = useState(null);

  const { userInfo, pendingReward, lpBalance, allowance, refetch, isLoading: poolLoading } = usePool(pid, lpAddress);
  const depositedWei = userInfo?.[0] ?? 0n;
  const depositAmountWei = parseAmount(depositAmount);
  const withdrawAmountWei = parseAmount(withdrawAmount);

  const { needsApproval, approve, isPending: isApprovePending, isSuccess: isApproveSuccess, refetchAllowance } = useApprove(lpAddress, depositAmountWei);
  const { deposit, withdraw, claim, isPending: isFarmPending, isConfirmed, writeError, handleTxError, hash } = useFarm(pid, refetch);

  // Approve success → refetch allowance
  useEffect(() => {
    if (isApproveSuccess) {
      toast.success("Approved");
      refetchAllowance();
    }
  }, [isApproveSuccess, refetchAllowance]);

  // Tx confirmed → success toast, clear fields, refetch
  useEffect(() => {
    if (!isConfirmed || !hash || !lastActionId) return;
    toast.success(formatTxResultMessage(lastActionId, true), { id: lastActionId });
    refetch();
    if (lastActionId === "deposit") setDepositAmount("");
    if (lastActionId === "withdraw") setWithdrawAmount("");
    setLastActionId(null);
    setPendingPoolId(null);
  }, [isConfirmed, hash, lastActionId, refetch, setPendingPoolId]);

  // Tx rejected/cancelled → dismiss loading toast, show unsuccessful, clear pending state
  useEffect(() => {
    if (!writeError) return;
    if (lastActionId) toast.dismiss(lastActionId);
    toast.error(formatTxResultMessage(lastActionId, false));
    setPendingPoolId(null);
    setLastActionId(null);
    handleTxError();
  }, [writeError, lastActionId, setPendingPoolId, handleTxError]);

  const hasPendingReward = pendingReward != null && pendingReward > 0n;
  const canDeposit = isConnected && depositAmountWei > 0n && lpBalance != null && lpBalance >= depositAmountWei && !needsApproval;
  const canWithdraw = isConnected && withdrawAmountWei > 0n && depositedWei >= withdrawAmountWei;
  const canClaim = isConnected && hasPendingReward;
  const thisCardPending = pendingPoolId === pid && isFarmPending;
  const disabled = !isConnected || thisCardPending || isApprovePending;
  const inputsLocked = isFarmPending || needsApproval;

  const depositLabel =
    depositAmountWei > 0n && lpBalance != null && depositAmountWei > lpBalance ? "Insufficient Balance" : "Deposit";
  const depositButtonDisabled =
    disabled || needsApproval || depositAmountWei <= 0n || (lpBalance != null && depositAmountWei > lpBalance);
  const depositButtonGrey = depositLabel === "Insufficient Balance";

  const withdrawLabel =
    withdrawAmountWei > 0n && depositedWei != null && withdrawAmountWei > depositedWei ? "Insufficient Balance" : "Withdraw";
  const withdrawButtonDisabled =
    disabled || withdrawAmountWei <= 0n || (depositedWei != null && withdrawAmountWei > depositedWei);
  const withdrawButtonGrey = withdrawLabel === "Insufficient Balance";

  const claimLabel = hasPendingReward ? "Claim rewards" : "No Rewards";
  const claimButtonDisabled = !canClaim || isFarmPending;

  const handleDeposit = () => {
    if (canDeposit) {
      setLastActionId("deposit");
      setPendingPoolId(pid);
      deposit(depositAmountWei);
    } else if (depositAmountWei > 0n && lpBalance != null && lpBalance < depositAmountWei) toast.error("Insufficient balance.");
    else if (depositAmountWei > 0n && needsApproval) toast.error("Please approve first.");
    else if (depositAmountWei <= 0n) toast.error("Please enter an amount to deposit.");
  };

  const handleWithdraw = () => {
    if (canWithdraw) {
      setLastActionId("withdraw");
      setPendingPoolId(pid);
      withdraw(withdrawAmountWei);
    }     else if (withdrawAmountWei > 0n && depositedWei < withdrawAmountWei) toast.error("Insufficient deposited amount.");
    else if (withdrawAmountWei <= 0n) toast.error("Please enter an amount to withdraw.");
  };

  const handleClaim = () => {
    if (canClaim) {
      setLastActionId("claim");
      setPendingPoolId(pid);
      claim();
    } else if (!hasPendingReward) toast.error("No rewards to claim.");
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-800/40 p-5 shadow-xl backdrop-blur transition hover:border-violet-500/30 hover:bg-slate-800/60 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          {name} <span className="text-violet-400">({symbol})</span>
        </h3>
        <span className="rounded-full bg-violet-500/20 px-3 py-0.5 text-sm font-medium text-violet-300">
          {allocationPercent}% allocation
        </span>
      </div>

      {poolLoading ? (
        <CardLoading />
      ) : (
        <>
          <div className="mb-4 grid gap-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Your deposit</span>
              <span className="text-white">{formatTokenAmount(depositedWei)} {symbol}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Pending rewards</span>
              <span className="text-violet-300">{formatTokenAmount(pendingReward)} FRT</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Wallet balance</span>
              <span className="text-white">{formatTokenAmount(lpBalance)} {symbol}</span>
            </div>
          </div>

          {needsApproval && (
            <button type="button" disabled={disabled} onClick={() => approve()} className="mb-3 w-full cursor-pointer rounded-xl bg-amber-500/20 py-2.5 font-medium text-amber-400 transition hover:bg-amber-500/30 disabled:cursor-not-allowed disabled:opacity-50">
              {isApprovePending ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner className="h-4 w-4 border-amber-400" />
                  Approving...
                </span>
              ) : (
                `Approve ${symbol}`
              )}
            </button>
          )}

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Deposit</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.0"
                  value={depositAmount}
                  onChange={(e) => !inputsLocked && setDepositAmount(e.target.value)}
                  disabled={!isConnected || inputsLocked}
                  readOnly={inputsLocked}
                  aria-readonly={inputsLocked}
                  className={INPUT_CLASS}
                />
                <button
                  type="button"
                  disabled={depositButtonDisabled}
                  onClick={handleDeposit}
                  className={`shrink-0 cursor-pointer rounded-xl px-4 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${depositButtonGrey ? "bg-slate-600 text-slate-400" : "bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:from-violet-500 hover:to-blue-500"}`}
                >
                  {isFarmPending ? <span className="inline-flex items-center gap-1"><Spinner className="h-4 w-4 border-white" />...</span> : depositLabel}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">Withdraw</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.0"
                  value={withdrawAmount}
                  onChange={(e) => !inputsLocked && setWithdrawAmount(e.target.value)}
                  disabled={!isConnected || inputsLocked}
                  readOnly={inputsLocked}
                  aria-readonly={inputsLocked}
                  className={INPUT_CLASS}
                />
                <button
                  type="button"
                  disabled={withdrawButtonDisabled}
                  onClick={handleWithdraw}
                  className={`shrink-0 cursor-pointer rounded-xl px-4 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${withdrawButtonGrey ? "bg-slate-600 text-slate-400" : "border border-white/20 bg-slate-800 text-white hover:border-violet-500/50 hover:bg-slate-700"}`}
                >
                  {isFarmPending ? <span className="inline-flex items-center gap-1"><Spinner className="h-4 w-4 border-white" />...</span> : withdrawLabel}
                </button>
              </div>
            </div>

            <button
              type="button"
              disabled={claimButtonDisabled}
              onClick={handleClaim}
              className={`w-full cursor-pointer rounded-xl py-2.5 font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${hasPendingReward ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-blue-500" : "bg-slate-600 text-slate-400"}`}
            >
              {isFarmPending ? <span className="inline-flex items-center gap-2"><Spinner className="h-4 w-4 border-violet-400" />...</span> : claimLabel}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
