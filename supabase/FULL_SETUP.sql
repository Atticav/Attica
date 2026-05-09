-- =============================================
-- ATTICA VIAGENS — FULL SETUP SQL
-- =============================================
-- Este arquivo contém TODO o schema do banco de dados em um único script
-- idempotente. Pode ser executado do zero (banco vazio) ou para sincronizar
-- um banco existente — todos os comandos usam IF NOT EXISTS ou ADD COLUMN IF NOT EXISTS.
--
-- Como usar:
--   Supabase Dashboard → SQL Editor → cole este arquivo → clique em Run
--
-- Última atualização: migration 015
-- =============================================

-- =============================================
-- 1. EXTENSÕES
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 2. FUNÇÃO HELPER: is_admin()
-- =============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- =============================================
-- 3. FUNÇÃO HELPER: update_updated_at_column()
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 4. FUNÇÃO HELPER: handle_new_user()
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 5. TABELA: profiles
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  phone       TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'profiles_updated_at'
  ) THEN
    CREATE TRIGGER profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Migrations 005: language column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'pt-BR';

-- RLS: profiles
DROP POLICY IF EXISTS "Admin acesso total a profiles" ON public.profiles;
CREATE POLICY "Admin acesso total a profiles"
  ON public.profiles FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Usuário lê próprio profile" ON public.profiles;
CREATE POLICY "Usuário lê próprio profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuário atualiza próprio profile" ON public.profiles;
CREATE POLICY "Usuário atualiza próprio profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =============================================
-- 6. TABELA: trips
-- =============================================
CREATE TABLE IF NOT EXISTS public.trips (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  destination     TEXT NOT NULL,
  country         TEXT,
  start_date      DATE,
  end_date        DATE,
  status          TEXT NOT NULL DEFAULT 'planning'
                  CHECK (status IN ('planning', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  cover_image_url TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trips_updated_at'
  ) THEN
    CREATE TRIGGER trips_updated_at
      BEFORE UPDATE ON public.trips
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- RLS: trips
DROP POLICY IF EXISTS "Admin acesso total a trips" ON public.trips;
CREATE POLICY "Admin acesso total a trips"
  ON public.trips FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Cliente lê próprias trips" ON public.trips;
CREATE POLICY "Cliente lê próprias trips"
  ON public.trips FOR SELECT
  USING (auth.uid() = client_id);

-- =============================================
-- 7. TABELA: itinerary_items
-- =============================================
CREATE TABLE IF NOT EXISTS public.itinerary_items (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id           UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  day_number        INTEGER NOT NULL DEFAULT 1,
  date              DATE,
  time              TIME,
  title             TEXT NOT NULL,
  description       TEXT,
  location          TEXT,
  category          TEXT NOT NULL DEFAULT 'other'
                    CHECK (category IN ('flight','hotel','transfer','tour','restaurant','activity','other')),
  confirmation_code TEXT,
  notes             TEXT,
  order_index       INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'itinerary_items_updated_at'
  ) THEN
    CREATE TRIGGER itinerary_items_updated_at
      BEFORE UPDATE ON public.itinerary_items
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Migration 002: coordinates
ALTER TABLE public.itinerary_items ADD COLUMN IF NOT EXISTS latitude  NUMERIC(10,7);
ALTER TABLE public.itinerary_items ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,7);

-- RLS: itinerary_items
DROP POLICY IF EXISTS "Admin acesso total a itinerary_items" ON public.itinerary_items;
CREATE POLICY "Admin acesso total a itinerary_items"
  ON public.itinerary_items FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Cliente lê itinerary_items de suas trips" ON public.itinerary_items;
CREATE POLICY "Cliente lê itinerary_items de suas trips"
  ON public.itinerary_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- =============================================
-- 8. TABELA: financial_items
-- =============================================
CREATE TABLE IF NOT EXISTS public.financial_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id     UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category    TEXT NOT NULL DEFAULT 'other'
              CHECK (category IN ('flight','hotel','transfer','tour','food','shopping','insurance','visa','other')),
  description TEXT NOT NULL,
  amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency    TEXT NOT NULL DEFAULT 'BRL',
  amount_brl  NUMERIC(12,2),
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'paid', 'refunded')),
  due_date    DATE,
  paid_date   DATE,
  receipt_url TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.financial_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'financial_items_updated_at'
  ) THEN
    CREATE TRIGGER financial_items_updated_at
      BEFORE UPDATE ON public.financial_items
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- RLS: financial_items
DROP POLICY IF EXISTS "Admin acesso total a financial_items" ON public.financial_items;
CREATE POLICY "Admin acesso total a financial_items"
  ON public.financial_items FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Cliente lê financial_items de suas trips" ON public.financial_items;
