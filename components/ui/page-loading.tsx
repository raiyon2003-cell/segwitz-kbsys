export function PageLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-6 px-6 py-16">
      <div
        className="size-9 animate-spin rounded-full border-2 border-muted border-t-primary"
        aria-hidden
      />
      <div className="w-full max-w-xs space-y-2">
        <div className="h-3 w-full shimmer" />
        <div className="h-3 w-4/5 shimmer" />
        <div className="h-3 w-3/5 shimmer" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
