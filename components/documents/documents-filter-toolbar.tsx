"use client";

import { LayoutGrid, List, RotateCcw } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button, Input, Select } from "@/components/ui";
import type { DocumentFormOptionSets } from "@/lib/data/document-form-options";
import {
  documentsHref,
  mergeDocumentsListParams,
  resetDocumentsFiltersKeepScope,
  type ParsedDocumentsListParams,
} from "@/lib/documents/list-params";
import type { DocumentStatus } from "@/types/documents";
import { cn } from "@/lib/utils";

function profileLabel(p: {
  full_name: string | null;
  email: string | null;
  id: string;
}) {
  return p.full_name?.trim() || p.email?.trim() || p.id.slice(0, 8);
}

function tabClass(active: boolean) {
  return cn(
    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
    active
      ? "bg-surface-muted text-foreground shadow-sm ring-1 ring-border-subtle"
      : "text-foreground-muted hover:bg-surface-muted/60 hover:text-foreground",
  );
}

export function DocumentsFilterToolbar({
  parsed,
  options,
}: {
  parsed: ParsedDocumentsListParams;
  options: DocumentFormOptionSets;
}) {
  const router = useRouter();
  const pathname = usePathname() || "/documents";
  const [searchDraft, setSearchDraft] = useState(parsed.q);

  useEffect(() => {
    setSearchDraft(parsed.q);
  }, [parsed.q]);

  function go(next: ParsedDocumentsListParams) {
    router.replace(documentsHref(pathname, next));
  }

  function merge(patch: Partial<ParsedDocumentsListParams>) {
    go(mergeDocumentsListParams(parsed, patch));
  }

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    merge({ q: searchDraft.trim() });
  }

  const departmentChoices = useMemo(() => {
    if (parsed.divisionId) {
      return options.departments.filter(
        (d) => d.division_id === parsed.divisionId,
      );
    }
    return options.departments;
  }, [options.departments, parsed.divisionId]);

  function onDivisionChange(divisionId: string) {
    let nextDept: string | null = parsed.departmentId;
    const deps = options.departments.filter((d) => d.division_id === divisionId);
    if (
      !divisionId ||
      !nextDept ||
      !deps.some((d) => d.id === nextDept)
    ) {
      nextDept = deps[0]?.id ?? null;
    }
    merge({
      divisionId: divisionId || null,
      departmentId: nextDept,
    });
  }

  function toggleTag(tagId: string) {
    const set = new Set(parsed.tagIds);
    if (set.has(tagId)) set.delete(tagId);
    else set.add(tagId);
    merge({ tagIds: Array.from(set) });
  }

  const statuses: DocumentStatus[] = ["draft", "published", "archived"];

  const activeFilterCount =
    (parsed.q.trim() ? 1 : 0) +
    (parsed.divisionId ? 1 : 0) +
    (parsed.departmentId ? 1 : 0) +
    (parsed.documentTypeId ? 1 : 0) +
    (parsed.processUncategorizedOnly ? 1 : 0) +
    (parsed.processCategoryId ? 1 : 0) +
    (parsed.tagIds.length > 0 ? 1 : 0) +
    (parsed.status ? 1 : 0) +
    (parsed.ownerId ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle pb-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
          Scope
        </span>
        <Link
          href={documentsHref(
            pathname,
            mergeDocumentsListParams(parsed, { view: "active", page: 1 }),
          )}
          className={tabClass(parsed.view === "active")}
        >
          Active
        </Link>
        <Link
          href={documentsHref(
            pathname,
            mergeDocumentsListParams(parsed, { view: "archived", page: 1 }),
          )}
          className={tabClass(parsed.view === "archived")}
        >
          Archived
        </Link>
        <Link
          href={documentsHref(
            pathname,
            mergeDocumentsListParams(parsed, { view: "all", page: 1 }),
          )}
          className={tabClass(parsed.view === "all")}
        >
          All
        </Link>

        <div className="ml-auto flex items-center gap-1 rounded-lg border border-border-subtle bg-surface-muted/40 p-0.5">
          <button
            type="button"
            aria-label="Table layout"
            aria-pressed={parsed.layout === "table"}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              parsed.layout === "table"
                ? "bg-surface text-foreground shadow-sm ring-1 ring-border-subtle"
                : "text-foreground-muted hover:text-foreground",
            )}
            onClick={() =>
              go(mergeDocumentsListParams(parsed, { layout: "table" }))
            }
          >
            <List className="size-3.5 shrink-0" aria-hidden />
            Table
          </button>
          <button
            type="button"
            aria-label="Grid layout"
            aria-pressed={parsed.layout === "grid"}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              parsed.layout === "grid"
                ? "bg-surface text-foreground shadow-sm ring-1 ring-border-subtle"
                : "text-foreground-muted hover:text-foreground",
            )}
            onClick={() =>
              go(mergeDocumentsListParams(parsed, { layout: "grid" }))
            }
          >
            <LayoutGrid className="size-3.5 shrink-0" aria-hidden />
            Grid
          </button>
        </div>
      </div>

      <form
        onSubmit={onSearchSubmit}
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <Input
            label="Search title"
            placeholder="Search by title…"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            autoComplete="off"
          />
        </div>
        <Button type="submit" variant="secondary" className="sm:mb-[2px]">
          Search
        </Button>
      </form>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Select
          label="Division"
          value={parsed.divisionId ?? ""}
          onChange={(e) => onDivisionChange(e.target.value)}
        >
          <option value="">Any division</option>
          {options.divisions.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Select>

        <Select
          label="Department"
          value={parsed.departmentId ?? ""}
          onChange={(e) =>
            merge({
              departmentId: e.target.value || null,
            })
          }
        >
          <option value="">Any department</option>
          {departmentChoices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Select>

        <Select
          label="Document type"
          value={parsed.documentTypeId ?? ""}
          onChange={(e) =>
            merge({
              documentTypeId: e.target.value || null,
            })
          }
        >
          <option value="">Any type</option>
          {options.documentTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>

        <Select
          label="Process category"
          value={
            parsed.processUncategorizedOnly
              ? "_none"
              : parsed.processCategoryId ?? ""
          }
          onChange={(e) => {
            const v = e.target.value;
            if (v === "_none") {
              merge({
                processUncategorizedOnly: true,
                processCategoryId: null,
              });
            } else if (!v) {
              merge({
                processUncategorizedOnly: false,
                processCategoryId: null,
              });
            } else {
              merge({
                processUncategorizedOnly: false,
                processCategoryId: v,
              });
            }
          }}
        >
          <option value="">Any category</option>
          <option value="_none">Uncategorized</option>
          {options.processCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <Select
          label="Status"
          value={parsed.status ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            merge({
              status: v ? (v as DocumentStatus) : null,
            });
          }}
        >
          <option value="">Any status</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </Select>

        <Select
          label="Owner"
          value={parsed.ownerId ?? ""}
          onChange={(e) =>
            merge({
              ownerId: e.target.value || null,
            })
          }
        >
          <option value="">Any owner</option>
          {options.profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {profileLabel(p)}
            </option>
          ))}
        </Select>
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface-muted/30 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-foreground">Tags</p>
            <p className="text-xs text-foreground-muted">
              Documents must include{" "}
              <span className="font-medium text-foreground">all</span> selected
              tags.
            </p>
          </div>
          {activeFilterCount > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() =>
                go(resetDocumentsFiltersKeepScope(parsed.view, parsed.layout))
              }
            >
              <RotateCcw className="size-3.5" aria-hidden />
              Reset filters
            </Button>
          ) : null}
        </div>
        <div className="max-h-44 overflow-y-auto rounded-lg border border-border-subtle bg-surface p-3">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {options.tags.map((tag) => (
              <label
                key={tag.id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-muted"
              >
                <input
                  type="checkbox"
                  checked={parsed.tagIds.includes(tag.id)}
                  onChange={() => toggleTag(tag.id)}
                  className="size-4 rounded border-border text-accent focus:ring-accent"
                />
                <span>{tag.name}</span>
              </label>
            ))}
          </div>
          {options.tags.length === 0 ? (
            <p className="text-sm text-foreground-muted">
              No tags yet — define tags under Tags.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
