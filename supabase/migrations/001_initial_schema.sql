-- =============================================
-- ATTICA VIAGENS – Schema Inicial
-- Migração: 001_initial_schema.sql
-- =============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- FUNÇÃO HELPER: is_admin()
-- =============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- =============================================
-- TABELA: profiles
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

-- Trigger: atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: criar profile ao registrar usuário
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

-- RLS Policies: profiles
CREATE POLICY "Admin acesso total a profiles"
  ON public.profiles FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Usuário lê próprio profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuário atualiza próprio profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =============================================
-- TABELA: trips
-- =============================================
CREATE TABLE IF NOT EXISTS public.trips (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  destination   TEXT NOT NULL,
  country       TEXT,
  start_date    DATE,
  end_date      DATE,
  status        TEXT NOT NULL DEFAULT 'planning'
                CHECK (status IN ('planning', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  cover_image_url TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies: trips
CREATE POLICY "Admin acesso total a trips"
  ON public.trips FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Cliente lê próprias trips"
  ON public.trips FOR SELECT
  USING (auth.uid() = client_id);

-- =============================================
-- TABELA: itinerary_items
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

CREATE TRIGGER itinerary_items_updated_at
  BEFORE UPDATE ON public.itinerary_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE POLICY "Admin acesso total a itinerary_items"
  ON public.itinerary_items FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Cliente lê itinerary_items de suas trips"
  ON public.itinerary_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- =============================================
-- TABELA: financial_items
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

CREATE TRIGGER financial_items_updated_at
  BEFORE UPDATE ON public.financial_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE POLICY "Admin acesso total a financial_items"
  ON public.financial_items FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Cliente lê financial_items de suas trips"
  ON public.financial_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- =============================================
-- TABELA: documents
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

CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE POLICY "Admin acesso total a documents"
  ON public.documents FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Cliente lê documents de suas trips"
  ON public.documents FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- =============================================
-- TABELA: requirements
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

CREATE TRIGGER requirements_updated_at
  BEFORE UPDATE ON public.requirements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE POLICY "Admin acesso total a requirements"
  ON public.requirements FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Cliente lê requirements de suas trips"
  ON public.requirements FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

CREATE POLICY "Cliente atualiza requirements de suas trips"
  ON public.requirements FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- =============================================
-- TABELA: packing_items
-- =============================================
CREATE TABLE IF NOT EXISTS public.packing_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id     UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  category    TEXT NOT NULL DEFAULT 'other'
              CHECK (category IN ('clothing','documents','health','electronics','toiletries','accessories','other')),
  item_name   TEXT NOT NULL,
  quantity    INTEGER NOT NULL DEFAULT 1,
  is_packed   BOOLEAN NOT NULL DEFAULT FALSE,
  is_essential BOOLEAN NOT NULL DEFAULT FALSE,
  notes       TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.packing_items ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER packing_items_updated_at
  BEFORE UPDATE ON public.packing_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE POLICY "Admin acesso total a packing_items"
  ON public.packing_items FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Cliente lê packing_items de suas trips"
  ON public.packing_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

CREATE POLICY "Cliente atualiza packing_items de suas trips"
  ON public.packing_items FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- =============================================
-- TABELA: checklist_items
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

CREATE TRIGGER checklist_items_updated_at
  BEFORE UPDATE ON public.checklist_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE POLICY "Admin acesso total a checklist_items"
  ON public.checklist_items FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Cliente lê checklist_items de suas trips"
  ON public.checklist_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

CREATE POLICY "Cliente atualiza checklist_items de suas trips"
  ON public.checklist_items FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- =============================================
-- TABELA: strategic_sections
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

CREATE TRIGGER strategic_sections_updated_at
  BEFORE UPDATE ON public.strategic_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE POLICY "Admin acesso total a strategic_sections"
  ON public.strategic_sections FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Cliente lê strategic_sections de suas trips"
  ON public.strategic_sections FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- =============================================
-- TABELA: strategic_links
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

CREATE TRIGGER strategic_links_updated_at
  BEFORE UPDATE ON public.strategic_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE POLICY "Admin acesso total a strategic_links"
  ON public.strategic_links FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Cliente lê strategic_links de suas trips"
  ON public.strategic_links FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- =============================================
-- TABELA: tutorials
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

CREATE TRIGGER tutorials_updated_at
  BEFORE UPDATE ON public.tutorials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE POLICY "Admin acesso total a tutorials"
  ON public.tutorials FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Cliente lê tutorials de suas trips"
  ON public.tutorials FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- =============================================
-- TABELA: gallery_items
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

CREATE TRIGGER gallery_items_updated_at
  BEFORE UPDATE ON public.gallery_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE POLICY "Admin acesso total a gallery_items"
  ON public.gallery_items FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Cliente lê gallery_items de suas trips"
  ON public.gallery_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

CREATE POLICY "Cliente insere gallery_items em suas trips"
  ON public.gallery_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- =============================================
-- TABELA: restaurants
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

CREATE TRIGGER restaurants_updated_at
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE POLICY "Admin acesso total a restaurants"
  ON public.restaurants FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Cliente lê restaurants de suas trips"
  ON public.restaurants FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- =============================================
-- TABELA: photography_tips
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

CREATE TRIGGER photography_tips_updated_at
  BEFORE UPDATE ON public.photography_tips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE POLICY "Admin acesso total a photography_tips"
  ON public.photography_tips FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Cliente lê photography_tips de suas trips"
  ON public.photography_tips FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- =============================================
-- TABELA: cultural_info
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

CREATE TRIGGER cultural_info_updated_at
  BEFORE UPDATE ON public.cultural_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE POLICY "Admin acesso total a cultural_info"
  ON public.cultural_info FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Cliente lê cultural_info de suas trips"
  ON public.cultural_info FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- =============================================
-- TABELA: vocabulary
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

CREATE TRIGGER vocabulary_updated_at
  BEFORE UPDATE ON public.vocabulary
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE POLICY "Admin acesso total a vocabulary"
  ON public.vocabulary FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Cliente lê vocabulary de suas trips"
  ON public.vocabulary FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- =============================================
-- TABELA: contracts
-- =============================================
CREATE TABLE IF NOT EXISTS public.contracts (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id   UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  title     TEXT NOT NULL,
  content   TEXT,
  file_url  TEXT,
  status    TEXT NOT NULL DEFAULT 'draft'
            CHECK (status IN ('draft','sent','signed','cancelled')),
  sent_at   TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  notes     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE POLICY "Admin acesso total a contracts"
  ON public.contracts FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Cliente lê contracts de suas trips"
  ON public.contracts FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));
