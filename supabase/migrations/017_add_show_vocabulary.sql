-- =============================================
-- ATTICA VIAGENS – Adiciona campo show_vocabulary em trip_widgets
-- Migração: 017_add_show_vocabulary.sql
-- =============================================

ALTER TABLE public.trip_widgets
  ADD COLUMN IF NOT EXISTS show_vocabulary BOOLEAN NOT NULL DEFAULT TRUE;

NOTIFY pgrst, 'reload schema';
