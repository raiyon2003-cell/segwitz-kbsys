-- Divisions RLS: all authenticated roles can read/insert/update (and delete) without is_admin().
-- Drops legacy admin-only policy names so members are not blocked.

ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS divisions_select_auth ON public.divisions;
DROP POLICY IF EXISTS divisions_insert_admin ON public.divisions;
DROP POLICY IF EXISTS divisions_update_admin ON public.divisions;
DROP POLICY IF EXISTS divisions_delete_admin ON public.divisions;

DROP POLICY IF EXISTS "Allow read access" ON public.divisions;
DROP POLICY IF EXISTS "Allow insert" ON public.divisions;
DROP POLICY IF EXISTS "Allow update" ON public.divisions;
DROP POLICY IF EXISTS "Allow delete" ON public.divisions;

CREATE POLICY "Allow read access"
  ON public.divisions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert"
  ON public.divisions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update"
  ON public.divisions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete"
  ON public.divisions
  FOR DELETE
  TO authenticated
  USING (true);
