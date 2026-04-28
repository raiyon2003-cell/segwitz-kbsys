import type { DocumentListView } from "@/types/documents";
import type { DocumentStatus } from "@/types/documents";
import { parsePageFromString } from "@/lib/pagination";

/** Query shape for `/documents` listing + filters */
export type ParsedDocumentsListParams = {
  page: number;
  view: DocumentListView;
  layout: "table" | "grid";
  /** Title search (trimmed; empty means none) */
  q: string;
  divisionId: string | null;
  departmentId: string | null;
  documentTypeId: string | null;
  /** Filter rows with no process category */
  processUncategorizedOnly: boolean;
  processCategoryId: string | null;
  /** Documents must include all of these tags */
  tagIds: string[];
  status: DocumentStatus | null;
  ownerId: string | null;
};

const UUID_RE =
  /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;

export function isUuid(v: string): boolean {
  return UUID_RE.test(v.trim());
}

const STATUSES: DocumentStatus[] = ["draft", "published", "archived"];

function parseView(
  raw: string | string[] | undefined,
): DocumentListView {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "archived") return "archived";
  if (v === "all") return "all";
  return "active";
}

function parseLayout(raw: string | string[] | undefined): "table" | "grid" {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v === "grid" ? "grid" : "table";
}

function parsePage(raw: string | string[] | undefined): number {
  return parsePageFromString(raw);
}

function parseQ(raw: string | string[] | undefined): string {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return String(v ?? "").trim().slice(0, 200);
}

function parseOptionalUuid(
  raw: string | string[] | undefined,
): string | null {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const s = String(v ?? "").trim();
  if (!s || s === "_any") return null;
  return isUuid(s) ? s : null;
}

/** Parse `category=_none` or a UUID */
function parseProcessCategory(
  raw: string | string[] | undefined,
): {
  uncategorizedOnly: boolean;
  categoryId: string | null;
} {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const s = String(v ?? "").trim();
  if (!s || s === "_any") {
    return { uncategorizedOnly: false, categoryId: null };
  }
  if (s === "_none") {
    return { uncategorizedOnly: true, categoryId: null };
  }
  if (isUuid(s)) {
    return { uncategorizedOnly: false, categoryId: s };
  }
  return { uncategorizedOnly: false, categoryId: null };
}

function parseTagIds(raw: string | string[] | undefined): string[] {
  const v = Array.isArray(raw) ? raw.join(",") : raw;
  const parts = String(v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const uniq = Array.from(new Set(parts)).filter(isUuid);
  return uniq.slice(0, 25);
}

function parseStatusRaw(
  raw: string | string[] | undefined,
): DocumentStatus | null {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const s = String(v ?? "").trim();
  if (!s || s === "_any") return null;
  return STATUSES.includes(s as DocumentStatus)
    ? (s as DocumentStatus)
    : null;
}

export function parseDocumentsListParams(
  searchParams: Record<string, string | string[] | undefined>,
): ParsedDocumentsListParams {
  const pc = parseProcessCategory(searchParams.category);

  return {
    page: parsePage(searchParams.page),
    view: parseView(searchParams.view),
    layout: parseLayout(searchParams.layout),
    q: parseQ(searchParams.q),
    divisionId: parseOptionalUuid(searchParams.division),
    departmentId: parseOptionalUuid(searchParams.department),
    documentTypeId: parseOptionalUuid(searchParams.type),
    processUncategorizedOnly: pc.uncategorizedOnly,
    processCategoryId: pc.categoryId,
    tagIds: parseTagIds(searchParams.tags),
    status: parseStatusRaw(searchParams.status),
    ownerId: parseOptionalUuid(searchParams.owner),
  };
}

export function serializeDocumentsListParams(
  p: ParsedDocumentsListParams,
): Record<string, string> {
  const o: Record<string, string> = {};
  if (p.page > 1) o.page = String(p.page);
  if (p.view !== "active") o.view = p.view;
  if (p.layout !== "table") o.layout = p.layout;
  if (p.q.length > 0) o.q = p.q;
  if (p.divisionId) o.division = p.divisionId;
  if (p.departmentId) o.department = p.departmentId;
  if (p.documentTypeId) o.type = p.documentTypeId;
  if (p.processUncategorizedOnly) o.category = "_none";
  else if (p.processCategoryId) o.category = p.processCategoryId;
  if (p.tagIds.length > 0) o.tags = p.tagIds.join(",");
  if (p.status) o.status = p.status;
  if (p.ownerId) o.owner = p.ownerId;
  return o;
}

/** Params forwarded through pagination links (omit page — CrudPagination adds page). */
export function documentsListPreserveParams(
  p: ParsedDocumentsListParams,
): Record<string, string> {
  const o = serializeDocumentsListParams(p);
  delete o.page;
  return o;
}

function tagSetsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

function filtersChanged(
  patch: Partial<ParsedDocumentsListParams>,
  prev: ParsedDocumentsListParams,
): boolean {
  const keys: (keyof ParsedDocumentsListParams)[] = [
    "q",
    "view",
    "divisionId",
    "departmentId",
    "documentTypeId",
    "processUncategorizedOnly",
    "processCategoryId",
    "tagIds",
    "status",
    "ownerId",
  ];

  for (const k of keys) {
    if (patch[k] === undefined) continue;
    if (k === "tagIds") {
      const pt = patch.tagIds!;
      if (!tagSetsEqual(pt, prev.tagIds)) return true;
      continue;
    }
    if (patch[k] !== prev[k]) return true;
  }
  return false;
}

export function mergeDocumentsListParams(
  prev: ParsedDocumentsListParams,
  patch: Partial<ParsedDocumentsListParams>,
): ParsedDocumentsListParams {
  const next: ParsedDocumentsListParams = {
    ...prev,
    ...patch,
    tagIds: patch.tagIds ?? prev.tagIds,
  };

  let page = prev.page;
  if (patch.page !== undefined) {
    page = patch.page;
  } else if (filtersChanged(patch, prev)) {
    page = 1;
  }

  return { ...next, page };
}

export function documentsHref(
  pathname: string,
  p: ParsedDocumentsListParams,
): string {
  const entries = serializeDocumentsListParams(p);
  const qs = new URLSearchParams(entries).toString();
  return qs.length > 0 ? `${pathname}?${qs}` : pathname;
}

/** Reset filter fields while keeping scope tabs + layout mode + pagination cleared to page 1. */
export function resetDocumentsFiltersKeepScope(
  view: DocumentListView,
  layout: "table" | "grid",
): ParsedDocumentsListParams {
  return {
    page: 1,
    view,
    layout,
    q: "",
    divisionId: null,
    departmentId: null,
    documentTypeId: null,
    processUncategorizedOnly: false,
    processCategoryId: null,
    tagIds: [],
    status: null,
    ownerId: null,
  };
}
