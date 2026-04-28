import type { DocumentListEmbed } from "@/types/documents";

export type CountByLabel = {
  id: string;
  name: string;
  count: number;
};

export type DashboardData = {
  total: number;
  draft: number;
  published: number;
  archived: number;
  recent: DocumentListEmbed[];
  byDivision: CountByLabel[];
  byType: CountByLabel[];
  /** Set when Core tables (e.g. `documents`) are missing from the linked DB. */
  setupMessage?: string | null;
};
