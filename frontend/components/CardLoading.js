export function CardLoading() {
  return (
    <div className="flex h-32 items-center justify-center text-gray-400">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" aria-hidden />
    </div>
  );
}
