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

/** Wei → decimal string for input fields (no commas). Use for Max button. */
export function formatAmountForInput(value, decimals = DEFAULT_DECIMALS) {
  if (value === undefined || value === null || value === 0n) return "";
  return formatUnits(value, decimals);
}

/** Format a raw number string with comma separators (integer part only). Keeps decimals as-is. */
export function formatNumberWithCommas(str) {
  if (!str || typeof str !== "string") return "";
  const trimmed = str.trim();
  if (!trimmed) return "";
  const parts = trimmed.split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
}

/** Sanitize user input to digits and at most one decimal point. Use for controlled amount inputs. */
export function sanitizeAmountInput(str) {
  if (!str || typeof str !== "string") return "";
  const noCommas = str.replace(/,/g, "");
  const digitsAndDot = noCommas.replace(/[^\d.]/g, "");
  const firstDot = digitsAndDot.indexOf(".");
  if (firstDot === -1) return digitsAndDot;
  return digitsAndDot.slice(0, firstDot + 1) + digitsAndDot.slice(firstDot + 1).replace(/\./g, "");
}

/** Parse user input string to wei (18 decimals). Strips commas. Returns 0n on invalid or empty. */
export function parseAmount(str) {
  if (!str || str === "0") return 0n;
  const raw = typeof str === "string" ? str.replace(/,/g, "") : str;
  if (!raw || raw === "0") return 0n;
  try {
    return parseEther(raw);
  } catch {
    return 0n;
  }
}

/** User-facing transaction result message for pool actions. */
export function formatTxResultMessage(action, success) {
  const verb = action === "deposit" ? "Stake" : action === "withdraw" ? "Unstake" : "Claim";
  return `${verb} transaction ${success ? "successful" : "unsuccessful"}`;
}