CREATE POLICY "Cliente lê financial_items de suas trips"
  ON public.financial_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

DROP POLICY IF EXISTS "Cliente insere financial_items em suas trips" ON public.financial_items;
CREATE POLICY "Cliente insere financial_items em suas trips"
  ON public.financial_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

DROP POLICY IF EXISTS "Cliente atualiza financial_items de suas trips" ON public.financial_items;
CREATE POLICY "Cliente atualiza financial_items de suas trips"
  ON public.financial_items FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- =============================================
-- 9. TABELA: documents
-- =============================================
CREATE TABLE IF NOT EXISTS public.documents (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id     UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'other'
              CHECK (type IN ('passport','visa','ticket','voucher','insurance','other')),
  title       TEXT NOT NULL,
  description TEXT,
  file_url    TEXT,
  expiry_date DATE,
  notes       TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'documents_updated_at'
  ) THEN
    CREATE TRIGGER documents_updated_at
      BEFORE UPDATE ON public.documents
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- RLS: documents
DROP POLICY IF EXISTS "Admin acesso total a documents" ON public.documents;
CREATE POLICY "Admin acesso total a documents"
  ON public.documents FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Cliente lê documents de suas trips" ON public.documents;
CREATE POLICY "Cliente lê documents de suas trips"
  ON public.documents FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

DROP POLICY IF EXISTS "Cliente insere documents em suas trips" ON public.documents;
CREATE POLICY "Cliente insere documents em suas trips"
  ON public.documents FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

DROP POLICY IF EXISTS "Cliente atualiza documents de suas trips" ON public.documents;
CREATE POLICY "Cliente atualiza documents de suas trips"
  ON public.documents FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- =============================================
-- 10. TABELA: requirements
-- =============================================
CREATE TABLE IF NOT EXISTS public.requirements (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id      UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  deadline     DATE,
  notes        TEXT,
  order_index  INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'requirements_updated_at'
  ) THEN
    CREATE TRIGGER requirements_updated_at
      BEFORE UPDATE ON public.requirements
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- RLS: requirements
DROP POLICY IF EXISTS "Admin acesso total a requirements" ON public.requirements;
CREATE POLICY "Admin acesso total a requirements"
  ON public.requirements FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Cliente lê requirements de suas trips" ON public.requirements;
CREATE POLICY "Cliente lê requirements de suas trips"
  ON public.requirements FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

DROP POLICY IF EXISTS "Cliente atualiza requirements de suas trips" ON public.requirements;
CREATE POLICY "Cliente atualiza requirements de suas trips"
  ON public.requirements FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- =============================================
-- 11. TABELA: packing_items
-- =============================================
CREATE TABLE IF NOT EXISTS public.packing_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id      UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  category     TEXT NOT NULL DEFAULT 'other'
               CHECK (category IN ('clothing','documents','health','electronics','toiletries','accessories','other')),
  item_name    TEXT NOT NULL,
  quantity     INTEGER NOT NULL DEFAULT 1,
  is_packed    BOOLEAN NOT NULL DEFAULT FALSE,
  is_essential BOOLEAN NOT NULL DEFAULT FALSE,
  notes        TEXT,
  order_index  INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.packing_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'packing_items_updated_at'
  ) THEN
    CREATE TRIGGER packing_items_updated_at
      BEFORE UPDATE ON public.packing_items
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- RLS: packing_items
DROP POLICY IF EXISTS "Admin acesso total a packing_items" ON public.packing_items;
CREATE POLICY "Admin acesso total a packing_items"
  ON public.packing_items FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Cliente lê packing_items de suas trips" ON public.packing_items;
