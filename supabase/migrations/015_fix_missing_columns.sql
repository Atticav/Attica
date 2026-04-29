-- =============================================
-- MIGRATION 015: Fix missing columns
-- =============================================

-- restaurants: coluna opening_hours faltando
ALTER TABLE public.restaurants 
  ADD COLUMN IF NOT EXISTS opening_hours TEXT;

-- template_photography: coluna video_file_url faltando
ALTER TABLE public.template_photography 
  ADD COLUMN IF NOT EXISTS video_file_url TEXT;

-- template_guide: coluna video_file_url faltando
ALTER TABLE public.template_guide 
  ADD COLUMN IF NOT EXISTS video_file_url TEXT;

-- Recarrega cache do PostgREST
NOTIFY pgrst, 'reload schema';
