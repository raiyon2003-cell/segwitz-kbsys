import { NextResponse } from "next/server";
import { getDocumentById } from "@/lib/data/documents";
import { getSignedPdfDownloadUrl } from "@/lib/storage/document-storage";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const doc = await getDocumentById(params.id);
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = await getSignedPdfDownloadUrl(supabase, doc.storage_object_path);
  if (!url) {
    return NextResponse.json(
      { error: "Could not generate download URL." },
      { status: 500 },
    );
  }

  return NextResponse.redirect(url);
}
