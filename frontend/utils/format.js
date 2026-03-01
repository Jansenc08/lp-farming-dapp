import { formatUnits } from "viem";

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
