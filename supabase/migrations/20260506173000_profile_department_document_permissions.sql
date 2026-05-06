alter table if exists public.profiles
  add column if not exists department text;

alter table if exists public.profiles
  add column if not exists document_permissions jsonb;
