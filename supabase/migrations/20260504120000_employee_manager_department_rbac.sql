-- RBAC: employee role; department-scoped manager/employee document access;
-- managers cannot delete documents or storage objects; optional document grants for employees.

-- -----------------------------------------------------------------------------
-- Enum: internal employee (view-only in assigned departments; optional doc grants)
-- -----------------------------------------------------------------------------
DO $rbac_enum$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'app_role'
      AND e.enumlabel = 'employee'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'employee';
  END IF;
END
$rbac_enum$;

-- -----------------------------------------------------------------------------
-- documents: replace broad "staff" SELECT with scoped policies
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS documents_select_staff ON public.documents;

CREATE POLICY documents_select_staff_full
  ON public.documents FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
        AND p.role IN (
          'admin'::public.app_role,
          'member'::public.app_role
        )
    )
  );

CREATE POLICY documents_select_manager_scoped
  ON public.documents FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
        AND p.role = 'manager'::public.app_role
    )
    AND department_id IN (
      SELECT pd.department_id
      FROM public.profile_departments pd
      WHERE pd.profile_id = (SELECT auth.uid())
    )
  );

CREATE POLICY documents_select_employee_scoped
  ON public.documents FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
        AND p.role = 'employee'::public.app_role
    )
    AND department_id IN (
      SELECT pd.department_id
      FROM public.profile_departments pd
      WHERE pd.profile_id = (SELECT auth.uid())
    )
    AND (
      NOT EXISTS (
        SELECT 1
        FROM public.profile_document_access g
        WHERE g.profile_id = (SELECT auth.uid())
      )
      OR EXISTS (
        SELECT 1
        FROM public.profile_document_access g
        WHERE g.profile_id = (SELECT auth.uid())
          AND g.document_id = id
      )
    )
  );

-- viewer policy unchanged name:
-- documents_select_viewer_granted

-- -----------------------------------------------------------------------------
-- documents: INSERT — admin; member (self uploaded_by); manager (dept scope)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS documents_insert_managers ON public.documents;

CREATE POLICY documents_insert_staff
  ON public.documents FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
        AND p.role = 'admin'::public.app_role
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
    OR (
      EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = (SELECT auth.uid())
          AND p.role = 'manager'::public.app_role
      )
      AND department_id IN (
        SELECT pd.department_id
        FROM public.profile_departments pd
        WHERE pd.profile_id = (SELECT auth.uid())
      )
    )
  );

-- -----------------------------------------------------------------------------
-- documents: UPDATE — admin/member any row; manager only assigned departments
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS documents_update_managers ON public.documents;

CREATE POLICY documents_update_admin_member
  ON public.documents FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
        AND p.role IN ('admin'::public.app_role, 'member'::public.app_role)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
        AND p.role IN ('admin'::public.app_role, 'member'::public.app_role)
    )
  );

CREATE POLICY documents_update_manager_scoped
  ON public.documents FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
        AND p.role = 'manager'::public.app_role
    )
    AND department_id IN (
      SELECT pd.department_id
      FROM public.profile_departments pd
      WHERE pd.profile_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
        AND p.role = 'manager'::public.app_role
    )
    AND department_id IN (
      SELECT pd.department_id
      FROM public.profile_departments pd
      WHERE pd.profile_id = (SELECT auth.uid())
    )
  );

-- -----------------------------------------------------------------------------
-- documents: DELETE — admin and member only (not managers)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS documents_delete_managers ON public.documents;

CREATE POLICY documents_delete_admin_member
  ON public.documents FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
        AND p.role IN ('admin'::public.app_role, 'member'::public.app_role)
    )
  );

-- -----------------------------------------------------------------------------
-- document_tags: tie mutations to document row access
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS document_tags_insert_manager ON public.document_tags;

CREATE POLICY document_tags_insert_manager
  ON public.document_tags FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.documents d
      WHERE d.id = document_id
        AND (
          EXISTS (
            SELECT 1
            FROM public.profiles p
            WHERE p.id = (SELECT auth.uid())
              AND p.role IN ('admin'::public.app_role, 'member'::public.app_role)
          )
          OR (
            EXISTS (
              SELECT 1
              FROM public.profiles p
              WHERE p.id = (SELECT auth.uid())
                AND p.role = 'manager'::public.app_role
            )
            AND d.department_id IN (
              SELECT pd.department_id
              FROM public.profile_departments pd
              WHERE pd.profile_id = (SELECT auth.uid())
            )
          )
        )
    )
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

