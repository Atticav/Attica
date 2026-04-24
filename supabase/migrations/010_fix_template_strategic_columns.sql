-- =============================================
-- MIGRATION 010: Fix template_strategic columns
-- =============================================
-- Ensures the 'content' and 'link' columns exist in template_strategic.
-- Run this in Supabase Dashboard → SQL Editor if the columns are missing.
-- =============================================

ALTER TABLE public.template_strategic ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.template_strategic ADD COLUMN IF NOT EXISTS link    TEXT;

-- Reload PostgREST schema cache so the columns become visible immediately
NOTIFY pgrst, 'reload schema';
