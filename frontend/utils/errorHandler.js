/**
 * User-friendly error messages for contract/wallet errors.
 * Wagmi/viem errors often expose shortMessage or message.
 */
export function getTransactionErrorMessage(error, fallbackMessage = "Transaction failed") {
  if (!error) return fallbackMessage;
  const msg = error.shortMessage ?? error.message;
  if (typeof msg === "string" && msg.length > 0) return msg;
  return fallbackMessage;
}
