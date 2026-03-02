const BASE_CLASS = "animate-spin rounded-full border-2 border-t-transparent";

export function Spinner({ className = "h-4 w-4 border-white" }) {
  return <span className={`${BASE_CLASS} ${className}`} aria-hidden />;
}
