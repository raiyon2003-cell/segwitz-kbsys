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
    <main className="px-6 py-8 lg:px-10">
      <PageHeader
        title="Dashboard"
        description="Document library overview, recent uploads, and breakdowns by division and type."
      />

      {d.setupMessage ? (
        <div
          className="mb-6 rounded-lg border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100"
          role="alert"
        >
          <p className="font-semibold">Database setup required</p>
          <p className="mt-1 text-amber-900/90 dark:text-amber-50/90">
            {d.setupMessage}
          </p>
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

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
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

      <div className="mt-4 max-w-3xl">
        <DashboardDistributionCard
          title="By type"
          description="Count of documents per document type."
          items={d.byType}
          itemHref={(id) => getDocumentsListUrl({ view: "all", type: id })}
          emptyText="No documents in the library yet."
        />
      </div>
    </main>
  );
}
