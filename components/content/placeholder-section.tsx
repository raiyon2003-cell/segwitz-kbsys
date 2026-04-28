export function PlaceholderSection({ name }: { name: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border-subtle bg-surface-muted/30 px-6 py-12 text-center">
      <p className="text-sm text-foreground-muted">
        Content for <span className="font-medium text-foreground">{name}</span>{" "}
        will render here.
      </p>
    </div>
  );
}
