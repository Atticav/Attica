-- =============================================
-- MIGRATION 014: Fix gallery_albums setup
-- =============================================

-- Garante que a tabela gallery_albums existe
CREATE TABLE IF NOT EXISTS public.gallery_albums (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id     UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  visible     BOOLEAN NOT NULL DEFAULT TRUE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;

-- Policies (idempotent via DROP IF EXISTS + CREATE)
DROP POLICY IF EXISTS "Admin acesso total a gallery_albums" ON public.gallery_albums;
CREATE POLICY "Admin acesso total a gallery_albums"
  ON public.gallery_albums FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Cliente lê gallery_albums de suas trips" ON public.gallery_albums;
CREATE POLICY "Cliente lê gallery_albums de suas trips"
  ON public.gallery_albums FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- Garante que gallery_items tem a coluna album_id
ALTER TABLE public.gallery_items
  ADD COLUMN IF NOT EXISTS album_id UUID REFERENCES public.gallery_albums(id) ON DELETE SET NULL;

-- Tabela para template de álbuns de galeria
CREATE TABLE IF NOT EXISTS public.template_gallery (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.template_gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin acesso total a template_gallery" ON public.template_gallery;
CREATE POLICY "Admin acesso total a template_gallery"
  ON public.template_gallery FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- Recarrega schema cache do PostgREST
NOTIFY pgrst, 'reload schema';
