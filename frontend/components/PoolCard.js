"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import { usePool } from "@/hooks/usePool";
import { useApprove } from "@/hooks/useApprove";
import { useFarm } from "@/hooks/useFarm";
import { usePendingPool } from "@/app/PendingPoolContext";
import { formatTokenAmount, formatAmountForInput, parseAmount, formatTxResultMessage, formatNumberWithCommas, sanitizeAmountInput } from "@/utils/format";
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

  const depositButtonDisabled =
    disabled || needsApproval || depositAmountWei <= 0n || (lpBalance != null && depositAmountWei > lpBalance);
  const depositButtonGrey = depositAmountWei > 0n && lpBalance != null && depositAmountWei > lpBalance;

  const withdrawButtonDisabled =
    disabled || withdrawAmountWei <= 0n || (depositedWei != null && withdrawAmountWei > depositedWei);
  const withdrawButtonGrey = withdrawAmountWei > 0n && depositedWei != null && withdrawAmountWei > depositedWei;

  const balanceError =
    depositAmountWei > 0n && lpBalance != null && depositAmountWei > lpBalance
      ? "Not enough balance."
      : withdrawAmountWei > 0n && depositedWei != null && withdrawAmountWei > depositedWei
        ? "Not enough staked amount."
        : null;

  const claimLabel = hasPendingReward ? "Claim FRT" : "No Rewards Yet";
  const claimButtonDisabled = !canClaim || isFarmPending;

  const handleDeposit = () => {
    if (canDeposit) {
      setLastActionId("deposit");
      setPendingPoolId(pid);
      deposit(depositAmountWei);
    } else if (depositAmountWei > 0n && lpBalance != null && lpBalance < depositAmountWei) toast.error("Not enough balance.");
    else if (depositAmountWei > 0n && needsApproval) toast.error("Please approve first.");
    else if (depositAmountWei <= 0n) toast.error("Please enter an amount to deposit.");
  };

  const handleWithdraw = () => {
    if (canWithdraw) {
      setLastActionId("withdraw");
      setPendingPoolId(pid);
      withdraw(withdrawAmountWei);
    } else if (withdrawAmountWei > 0n && depositedWei < withdrawAmountWei) toast.error("Not enough staked amount.");
    else if (withdrawAmountWei <= 0n) toast.error("Please enter an amount to withdraw.");
  };

  const handleClaim = () => {
    if (canClaim) {
      setLastActionId("claim");
      setPendingPoolId(pid);
      claim();
    } else if (!hasPendingReward) toast.error("No rewards to claim.");
  };

  const btnBase = "shrink-0 cursor-pointer rounded-xl px-4 py-2.5 text-base font-medium transition disabled:cursor-not-allowed disabled:opacity-50";
  const btnPrimary = "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-sm hover:from-violet-500 hover:to-blue-500 hover:shadow";
  const btnSecondary = "border border-gray-300 bg-white text-gray-700 hover:border-violet-400 hover:bg-gray-50";
  const btnMuted = "bg-gray-200 text-gray-500";

  const allocationBadgeClass =
    allocationPercent === 50
      ? "bg-green-100 text-green-700"
      : allocationPercent === 30
        ? "bg-blue-100 text-blue-700"
        : allocationPercent === 20
          ? "bg-orange-100 text-orange-700"
          : "bg-violet-100 text-violet-700";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">
          {name}
        </h3>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${allocationBadgeClass}`}>
          {allocationPercent}% allocation
        </span>
      </div>

      {poolLoading ? (
        <CardLoading />
      ) : (
        <>
          <div className="mb-5 grid gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Staked Amount</span>
              <span className="font-semibold text-gray-900">{formatTokenAmount(depositedWei)} {symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Unclaimed Rewards</span>
              <span className="font-semibold text-violet-600">{formatTokenAmount(pendingReward)} FRT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Available Balance</span>
              <span className="font-semibold text-gray-900">{formatTokenAmount(lpBalance)} {symbol}</span>
            </div>
          </div>

          {needsApproval && (
            <button type="button" disabled={disabled} onClick={() => approve()} className="mb-4 w-full cursor-pointer rounded-xl bg-amber-100 py-2.5 text-base font-medium text-amber-800 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50">
              {isApprovePending ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner className="h-4 w-4 border-amber-600" />
                  Approving...
                </span>
              ) : (
                `Approve ${symbol}`
              )}
            </button>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-gray-600">Stake</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.0"
                  value={formatNumberWithCommas(depositAmount)}
                  onChange={(e) => !inputsLocked && setDepositAmount(sanitizeAmountInput(e.target.value))}
                  disabled={!isConnected || inputsLocked}
                  readOnly={inputsLocked}
                  aria-readonly={inputsLocked}
                  className={INPUT_CLASS}
                />
                <button
                  type="button"
                  onClick={() => lpBalance != null && lpBalance > 0n && setDepositAmount(formatAmountForInput(lpBalance))}
                  disabled={!isConnected || inputsLocked || !lpBalance || lpBalance === 0n}
                  className="shrink-0 rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-violet-600 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Max
                </button>
                <button type="button" disabled={depositButtonDisabled} onClick={handleDeposit} className={`${btnBase} min-w-[100px] ${depositButtonGrey ? btnMuted : btnPrimary}`}>
                  {isFarmPending ? <span className="inline-flex items-center gap-1"><Spinner className="h-4 w-4 border-white" />...</span> : "Stake"}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-gray-600">Unstake</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.0"
                  value={formatNumberWithCommas(withdrawAmount)}
                  onChange={(e) => !inputsLocked && setWithdrawAmount(sanitizeAmountInput(e.target.value))}
                  disabled={!isConnected || inputsLocked}
                  readOnly={inputsLocked}
                  aria-readonly={inputsLocked}
                  className={INPUT_CLASS}
                />
                <button
                  type="button"
                  onClick={() => depositedWei > 0n && setWithdrawAmount(formatAmountForInput(depositedWei))}
                  disabled={!isConnected || inputsLocked || depositedWei === 0n}
                  className="shrink-0 rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-violet-600 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Max
                </button>
                <button type="button" disabled={withdrawButtonDisabled} onClick={handleWithdraw} className={`${btnBase} min-w-[100px] ${withdrawButtonGrey ? btnMuted : btnSecondary}`}>
                  {isFarmPending ? <span className="inline-flex items-center gap-1"><Spinner className="h-4 w-4 border-violet-600" />...</span> : "Unstake"}
                </button>
              </div>
            </div>

            <button type="button" disabled={claimButtonDisabled} onClick={handleClaim} className={`w-full ${btnBase} py-2.5 ${hasPendingReward ? btnPrimary : btnMuted}`}>
              {isFarmPending ? <span className="inline-flex items-center gap-2"><Spinner className="h-4 w-4 border-white" />...</span> : claimLabel}
            </button>
            {balanceError && (
              <p className="mt-2 text-center text-sm text-red-600" role="alert">{balanceError}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
