-- Allow members to upload (create) documents; edit/archive/delete remain admin + manager via can_manage_documents().

CREATE OR REPLACE FUNCTION public.can_upload_documents()
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
      AND p.role IN (
        'admin'::public.app_role,
        'manager'::public.app_role,
        'member'::public.app_role
      )
  );
$$;

COMMENT ON FUNCTION public.can_upload_documents IS
  'True when current user may create new documents and initial storage uploads (admin, manager, or member).';

DROP POLICY IF EXISTS documents_insert_managers ON public.documents;
CREATE POLICY documents_insert_managers
  ON public.documents FOR INSERT TO authenticated
  WITH CHECK (
    public.can_manage_documents()
    OR (
      public.can_upload_documents()
      AND uploaded_by = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS storage_documents_insert_managers ON storage.objects;
CREATE POLICY storage_documents_insert_managers
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND (
      public.can_manage_documents()
      OR public.can_upload_documents()
    )
  );

DROP POLICY IF EXISTS document_tags_insert_manager ON public.document_tags;
CREATE POLICY document_tags_insert_manager
  ON public.document_tags FOR INSERT TO authenticated
  WITH CHECK (
    public.can_manage_documents()
    OR (
      public.can_upload_documents()
      AND EXISTS (
        SELECT 1
        FROM public.documents d
        WHERE d.id = document_id
          AND d.uploaded_by = (SELECT auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS document_activity_log_insert_managers ON public.document_activity_log;
CREATE POLICY document_activity_log_insert_managers
  ON public.document_activity_log FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = actor_id
    AND (
      public.can_manage_documents()
      OR public.can_upload_documents()
    )
  );
