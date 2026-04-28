-- Document activity log (admin-readable audit trail for document changes).

-- -----------------------------------------------------------------------------
-- Enum + table
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  CREATE TYPE public.document_activity_action AS ENUM (
    'upload',
    'update',
    'status_change',
    'file_replacement'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END$$;

CREATE TABLE IF NOT EXISTS public.document_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents (id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  action public.document_activity_action NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_document_activity_log_created_at
  ON public.document_activity_log (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_document_activity_log_document_id
  ON public.document_activity_log (document_id);

CREATE INDEX IF NOT EXISTS idx_document_activity_log_actor_id
  ON public.document_activity_log (actor_id);

COMMENT ON TABLE public.document_activity_log IS
  'Append-only log of document lifecycle events; readable by app admins.';

-- -----------------------------------------------------------------------------
-- Role check (SECURITY DEFINER: reads profiles.role for current user)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_app_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT p.role = 'admin'::public.app_role
     FROM public.profiles p
     WHERE p.id = (SELECT auth.uid())),
    false
  );
$$;

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
ALTER TABLE public.document_activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS document_activity_log_select_admins
  ON public.document_activity_log;
CREATE POLICY document_activity_log_select_admins
  ON public.document_activity_log FOR SELECT TO authenticated
  USING (public.is_app_admin());

DROP POLICY IF EXISTS document_activity_log_insert_managers
  ON public.document_activity_log;
CREATE POLICY document_activity_log_insert_managers
  ON public.document_activity_log FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = actor_id
    AND public.can_manage_documents()
  );
