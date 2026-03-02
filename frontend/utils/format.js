import { formatUnits, parseEther } from "viem";

const DEFAULT_DECIMALS = 18;

/** Wei → readable string (never show raw wei in UI) */
export function formatTokenAmount(value, decimals = DEFAULT_DECIMALS, maxFractionDigits = 4) {
  if (value === undefined || value === null) return "0";
  if (typeof value === "number") value = BigInt(Math.floor(value));
  const str = formatUnits(value, decimals);
  const num = parseFloat(str);
  if (num === 0) return "0";
  if (num < 0.0001) return "<0.0001";
  return num.toLocaleString("en-US", { maximumFractionDigits: maxFractionDigits, minimumFractionDigits: 0 });
}

/** Short address: 0x1234...5678 */
export function formatAddress(address) {
  if (!address || typeof address !== "string") return "";
  if (address.length < 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/** Parse user input string to wei (18 decimals). Returns 0n on invalid or empty. */
export function parseAmount(str) {
  if (!str || str === "0") return 0n;
  try {
    return parseEther(str);
  } catch {
    return 0n;
  }
}

/** User-facing transaction result message for pool actions. */
export function formatTxResultMessage(action, success) {
  const verb = action === "deposit" ? "Deposit" : action === "withdraw" ? "Withdraw" : "Claim";
  return `${verb} Transaction ${success ? "successful" : "unsuccessful"}`;
}