CREATE POLICY "Cliente lê packing_items de suas trips"
  ON public.packing_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

DROP POLICY IF EXISTS "Cliente atualiza packing_items de suas trips" ON public.packing_items;
CREATE POLICY "Cliente atualiza packing_items de suas trips"
  ON public.packing_items FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- =============================================
-- 12. TABELA: checklist_items
-- =============================================
CREATE TABLE IF NOT EXISTS public.checklist_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id      UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  section      TEXT NOT NULL DEFAULT 'geral',
  title        TEXT NOT NULL,
  description  TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  deadline     DATE,
  order_index  INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'checklist_items_updated_at'
  ) THEN
    CREATE TRIGGER checklist_items_updated_at
      BEFORE UPDATE ON public.checklist_items
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- RLS: checklist_items
DROP POLICY IF EXISTS "Admin acesso total a checklist_items" ON public.checklist_items;
CREATE POLICY "Admin acesso total a checklist_items"
  ON public.checklist_items FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Cliente lê checklist_items de suas trips" ON public.checklist_items;
CREATE POLICY "Cliente lê checklist_items de suas trips"
  ON public.checklist_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

DROP POLICY IF EXISTS "Cliente atualiza checklist_items de suas trips" ON public.checklist_items;
CREATE POLICY "Cliente atualiza checklist_items de suas trips"
  ON public.checklist_items FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- =============================================
-- 13. TABELA: strategic_sections
-- =============================================
CREATE TABLE IF NOT EXISTS public.strategic_sections (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id     UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  content     TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.strategic_sections ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'strategic_sections_updated_at'
  ) THEN
    CREATE TRIGGER strategic_sections_updated_at
      BEFORE UPDATE ON public.strategic_sections
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Migration 006: image_url column
ALTER TABLE public.strategic_sections ADD COLUMN IF NOT EXISTS image_url TEXT;

-- RLS: strategic_sections
DROP POLICY IF EXISTS "Admin acesso total a strategic_sections" ON public.strategic_sections;
CREATE POLICY "Admin acesso total a strategic_sections"
  ON public.strategic_sections FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Cliente lê strategic_sections de suas trips" ON public.strategic_sections;
CREATE POLICY "Cliente lê strategic_sections de suas trips"
  ON public.strategic_sections FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- =============================================
-- 14. TABELA: strategic_links
-- =============================================
CREATE TABLE IF NOT EXISTS public.strategic_links (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id     UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  url         TEXT NOT NULL,
  description TEXT,
  category    TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.strategic_links ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'strategic_links_updated_at'
  ) THEN
    CREATE TRIGGER strategic_links_updated_at
      BEFORE UPDATE ON public.strategic_links
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- RLS: strategic_links
DROP POLICY IF EXISTS "Admin acesso total a strategic_links" ON public.strategic_links;
CREATE POLICY "Admin acesso total a strategic_links"
  ON public.strategic_links FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Cliente lê strategic_links de suas trips" ON public.strategic_links;
CREATE POLICY "Cliente lê strategic_links de suas trips"
  ON public.strategic_links FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- =============================================
-- 15. TABELA: tutorials
-- =============================================
CREATE TABLE IF NOT EXISTS public.tutorials (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id          UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT,
  type             TEXT NOT NULL DEFAULT 'youtube'
                   CHECK (type IN ('video','youtube','pdf','link')),
  url              TEXT NOT NULL,
  thumbnail_url    TEXT,
  duration_minutes INTEGER,
  order_index      INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'tutorials_updated_at'
  ) THEN
    CREATE TRIGGER tutorials_updated_at
      BEFORE UPDATE ON public.tutorials
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- RLS: tutorials
DROP POLICY IF EXISTS "Admin acesso total a tutorials" ON public.tutorials;
CREATE POLICY "Admin acesso total a tutorials"
  ON public.tutorials FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Cliente lê tutorials de suas trips" ON public.tutorials;
