import { redirect } from "next/navigation";
import { activityLogTableColumns } from "@/components/admin/activity-log-table-columns";
import { PageHeader } from "@/components/layout/page-header";
import { CrudPagination } from "@/components/crud/crud-pagination";
import { CrudTable } from "@/components/crud/crud-table";
import { Card, CardContent } from "@/components/ui";
import { getCachedSessionProfile } from "@/lib/auth/session";
import { getActivityLogPaginated } from "@/lib/activity";
import { parsePageParam } from "@/lib/pagination";

export default async function AdminActivityPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { profile } = await getCachedSessionProfile();
  if (profile.role !== "admin") {
    redirect("/");
  }

  const currentPage = parsePageParam(searchParams);
  const { rows, total, page, pageSize } =
    await getActivityLogPaginated(currentPage);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className="px-6 py-8 lg:px-10">
      <PageHeader
        title="Activity"
        description="Document uploads, updates, status changes, and file replacements. Visible to administrators only."
      />
      <Card className="border-border-subtle">
        <CardContent className="p-0">
          {total === 0 ? (
            <p className="p-6 text-sm text-foreground-muted">
              No activity yet. Events appear when managers or admins work with
              documents.
            </p>
          ) : (
            <CrudTable rows={rows} columns={activityLogTableColumns} />
          )}
          {total > 0 ? (
            <CrudPagination
              basePath="/admin/activity"
              page={page}
              totalPages={totalPages}
            />
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
