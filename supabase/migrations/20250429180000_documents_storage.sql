-- Documents module + Storage bucket (run after reference entities migration).
-- PDF storage bucket + documents / document_tags tables + profile directory read.

-- -----------------------------------------------------------------------------
-- Profiles: allow authenticated users to read profiles (owner picker / attribution)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS profiles_select_directory ON public.profiles;
CREATE POLICY profiles_select_directory
  ON public.profiles FOR SELECT TO authenticated
  USING (true);

COMMENT ON POLICY profiles_select_directory ON public.profiles IS
  'Internal directory: list profile names/emails for document ownership and attribution.';

-- -----------------------------------------------------------------------------
-- Enum + tables
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  CREATE TYPE public.document_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END$$;

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  storage_object_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',
  division_id UUID NOT NULL REFERENCES public.divisions (id) ON DELETE RESTRICT,
  department_id UUID NOT NULL REFERENCES public.departments (id) ON DELETE RESTRICT,
  document_type_id UUID NOT NULL REFERENCES public.document_types (id) ON DELETE RESTRICT,
  process_category_id UUID REFERENCES public.process_categories (id) ON DELETE SET NULL,
  owner_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
  status public.document_status NOT NULL DEFAULT 'draft',
  uploaded_by UUID NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  updated_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT documents_title_nonempty_ck CHECK (char_length(trim(title)) > 0)
);

-- Department must belong to division (PostgreSQL forbids subqueries in CHECK — use trigger.)
CREATE OR REPLACE FUNCTION public.documents_enforce_department_in_division()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.departments d
    WHERE d.id = NEW.department_id
      AND d.division_id = NEW.division_id
  ) THEN
    RAISE EXCEPTION 'documents: department must belong to the selected division'
      USING ERRCODE = '23514'; -- check_violation
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS documents_enforce_department_in_division ON public.documents;
CREATE TRIGGER documents_enforce_department_in_division
  BEFORE INSERT OR UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.documents_enforce_department_in_division();

CREATE INDEX IF NOT EXISTS idx_documents_division_id ON public.documents (division_id);
CREATE INDEX IF NOT EXISTS idx_documents_department_id ON public.documents (department_id);
CREATE INDEX IF NOT EXISTS idx_documents_document_type_id ON public.documents (document_type_id);
CREATE INDEX IF NOT EXISTS idx_documents_process_category_id ON public.documents (process_category_id);
CREATE INDEX IF NOT EXISTS idx_documents_owner_id ON public.documents (owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents (status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents (created_at DESC);

DROP TRIGGER IF EXISTS documents_set_updated_at ON public.documents;
CREATE TRIGGER documents_set_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.document_tags (
  document_id UUID NOT NULL REFERENCES public.documents (id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (document_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_document_tags_tag_id ON public.document_tags (tag_id);

-- -----------------------------------------------------------------------------
-- Roles: admin + manager may manage documents & storage objects
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.can_manage_documents()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
      AND p.role IN ('admin'::public.app_role, 'manager'::public.app_role)
  );
$$;

COMMENT ON FUNCTION public.can_manage_documents IS
  'True when current user may create/update/archive documents (admin or manager).';

-- -----------------------------------------------------------------------------
-- Row Level Security — documents
-- -----------------------------------------------------------------------------
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS documents_select_auth ON public.documents;
CREATE POLICY documents_select_auth
  ON public.documents FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS documents_insert_managers ON public.documents;
CREATE POLICY documents_insert_managers
  ON public.documents FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_documents());

DROP POLICY IF EXISTS documents_update_managers ON public.documents;
CREATE POLICY documents_update_managers
  ON public.documents FOR UPDATE TO authenticated
  USING (public.can_manage_documents())
  WITH CHECK (public.can_manage_documents());

DROP POLICY IF EXISTS documents_delete_managers ON public.documents;
CREATE POLICY documents_delete_managers
  ON public.documents FOR DELETE TO authenticated
  USING (public.can_manage_documents());

ALTER TABLE public.document_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS document_tags_select_auth ON public.document_tags;
CREATE POLICY document_tags_select_auth
  ON public.document_tags FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS document_tags_mutate_managers ON public.document_tags;
DROP POLICY IF EXISTS document_tags_insert_manager ON public.document_tags;
DROP POLICY IF EXISTS document_tags_delete_manager ON public.document_tags;
CREATE POLICY document_tags_insert_manager
  ON public.document_tags FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_documents());

DROP POLICY IF EXISTS document_tags_delete_manager ON public.document_tags;
CREATE POLICY document_tags_delete_manager
  ON public.document_tags FOR DELETE TO authenticated
  USING (public.can_manage_documents());

-- -----------------------------------------------------------------------------
-- Storage bucket (private PDFs). Configure MIME/size limits in Dashboard if needed.
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS storage_documents_select_auth ON storage.objects;
CREATE POLICY storage_documents_select_auth
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documents');

DROP POLICY IF EXISTS storage_documents_insert_managers ON storage.objects;
CREATE POLICY storage_documents_insert_managers
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND public.can_manage_documents()
  );

DROP POLICY IF EXISTS storage_documents_update_managers ON storage.objects;
CREATE POLICY storage_documents_update_managers
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'documents' AND public.can_manage_documents())
  WITH CHECK (bucket_id = 'documents' AND public.can_manage_documents());

DROP POLICY IF EXISTS storage_documents_delete_managers ON storage.objects;
CREATE POLICY storage_documents_delete_managers
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documents' AND public.can_manage_documents());

COMMENT ON TABLE public.documents IS 'SOP repository metadata + storage_object_path within bucket documents';
