export default function DocumentDetailLoading() {
  return (
    <main className="px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-[1480px] animate-pulse space-y-8">
        <div className="h-4 w-44 rounded bg-surface-muted" />
        <div className="space-y-2">
          <div className="h-9 w-3/5 rounded bg-surface-muted" />
          <div className="h-4 w-2/5 rounded bg-surface-muted" />
        </div>
        <div className="grid gap-10 xl:grid-cols-[minmax(280px,380px)_1fr]">
          <div className="h-64 rounded-xl border border-border-subtle bg-surface" />
          <div className="h-[620px] rounded-xl border border-border-subtle bg-surface" />
        </div>
      </div>
    </main>
  );
}
