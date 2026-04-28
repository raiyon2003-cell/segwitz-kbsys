/** Server-side PDF validation (MIME + extension + %PDF header). */

export async function validatePdfUpload(
  file: File,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!file.size) {
    return { ok: false, error: "Choose a PDF file." };
  }

  const MAX_BYTES = 52 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "PDF must be 52 MB or smaller." };
  }

  if (
    file.type &&
    file.type !== "application/pdf" &&
    file.type !== "application/x-pdf"
  ) {
    return { ok: false, error: "Only PDF uploads are allowed." };
  }

  const lower = file.name.toLowerCase();
  if (!lower.endsWith(".pdf")) {
    return { ok: false, error: "File name must end with .pdf." };
  }

  const buf = await file.slice(0, 5).arrayBuffer();
  const magic = new TextDecoder().decode(buf);
  if (!magic.startsWith("%PDF")) {
    return { ok: false, error: "Invalid PDF — file does not start with %PDF." };
  }

  return { ok: true };
}
