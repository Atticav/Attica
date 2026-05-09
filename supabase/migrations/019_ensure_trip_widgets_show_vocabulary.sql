-- =============================================
-- ATTICA VIAGENS – Garante coluna show_vocabulary em trip_widgets
-- Migração: 019_ensure_trip_widgets_show_vocabulary.sql
-- =============================================

ALTER TABLE public.trip_widgets
  ADD COLUMN IF NOT EXISTS show_vocabulary BOOLEAN;

UPDATE public.trip_widgets
SET show_vocabulary = TRUE
WHERE show_vocabulary IS NULL;

ALTER TABLE public.trip_widgets
  ALTER COLUMN show_vocabulary SET DEFAULT TRUE,
  ALTER COLUMN show_vocabulary SET NOT NULL;

NOTIFY pgrst, 'reload schema';
