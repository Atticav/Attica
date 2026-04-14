-- =============================================
-- MIGRATION 008: Gallery Albums
-- =============================================

-- gallery_albums
CREATE TABLE IF NOT EXISTS public.gallery_albums (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id     UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  visible     BOOLEAN NOT NULL DEFAULT TRUE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin acesso total a gallery_albums"
  ON public.gallery_albums FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Cliente lê gallery_albums de suas trips"
  ON public.gallery_albums FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- Add album_id column to gallery_items
ALTER TABLE public.gallery_items
  ADD COLUMN IF NOT EXISTS album_id UUID REFERENCES public.gallery_albums(id) ON DELETE SET NULL;
