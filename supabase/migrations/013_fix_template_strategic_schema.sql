-- =============================================
-- MIGRATION 013: Fix template_strategic schema cache
-- =============================================
-- Garante que as colunas content e url existam na tabela
-- e recarrega o cache de schema do PostgREST.
-- =============================================

ALTER TABLE public.template_strategic ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.template_strategic ADD COLUMN IF NOT EXISTS url     TEXT;

-- Recarrega o cache de schema do PostgREST imediatamente
NOTIFY pgrst, 'reload schema';
