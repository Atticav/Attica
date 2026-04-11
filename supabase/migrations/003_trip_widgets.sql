-- =============================================
-- ATTICA VIAGENS – Configurações de Widgets por Viagem
-- Migração: 003_trip_widgets.sql
-- =============================================

-- Configurações de widgets por viagem (editadas pelo admin)
CREATE TABLE IF NOT EXISTS public.trip_widgets (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id       UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE UNIQUE,
  travel_style  TEXT,
  ideal_duration TEXT,
  custom_notes  TEXT,
  show_weather  BOOLEAN NOT NULL DEFAULT TRUE,
  show_currency BOOLEAN NOT NULL DEFAULT TRUE,
  show_map_button BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.trip_widgets ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trip_widgets_updated_at
  BEFORE UPDATE ON public.trip_widgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE POLICY "Admin acesso total a trip_widgets"
  ON public.trip_widgets FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Cliente lê trip_widgets de suas trips"
  ON public.trip_widgets FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));