CREATE POLICY "Cliente lê tutorials de suas trips"
  ON public.tutorials FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- =============================================
-- 16. TABELA: gallery_items
-- =============================================
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id       UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  type          TEXT NOT NULL DEFAULT 'photo' CHECK (type IN ('photo','video')),
  title         TEXT,
  description   TEXT,
  file_url      TEXT NOT NULL,
  thumbnail_url TEXT,
  location      TEXT,
  taken_at      TIMESTAMPTZ,
  order_index   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'gallery_items_updated_at'
  ) THEN
    CREATE TRIGGER gallery_items_updated_at
      BEFORE UPDATE ON public.gallery_items
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- RLS: gallery_items
DROP POLICY IF EXISTS "Admin acesso total a gallery_items" ON public.gallery_items;
CREATE POLICY "Admin acesso total a gallery_items"
  ON public.gallery_items FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Cliente lê gallery_items de suas trips" ON public.gallery_items;
CREATE POLICY "Cliente lê gallery_items de suas trips"
  ON public.gallery_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

DROP POLICY IF EXISTS "Cliente insere gallery_items em suas trips" ON public.gallery_items;
CREATE POLICY "Cliente insere gallery_items em suas trips"
  ON public.gallery_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- =============================================
-- 17. TABELA: restaurants
-- =============================================
CREATE TABLE IF NOT EXISTS public.restaurants (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id              UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,
  category             TEXT NOT NULL DEFAULT 'casual'
                       CHECK (category IN ('fine_dining','casual','street_food','cafe','bar','other')),
  cuisine              TEXT,
  address              TEXT,
  google_maps_url      TEXT,
  website_url          TEXT,
  reservation_required BOOLEAN NOT NULL DEFAULT FALSE,
  price_range          INTEGER CHECK (price_range BETWEEN 1 AND 4),
  rating               NUMERIC(2,1) CHECK (rating BETWEEN 0 AND 5),
  attica_notes         TEXT,
  is_recommended       BOOLEAN NOT NULL DEFAULT TRUE,
  order_index          INTEGER NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'restaurants_updated_at'
  ) THEN
    CREATE TRIGGER restaurants_updated_at
      BEFORE UPDATE ON public.restaurants
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Migration 006: photo_url column
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS photo_url     TEXT;
-- Migration 015: opening_hours column
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS opening_hours TEXT;

-- RLS: restaurants
DROP POLICY IF EXISTS "Admin acesso total a restaurants" ON public.restaurants;
CREATE POLICY "Admin acesso total a restaurants"
  ON public.restaurants FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Cliente lê restaurants de suas trips" ON public.restaurants;
CREATE POLICY "Cliente lê restaurants de suas trips"
  ON public.restaurants FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- =============================================
-- 18. TABELA: photography_tips
-- =============================================
CREATE TABLE IF NOT EXISTS public.photography_tips (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id     UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  location    TEXT,
  best_time   TEXT,
  tip_text    TEXT NOT NULL,
  image_url   TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.photography_tips ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'photography_tips_updated_at'
  ) THEN
    CREATE TRIGGER photography_tips_updated_at
      BEFORE UPDATE ON public.photography_tips
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Migration 006: video_url column
ALTER TABLE public.photography_tips ADD COLUMN IF NOT EXISTS video_url TEXT;

-- RLS: photography_tips
DROP POLICY IF EXISTS "Admin acesso total a photography_tips" ON public.photography_tips;
CREATE POLICY "Admin acesso total a photography_tips"
  ON public.photography_tips FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Cliente lê photography_tips de suas trips" ON public.photography_tips;
