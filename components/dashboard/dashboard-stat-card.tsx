import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";

type Props = {
  label: string;
  value: number;
  href: string;
};

export function DashboardStatCard({ label, value, href }: Props) {
  return (
    <Link href={href}>
      <Card className="h-full border-border-subtle transition-colors hover:border-accent/30 hover:bg-surface-muted/30">
        <CardHeader className="pb-2">
          <CardDescription className="text-xs font-medium uppercase tracking-wide">
            {label}
          </CardDescription>
          <CardTitle className="text-3xl tabular-nums">{value}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground-muted">View in list →</p>
        </CardContent>
      </Card>
    </Link>
  );
}