DROP POLICY IF EXISTS document_tags_delete_manager ON public.document_tags;

CREATE POLICY document_tags_delete_manager
  ON public.document_tags FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.documents d
      WHERE d.id = document_id
        AND (
          EXISTS (
            SELECT 1
            FROM public.profiles p
            WHERE p.id = (SELECT auth.uid())
              AND p.role IN ('admin'::public.app_role, 'member'::public.app_role)
          )
          OR (
            EXISTS (
              SELECT 1
              FROM public.profiles p
              WHERE p.id = (SELECT auth.uid())
                AND p.role = 'manager'::public.app_role
            )
            AND d.department_id IN (
              SELECT pd.department_id
              FROM public.profile_departments pd
              WHERE pd.profile_id = (SELECT auth.uid())
            )
          )
        )
    )
  );

-- -----------------------------------------------------------------------------
-- Storage: SELECT mirrors document visibility for staff splits
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS storage_documents_select_staff ON storage.objects;

CREATE POLICY storage_documents_select_staff_full
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
        AND p.role IN ('admin'::public.app_role, 'member'::public.app_role)
    )
  );

CREATE POLICY storage_documents_select_manager_scoped
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
        AND p.role = 'manager'::public.app_role
    )
    AND EXISTS (
      SELECT 1
      FROM public.documents d
      WHERE d.storage_object_path = name
        AND d.department_id IN (
          SELECT pd.department_id
          FROM public.profile_departments pd
          WHERE pd.profile_id = (SELECT auth.uid())
        )
    )
  );

CREATE POLICY storage_documents_select_employee_scoped
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
        AND p.role = 'employee'::public.app_role
    )
    AND EXISTS (
      SELECT 1
      FROM public.documents d
      WHERE d.storage_object_path = name
        AND d.department_id IN (
          SELECT pd.department_id
          FROM public.profile_departments pd
          WHERE pd.profile_id = (SELECT auth.uid())
        )
        AND (
          NOT EXISTS (
            SELECT 1
            FROM public.profile_document_access g
            WHERE g.profile_id = (SELECT auth.uid())
          )
          OR EXISTS (
            SELECT 1
            FROM public.profile_document_access g
            WHERE g.profile_id = (SELECT auth.uid())
              AND g.document_id = d.id
          )
        )
    )
  );

-- storage_documents_select_viewer_granted unchanged

-- -----------------------------------------------------------------------------
-- Storage: UPDATE — admin/member global; manager scoped to dept documents
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS storage_documents_update_managers ON storage.objects;

CREATE POLICY storage_documents_update_staff
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'documents'
    AND (
      EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = (SELECT auth.uid())
          AND p.role IN ('admin'::public.app_role, 'member'::public.app_role)
      )
      OR (
        EXISTS (
          SELECT 1
          FROM public.profiles p
          WHERE p.id = (SELECT auth.uid())
            AND p.role = 'manager'::public.app_role
        )
        AND EXISTS (
          SELECT 1
          FROM public.documents d
          WHERE d.storage_object_path = name
            AND d.department_id IN (
              SELECT pd.department_id
              FROM public.profile_departments pd
              WHERE pd.profile_id = (SELECT auth.uid())
            )
        )
      )
    )
  )
  WITH CHECK (
    bucket_id = 'documents'
    AND (
      EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = (SELECT auth.uid())
          AND p.role IN ('admin'::public.app_role, 'member'::public.app_role)
      )
      OR (
        EXISTS (
          SELECT 1
          FROM public.profiles p
          WHERE p.id = (SELECT auth.uid())
            AND p.role = 'manager'::public.app_role
        )
        AND EXISTS (
          SELECT 1
          FROM public.documents d
          WHERE d.storage_object_path = name
            AND d.department_id IN (
              SELECT pd.department_id
              FROM public.profile_departments pd
              WHERE pd.profile_id = (SELECT auth.uid())
            )
        )
      )
    )
  );

-- -----------------------------------------------------------------------------
-- Storage: DELETE — admin/member only
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS storage_documents_delete_managers ON storage.objects;

CREATE POLICY storage_documents_delete_admin_member
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
        AND p.role IN ('admin'::public.app_role, 'member'::public.app_role)
    )
  );

COMMENT ON TABLE public.profile_document_access IS
  'Viewer: required document grants. Employee: optional whitelist — empty means all documents in assigned departments.';
