-- Department assignments + per-document access for viewer role.
-- Staff (admin, manager, member) keep full document + storage read as before.

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profile_departments (
  profile_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES public.departments (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, department_id)
);

CREATE INDEX IF NOT EXISTS idx_profile_departments_department_id
  ON public.profile_departments (department_id);

COMMENT ON TABLE public.profile_departments IS
  'Departments a viewer user is associated with (for scoping document access).';

CREATE TABLE IF NOT EXISTS public.profile_document_access (
  profile_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.documents (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, document_id)
);

CREATE INDEX IF NOT EXISTS idx_profile_document_access_document_id
  ON public.profile_document_access (document_id);

COMMENT ON TABLE public.profile_document_access IS
  'Explicit document read grants for viewer users.';

-- -----------------------------------------------------------------------------
-- RLS: assignment tables (admins manage; users read own rows)
-- -----------------------------------------------------------------------------
ALTER TABLE public.profile_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_document_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profile_departments_select ON public.profile_departments;
CREATE POLICY profile_departments_select
  ON public.profile_departments FOR SELECT TO authenticated
  USING (
    profile_id = (SELECT auth.uid())
    OR public.is_app_admin()
  );

DROP POLICY IF EXISTS profile_departments_insert_admin ON public.profile_departments;
CREATE POLICY profile_departments_insert_admin
  ON public.profile_departments FOR INSERT TO authenticated
  WITH CHECK (public.is_app_admin());

DROP POLICY IF EXISTS profile_departments_delete_admin ON public.profile_departments;
CREATE POLICY profile_departments_delete_admin
  ON public.profile_departments FOR DELETE TO authenticated
  USING (public.is_app_admin());

DROP POLICY IF EXISTS profile_document_access_select ON public.profile_document_access;
CREATE POLICY profile_document_access_select
  ON public.profile_document_access FOR SELECT TO authenticated
  USING (
    profile_id = (SELECT auth.uid())
    OR public.is_app_admin()
  );

DROP POLICY IF EXISTS profile_document_access_insert_admin ON public.profile_document_access;
CREATE POLICY profile_document_access_insert_admin
  ON public.profile_document_access FOR INSERT TO authenticated
  WITH CHECK (public.is_app_admin());

DROP POLICY IF EXISTS profile_document_access_delete_admin ON public.profile_document_access;
CREATE POLICY profile_document_access_delete_admin
  ON public.profile_document_access FOR DELETE TO authenticated
  USING (public.is_app_admin());

-- -----------------------------------------------------------------------------
-- documents: staff see all; viewers see granted rows in assigned departments
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS documents_select_auth ON public.documents;

CREATE POLICY documents_select_staff
  ON public.documents FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
        AND p.role IN (
          'admin'::public.app_role,
          'manager'::public.app_role,
          'member'::public.app_role
        )
    )
  );

CREATE POLICY documents_select_viewer_granted
  ON public.documents FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
        AND p.role = 'viewer'::public.app_role
    )
    AND EXISTS (
      SELECT 1
      FROM public.profile_document_access g
      WHERE g.profile_id = (SELECT auth.uid())
        AND g.document_id = id
    )
    AND EXISTS (
      SELECT 1
      FROM public.profile_departments pd
      WHERE pd.profile_id = (SELECT auth.uid())
        AND pd.department_id = department_id
    )
  );

-- -----------------------------------------------------------------------------
-- storage.objects: staff read any document PDF; viewers only granted paths
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS storage_documents_select_auth ON storage.objects;

CREATE POLICY storage_documents_select_staff
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
        AND p.role IN (
          'admin'::public.app_role,
          'manager'::public.app_role,
          'member'::public.app_role
        )
    )
  );

CREATE POLICY storage_documents_select_viewer_granted
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
        AND p.role = 'viewer'::public.app_role
    )
    AND EXISTS (
      SELECT 1
      FROM public.documents d
      WHERE d.storage_object_path = name
        AND EXISTS (
          SELECT 1
          FROM public.profile_document_access g
          WHERE g.profile_id = (SELECT auth.uid())
            AND g.document_id = d.id
        )
        AND EXISTS (
          SELECT 1
          FROM public.profile_departments pd
          WHERE pd.profile_id = (SELECT auth.uid())
            AND pd.department_id = d.department_id
        )
    )
  );

-- -----------------------------------------------------------------------------
-- profiles: admins can list profiles (for access management UI)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS profiles_select_admin ON public.profiles;
CREATE POLICY profiles_select_admin
  ON public.profiles FOR SELECT TO authenticated
  USING (public.is_app_admin());

DROP POLICY IF EXISTS profiles_update_admin ON public.profiles;
CREATE POLICY profiles_update_admin
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_app_admin())
  WITH CHECK (public.is_app_admin());

-- -----------------------------------------------------------------------------
-- profiles: allow admins to change another user's role (not their own)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.profiles_prevent_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    IF (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role' THEN
      RETURN NEW;
    END IF;
    IF NOT (
      public.is_app_admin()
      AND OLD.id IS DISTINCT FROM (SELECT auth.uid())
    ) THEN
      NEW.role := OLD.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
