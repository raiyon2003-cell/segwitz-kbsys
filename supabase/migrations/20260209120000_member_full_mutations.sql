-- Allow members (with admin) to mutate org reference tables via is_admin().
-- Allow members (with admin and manager) full document + storage management via can_manage_documents().
-- Audit log remains is_app_admin()-only (admin read / insert policy unchanged from prior migrations).

CREATE OR REPLACE FUNCTION public.is_admin()
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
        'member'::public.app_role
      )
  );
$$;

COMMENT ON FUNCTION public.is_admin IS
  'True when current user may CUD divisions, departments, document_types, process_categories, tags (admin or member).';

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
      AND p.role IN (
        'admin'::public.app_role,
        'manager'::public.app_role,
        'member'::public.app_role
      )
  );
$$;

COMMENT ON FUNCTION public.can_manage_documents IS
  'True when current user may manage documents, storage objects, and related tags for any document (admin, manager, or member).';

-- Stricter INSERT: members must set themselves as uploaded_by (server does this); admins/managers unrestricted.
DROP POLICY IF EXISTS documents_insert_managers ON public.documents;
CREATE POLICY documents_insert_managers
  ON public.documents FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
        AND p.role IN ('admin'::public.app_role, 'manager'::public.app_role)
    )
    OR (
      EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = (SELECT auth.uid())
          AND p.role = 'member'::public.app_role
      )
      AND uploaded_by = (SELECT auth.uid())
    )
  );