CREATE POLICY "Cliente lê photography_tips de suas trips"
  ON public.photography_tips FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- =============================================
-- 19. TABELA: cultural_info
-- =============================================
CREATE TABLE IF NOT EXISTS public.cultural_info (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id      UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  category     TEXT NOT NULL DEFAULT 'geral',
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,
  is_important BOOLEAN NOT NULL DEFAULT FALSE,
  order_index  INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.cultural_info ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'cultural_info_updated_at'
  ) THEN
    CREATE TRIGGER cultural_info_updated_at
      BEFORE UPDATE ON public.cultural_info
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Migration 006: image_url column
ALTER TABLE public.cultural_info ADD COLUMN IF NOT EXISTS image_url TEXT;

-- RLS: cultural_info
DROP POLICY IF EXISTS "Admin acesso total a cultural_info" ON public.cultural_info;
CREATE POLICY "Admin acesso total a cultural_info"
  ON public.cultural_info FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Cliente lê cultural_info de suas trips" ON public.cultural_info;
CREATE POLICY "Cliente lê cultural_info de suas trips"
  ON public.cultural_info FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- =============================================
-- 20. TABELA: vocabulary
-- =============================================
CREATE TABLE IF NOT EXISTS public.vocabulary (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id         UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  portuguese      TEXT NOT NULL,
  local_language  TEXT NOT NULL,
  pronunciation   TEXT,
  category        TEXT,
  order_index     INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.vocabulary ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'vocabulary_updated_at'
  ) THEN
    CREATE TRIGGER vocabulary_updated_at
      BEFORE UPDATE ON public.vocabulary
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- RLS: vocabulary
DROP POLICY IF EXISTS "Admin acesso total a vocabulary" ON public.vocabulary;
CREATE POLICY "Admin acesso total a vocabulary"
  ON public.vocabulary FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Cliente lê vocabulary de suas trips" ON public.vocabulary;
CREATE POLICY "Cliente lê vocabulary de suas trips"
  ON public.vocabulary FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- =============================================
-- 21. TABELA: contracts
-- =============================================
CREATE TABLE IF NOT EXISTS public.contracts (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id    UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  content    TEXT,
  file_url   TEXT,
  status     TEXT NOT NULL DEFAULT 'draft'
             CHECK (status IN ('draft','sent','signed','cancelled')),
  sent_at    TIMESTAMPTZ,
  signed_at  TIMESTAMPTZ,
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'contracts_updated_at'
  ) THEN
    CREATE TRIGGER contracts_updated_at
      BEFORE UPDATE ON public.contracts
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- RLS: contracts
DROP POLICY IF EXISTS "Admin acesso total a contracts" ON public.contracts;
CREATE POLICY "Admin acesso total a contracts"
  ON public.contracts FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Cliente lê contracts de suas trips" ON public.contracts;
CREATE POLICY "Cliente lê contracts de suas trips"
  ON public.contracts FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- =============================================
-- 22. TABELA: trip_widgets
-- =============================================
CREATE TABLE IF NOT EXISTS public.trip_widgets (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id          UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE UNIQUE,
  travel_style     TEXT,
  ideal_duration   TEXT,
  custom_notes     TEXT,
  show_weather     BOOLEAN NOT NULL DEFAULT TRUE,
  show_currency    BOOLEAN NOT NULL DEFAULT TRUE,
  show_map_button  BOOLEAN NOT NULL DEFAULT TRUE,
  show_vocabulary  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.trip_widgets ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trip_widgets_updated_at'
  ) THEN
    CREATE TRIGGER trip_widgets_updated_at
      BEFORE UPDATE ON public.trip_widgets
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- RLS: trip_widgets
DROP POLICY IF EXISTS "Admin acesso total a trip_widgets" ON public.trip_widgets;
CREATE POLICY "Admin acesso total a trip_widgets"
  ON public.trip_widgets FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Cliente lê trip_widgets de suas trips" ON public.trip_widgets;
CREATE POLICY "Cliente lê trip_widgets de suas trips"
  ON public.trip_widgets FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- =============================================
