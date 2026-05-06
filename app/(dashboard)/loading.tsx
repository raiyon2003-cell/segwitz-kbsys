export default function DashboardLoading() {
  return (
    <main className="px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-[1400px] animate-pulse space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded bg-surface-muted" />
          <div className="h-4 w-80 rounded bg-surface-muted" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="h-28 rounded-lg border border-border-subtle bg-surface"
            />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-72 rounded-lg border border-border-subtle bg-surface" />
          <div className="h-72 rounded-lg border border-border-subtle bg-surface" />
        </div>
      </div>
    </main>
  );
}
