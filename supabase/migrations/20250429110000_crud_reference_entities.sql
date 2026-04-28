-- Reference data tables for CRUD (run after profiles migration).
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT divisions_slug_ck CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  division_id UUID NOT NULL REFERENCES public.divisions (id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT departments_slug_ck CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT departments_slug_per_division UNIQUE (division_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_departments_division_id ON public.departments (division_id);

CREATE TABLE IF NOT EXISTS public.document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT document_types_slug_ck CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

CREATE TABLE IF NOT EXISTS public.process_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT process_categories_slug_ck CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT tags_slug_ck CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT tags_color_ck CHECK (
    color IS NULL OR color ~ '^#[0-9A-Fa-f]{6}$'
  )
);

CREATE INDEX IF NOT EXISTS idx_tags_slug ON public.tags (slug);

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
      AND p.role = 'admin'::public.app_role
  );
$$;

COMMENT ON FUNCTION public.is_admin IS 'True when current auth user profile role is admin.';

DROP TRIGGER IF EXISTS divisions_set_updated_at ON public.divisions;
CREATE TRIGGER divisions_set_updated_at
  BEFORE UPDATE ON public.divisions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS departments_set_updated_at ON public.departments;
CREATE TRIGGER departments_set_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS document_types_set_updated_at ON public.document_types;
CREATE TRIGGER document_types_set_updated_at
  BEFORE UPDATE ON public.document_types
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS process_categories_set_updated_at ON public.process_categories;
CREATE TRIGGER process_categories_set_updated_at
  BEFORE UPDATE ON public.process_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS tags_set_updated_at ON public.tags;
CREATE TRIGGER tags_set_updated_at
  BEFORE UPDATE ON public.tags
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS divisions_select_auth ON public.divisions;
CREATE POLICY divisions_select_auth
  ON public.divisions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS divisions_insert_admin ON public.divisions;
CREATE POLICY divisions_insert_admin
  ON public.divisions FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS divisions_update_admin ON public.divisions;
CREATE POLICY divisions_update_admin
  ON public.divisions FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS divisions_delete_admin ON public.divisions;
CREATE POLICY divisions_delete_admin
  ON public.divisions FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS departments_select_auth ON public.departments;
CREATE POLICY departments_select_auth
  ON public.departments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS departments_insert_admin ON public.departments;
CREATE POLICY departments_insert_admin
  ON public.departments FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS departments_update_admin ON public.departments;
CREATE POLICY departments_update_admin
  ON public.departments FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS departments_delete_admin ON public.departments;
CREATE POLICY departments_delete_admin
  ON public.departments FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS document_types_select_auth ON public.document_types;
CREATE POLICY document_types_select_auth
  ON public.document_types FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS document_types_insert_admin ON public.document_types;
CREATE POLICY document_types_insert_admin
  ON public.document_types FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS document_types_update_admin ON public.document_types;
CREATE POLICY document_types_update_admin
  ON public.document_types FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS document_types_delete_admin ON public.document_types;
CREATE POLICY document_types_delete_admin
  ON public.document_types FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS process_categories_select_auth ON public.process_categories;
CREATE POLICY process_categories_select_auth
  ON public.process_categories FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS process_categories_insert_admin ON public.process_categories;
CREATE POLICY process_categories_insert_admin
  ON public.process_categories FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS process_categories_update_admin ON public.process_categories;
CREATE POLICY process_categories_update_admin
  ON public.process_categories FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS process_categories_delete_admin ON public.process_categories;
CREATE POLICY process_categories_delete_admin
  ON public.process_categories FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS tags_select_auth ON public.tags;
CREATE POLICY tags_select_auth
  ON public.tags FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS tags_insert_admin ON public.tags;
CREATE POLICY tags_insert_admin
  ON public.tags FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS tags_update_admin ON public.tags;
CREATE POLICY tags_update_admin
  ON public.tags FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS tags_delete_admin ON public.tags;
CREATE POLICY tags_delete_admin
  ON public.tags FOR DELETE TO authenticated USING (public.is_admin());

ALTER TABLE public.tags ADD COLUMN IF NOT EXISTS description TEXT;