-- 23. TABELA: company_transactions
-- =============================================
CREATE TABLE IF NOT EXISTS public.company_transactions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type        TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category    TEXT NOT NULL DEFAULT 'other'
              CHECK (category IN ('service_fee', 'commission', 'salary', 'rent', 'marketing', 'tools', 'travel', 'tax', 'other')),
  description TEXT NOT NULL,
  amount      NUMERIC(12,2) NOT NULL,
  currency    TEXT NOT NULL DEFAULT 'BRL',
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  client_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  trip_id     UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  status      TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.company_transactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'company_transactions_updated_at'
  ) THEN
    CREATE TRIGGER company_transactions_updated_at
      BEFORE UPDATE ON public.company_transactions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- RLS: company_transactions
DROP POLICY IF EXISTS "Admin acesso total a company_transactions" ON public.company_transactions;
CREATE POLICY "Admin acesso total a company_transactions"
  ON public.company_transactions FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- =============================================
-- 24. TABELA: client_payments
-- =============================================
CREATE TABLE IF NOT EXISTS public.client_payments (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trip_id        UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  description    TEXT NOT NULL,
  amount         NUMERIC(12,2) NOT NULL,
  due_date       DATE,
  paid_date      DATE,
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  payment_method TEXT CHECK (payment_method IN ('pix', 'credit_card', 'bank_transfer', 'cash', 'other')),
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.client_payments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'client_payments_updated_at'
  ) THEN
    CREATE TRIGGER client_payments_updated_at
      BEFORE UPDATE ON public.client_payments
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- RLS: client_payments
DROP POLICY IF EXISTS "Admin acesso total a client_payments" ON public.client_payments;
CREATE POLICY "Admin acesso total a client_payments"
  ON public.client_payments FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- =============================================
-- 25. TABELA: planner_tasks
-- =============================================
CREATE TABLE IF NOT EXISTS public.planner_tasks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT,
  trip_id     UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  client_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date    DATE,
  priority    TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status      TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'cancelled')),
  category    TEXT NOT NULL DEFAULT 'itinerary' CHECK (category IN ('itinerary', 'documents', 'payment', 'client_contact', 'booking', 'other')),
  notes       TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.planner_tasks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'planner_tasks_updated_at'
  ) THEN
    CREATE TRIGGER planner_tasks_updated_at
      BEFORE UPDATE ON public.planner_tasks
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- RLS: planner_tasks
DROP POLICY IF EXISTS "Admin acesso total a planner_tasks" ON public.planner_tasks;
CREATE POLICY "Admin acesso total a planner_tasks"
  ON public.planner_tasks FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- =============================================
