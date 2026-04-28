"use client";

import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Maximize2,
  Minimize2,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Button } from "@/components/ui/button";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type Props = {
  documentId: string;
  /** Fresh signed GET URL from server */
  initialUrl: string;
  filename: string;
};

async function fetchFreshSignedUrl(documentId: string): Promise<string | null> {
  const res = await fetch(`/api/documents/${documentId}/sign`);
  if (!res.ok) return null;
  const body = (await res.json()) as { url?: string };
  return body.url ?? null;
}

export function DocumentPdfPanel({
  documentId,
  initialUrl,
  filename,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerWrapRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(720);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfUrl, setPdfUrl] = useState(initialUrl);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setContainerWidth(Math.max(280, Math.floor(el.clientWidth) - 4));
    });
    ro.observe(el);
    setContainerWidth(Math.max(280, Math.floor(el.clientWidth) - 4));
    return () => ro.disconnect();
  }, []);

  const onFsChange = useCallback(() => {
    setIsFullscreen(Boolean(document.fullscreenElement));
  }, []);

  useEffect(() => {
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, [onFsChange]);

  async function refreshUrl() {
    setLoadError(null);
    setLoading(true);
    const next = await fetchFreshSignedUrl(documentId);
    if (!next) {
      setLoadError("Could not refresh the document link. Try reloading the page.");
      setLoading(false);
      return;
    }
    setPdfUrl(next);
  }

  async function toggleFullscreen() {
    const el = viewerWrapRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
      }
    } catch {
      /* unsupported or denied */
    }
  }

  const docFile = pdfUrl;

  useEffect(() => {
    setLoading(true);
    setLoadError(null);
  }, [pdfUrl]);

  return (
    <div ref={viewerWrapRef} className="flex min-h-[min(72vh,880px)] flex-col rounded-xl border border-border-subtle bg-surface-muted/30">
      <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle bg-surface px-3 py-2">
        <span className="mr-auto truncate text-xs font-medium text-foreground-muted">
          {filename}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() =>
            window.open(`/api/documents/${documentId}/download`, "_blank")
          }
        >
          <Download className="size-3.5" aria-hidden />
          Download
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => void toggleFullscreen()}
          title={
            isFullscreen ? "Exit fullscreen" : "Fullscreen viewer"
          }
        >
          {isFullscreen ? (
            <Minimize2 className="size-3.5" aria-hidden />
          ) : (
            <Maximize2 className="size-3.5" aria-hidden />
          )}
          {isFullscreen ? "Exit" : "Fullscreen"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => void refreshUrl()}
        >
          <RefreshCw className="size-3.5" aria-hidden />
          Refresh link
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle bg-surface-muted/50 px-3 py-2">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-[120px] text-center text-xs tabular-nums text-foreground-muted">
            {numPages ? (
              <>
                Page {pageNumber} / {numPages}
              </>
            ) : (
              "—"
            )}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!numPages || pageNumber >= numPages}
            onClick={() =>
              setPageNumber((p) =>
                numPages ? Math.min(numPages, p + 1) : p + 1,
              )
            }
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative flex flex-1 justify-center overflow-auto bg-[hsl(var(--foreground)/0.03)] px-2 py-6 dark:bg-black/25"
      >
        {loadError ? (
          <div className="flex max-w-md flex-col items-center gap-3 px-4 py-12 text-center">
            <p className="text-sm text-red-700 dark:text-red-300">{loadError}</p>
            <Button type="button" variant="secondary" size="sm" onClick={() => void refreshUrl()}>
              Retry
            </Button>
          </div>
        ) : (
          <>
            {loading ? (
              <div className="absolute inset-0 z-[1] flex items-center justify-center bg-surface/80 backdrop-blur-[1px]">
                <Loader2 className="size-8 animate-spin text-accent" aria-hidden />
              </div>
            ) : null}
            <Document
              key={pdfUrl}
              file={docFile}
              onLoadSuccess={(pdf) => {
                setNumPages(pdf.numPages);
                setPageNumber(1);
                setLoading(false);
                setLoadError(null);
              }}
              onLoadError={() => {
                setLoading(false);
                setLoadError(
                  "Could not load the PDF. The preview link may have expired — try Refresh link.",
                );
              }}
              className="flex flex-col items-center gap-4"
            >
              <Page
                pageNumber={pageNumber}
                width={containerWidth}
                renderTextLayer
                renderAnnotationLayer
                className="shadow-lg ring-1 ring-black/10 dark:ring-white/10"
              />
            </Document>
          </>
        )}
      </div>
    </div>
  );
}
