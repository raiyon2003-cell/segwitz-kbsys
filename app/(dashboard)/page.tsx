import { PageHeader } from "@/components/layout/page-header";
import {
  DashboardDistributionCard,
  DashboardRecentUploads,
  DashboardStatCard,
} from "@/components/dashboard";
import { getDocumentsListUrl } from "@/lib/documents/documents-list-url";
import { getDashboardData } from "@/lib/data/dashboard";

export default async function DashboardPage() {
  const d = await getDashboardData();
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Document library overview, recent uploads, and breakdowns by division and type."
      />

      {d.setupMessage ? (
        <div
          className="rounded-xl border border-border/60 bg-muted/50 px-4 py-3 text-sm text-foreground ring-1 ring-border/30"
          role="alert"
        >
          <p className="font-semibold">Database setup required</p>
          <p className="mt-1 text-muted-foreground">{d.setupMessage}</p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          label="Total documents"
          value={d.total}
          href={getDocumentsListUrl({ view: "all" })}
        />
        <DashboardStatCard
          label="Published"
          value={d.published}
          href={getDocumentsListUrl({ view: "all", status: "published" })}
        />
        <DashboardStatCard
          label="Draft"
          value={d.draft}
          href={getDocumentsListUrl({ view: "all", status: "draft" })}
        />
        <DashboardStatCard
          label="Archived"
          value={d.archived}
          href={getDocumentsListUrl({ view: "all", status: "archived" })}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardRecentUploads
          items={d.recent}
          emptyText="No documents yet. Upload one from the document library."
        />
        <DashboardDistributionCard
          title="By division"
          description="Count of documents per division."
          items={d.byDivision}
          itemHref={(id) =>
            getDocumentsListUrl({ view: "all", division: id })
          }
          emptyText="No documents in the library yet."
        />
      </div>

      <div className="max-w-3xl">
        <DashboardDistributionCard
          title="By type"
          description="Count of documents per document type."
          items={d.byType}
          itemHref={(id) => getDocumentsListUrl({ view: "all", type: id })}
          emptyText="No documents in the library yet."
        />
      </div>
    </div>
  );
}