-- 26. TABELA: template_packing
-- =============================================
CREATE TABLE IF NOT EXISTS public.template_packing (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name    TEXT NOT NULL,
  category     TEXT,
  quantity     INTEGER DEFAULT 1,
  is_essential BOOLEAN DEFAULT FALSE,
  notes        TEXT,
  order_index  INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.template_packing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin acesso total a template_packing" ON public.template_packing;
CREATE POLICY "Admin acesso total a template_packing"
  ON public.template_packing FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- =============================================
-- 27. TABELA: template_checklist
-- =============================================
CREATE TABLE IF NOT EXISTS public.template_checklist (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT NOT NULL,
  section     TEXT,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.template_checklist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin acesso total a template_checklist" ON public.template_checklist;
CREATE POLICY "Admin acesso total a template_checklist"
  ON public.template_checklist FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- =============================================
-- 28. TABELA: template_strategic
-- =============================================
CREATE TABLE IF NOT EXISTS public.template_strategic (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT NOT NULL,
  content     TEXT,
  order_index INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.template_strategic ENABLE ROW LEVEL SECURITY;

-- Migrations 010/011/013: url column
ALTER TABLE public.template_strategic ADD COLUMN IF NOT EXISTS url TEXT;

DROP POLICY IF EXISTS "Admin acesso total a template_strategic" ON public.template_strategic;
CREATE POLICY "Admin acesso total a template_strategic"
  ON public.template_strategic FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- =============================================
-- 29. TABELA: template_guide
-- =============================================
CREATE TABLE IF NOT EXISTS public.template_guide (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT NOT NULL,
  type        TEXT,
  url         TEXT,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.template_guide ENABLE ROW LEVEL SECURITY;

-- Migration 015: video_file_url column
ALTER TABLE public.template_guide ADD COLUMN IF NOT EXISTS video_file_url TEXT;

DROP POLICY IF EXISTS "Admin acesso total a template_guide" ON public.template_guide;
CREATE POLICY "Admin acesso total a template_guide"
  ON public.template_guide FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- =============================================
-- 30. TABELA: template_photography
-- =============================================
CREATE TABLE IF NOT EXISTS public.template_photography (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT,
  tip_text    TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.template_photography ENABLE ROW LEVEL SECURITY;

-- Migration 015: video_file_url column
ALTER TABLE public.template_photography ADD COLUMN IF NOT EXISTS video_file_url TEXT;

DROP POLICY IF EXISTS "Admin acesso total a template_photography" ON public.template_photography;
CREATE POLICY "Admin acesso total a template_photography"
  ON public.template_photography FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- =============================================
-- 31. TABELA: template_vocabulary
-- =============================================
CREATE TABLE IF NOT EXISTS public.template_vocabulary (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  portuguese     TEXT NOT NULL,
  local_language TEXT,
  pronunciation  TEXT,
  category       TEXT,
  order_index    INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.template_vocabulary ENABLE ROW LEVEL SECURITY;

-- Migration 012: language_code column
ALTER TABLE public.template_vocabulary ADD COLUMN IF NOT EXISTS language_code TEXT DEFAULT 'en';

DROP POLICY IF EXISTS "Admin acesso total a template_vocabulary" ON public.template_vocabulary;
CREATE POLICY "Admin acesso total a template_vocabulary"
  ON public.template_vocabulary FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- =============================================
-- 32. TABELA: gallery_albums
-- =============================================
CREATE TABLE IF NOT EXISTS public.gallery_albums (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id     UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  visible     BOOLEAN NOT NULL DEFAULT TRUE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;

-- gallery_items.album_id foreign key (depends on gallery_albums existing first)
ALTER TABLE public.gallery_items
  ADD COLUMN IF NOT EXISTS album_id UUID REFERENCES public.gallery_albums(id) ON DELETE SET NULL;

DROP POLICY IF EXISTS "Admin acesso total a gallery_albums" ON public.gallery_albums;
CREATE POLICY "Admin acesso total a gallery_albums"
  ON public.gallery_albums FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Cliente lê gallery_albums de suas trips" ON public.gallery_albums;
CREATE POLICY "Cliente lê gallery_albums de suas trips"
  ON public.gallery_albums FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- =============================================
-- 33. TABELA: template_gallery
-- =============================================
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

-- =============================================
-- 34. STORAGE POLICIES: bucket documents
-- Nota: criar o bucket 'documents' manualmente no Supabase Dashboard antes de executar.
-- =============================================

DROP POLICY IF EXISTS "Cliente upload documents de suas trips" ON storage.objects;
CREATE POLICY "Cliente upload documents de suas trips"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.trips
      WHERE id = (storage.foldername(name))[1]::uuid
      AND client_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Cliente lê documents de suas trips" ON storage.objects;
CREATE POLICY "Cliente lê documents de suas trips"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.trips
      WHERE id = (storage.foldername(name))[1]::uuid
      AND client_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admin acesso total a documents storage" ON storage.objects;
CREATE POLICY "Admin acesso total a documents storage"
  ON storage.objects FOR ALL
  USING (bucket_id = 'documents' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK (bucket_id = 'documents' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- =============================================
-- 35. RECARREGA CACHE DO POSTGREST
-- =============================================
NOTIFY pgrst, 'reload schema';
