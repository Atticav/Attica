-- =============================================
-- ATTICA VIAGENS – Adiciona campos show_cultura e show_restaurantes em trip_widgets
-- Migração: 018_add_show_cultura_restaurantes.sql
-- =============================================

ALTER TABLE public.trip_widgets
  ADD COLUMN IF NOT EXISTS show_cultura BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE public.trip_widgets
  ADD COLUMN IF NOT EXISTS show_restaurantes BOOLEAN NOT NULL DEFAULT TRUE;

NOTIFY pgrst, 'reload schema';
