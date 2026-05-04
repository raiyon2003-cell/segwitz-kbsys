-- Employees must explicitly appear in profile_document_access to read a document
-- (within assigned departments). Removes legacy behavior where an employee with no
-- grants saw every document in assigned departments.

DROP POLICY IF EXISTS documents_select_employee_scoped ON public.documents;

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
    AND EXISTS (
      SELECT 1
      FROM public.profile_document_access g
      WHERE g.profile_id = (SELECT auth.uid())
        AND g.document_id = id
    )
  );

DROP POLICY IF EXISTS storage_documents_select_employee_scoped ON storage.objects;

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
        AND EXISTS (
          SELECT 1
          FROM public.profile_document_access g
          WHERE g.profile_id = (SELECT auth.uid())
            AND g.document_id = d.id
        )
    )
  );

COMMENT ON TABLE public.profile_document_access IS
  'Viewer: explicit grants required. Employee: explicit grants required (within assigned departments). Managers/admins/members use other policies.';
