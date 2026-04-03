-- ============================================================
-- Attica Viagens - Initial Database Schema
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TRIPS TABLE
-- ============================================================
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  destination_id TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'confirmed', 'ongoing', 'completed', 'cancelled')),
  style TEXT,
  notes TEXT,
  budget_link TEXT,
  contract_pdf_url TEXT,
  contract_form_id TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ITINERARY ITEMS TABLE
-- ============================================================
CREATE TABLE public.itinerary_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL DEFAULT 1,
  date DATE,
  time TIME,
  type TEXT NOT NULL DEFAULT 'Passeio' CHECK (type IN ('Embarque', 'Passeio', 'Refeição', 'Transfer', 'Check-in', 'Check-out', 'Livre', 'Hotel', 'Voo')),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  city TEXT,
  priority TEXT NOT NULL DEFAULT 'Média' CHECK (priority IN ('Alta', 'Média', 'Baixa')),
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  confirmation_code TEXT,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'BRL',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FINANCIAL ITEMS TABLE
-- ============================================================
CREATE TABLE public.financial_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  amount_brl DECIMAL(12,2),
  payment_date DATE,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue')),
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DOCUMENTS TABLE
-- ============================================================
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Documento',
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  is_required BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'pending', 'expired')),
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PACKING ITEMS TABLE
-- ============================================================
CREATE TABLE public.packing_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'Geral',
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  is_packed BOOLEAN NOT NULL DEFAULT false,
  is_essential BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CHECKLIST ITEMS TABLE
-- ============================================================
CREATE TABLE public.checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'Geral',
  task TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  due_days_before INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- STRATEGIC SECTIONS TABLE
-- ============================================================
CREATE TABLE public.strategic_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  icon TEXT,
  content TEXT,
  links JSONB DEFAULT '[]'::jsonb,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- GUIDE VIDEOS TABLE
-- ============================================================
CREATE TABLE public.guide_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  file_url TEXT,
  thumbnail_url TEXT,
  platform TEXT CHECK (platform IN ('youtube', 'vimeo', 'upload')),
  category TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- GALLERY PHOTOS TABLE
-- ============================================================
CREATE TABLE public.gallery_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RESTAURANTS TABLE
-- ============================================================
CREATE TABLE public.restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cuisine TEXT,
  city TEXT,
  address TEXT,
  price_range INTEGER CHECK (price_range BETWEEN 1 AND 4),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  description TEXT,
  recommendation_reason TEXT,
  booking_url TEXT,
  maps_url TEXT,
  image_url TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PHOTOGRAPHY TIPS TABLE
-- ============================================================
CREATE TABLE public.photography_tips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'Geral',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  location TEXT,
  best_time TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CULTURAL INFO TABLE
-- ============================================================
CREATE TABLE public.cultural_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'Geral',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  icon TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- VOCABULARY ITEMS TABLE
-- ============================================================
CREATE TABLE public.vocabulary_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  portuguese TEXT NOT NULL,
  translation TEXT NOT NULL,
  pronunciation TEXT,
  category TEXT,
  forvo_url TEXT,
  youglish_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_trips_client_id ON public.trips(client_id);
CREATE INDEX idx_itinerary_trip_id ON public.itinerary_items(trip_id);
CREATE INDEX idx_itinerary_day ON public.itinerary_items(trip_id, day_number);
CREATE INDEX idx_financial_trip_id ON public.financial_items(trip_id);
CREATE INDEX idx_documents_trip_id ON public.documents(trip_id);
CREATE INDEX idx_packing_trip_id ON public.packing_items(trip_id);
CREATE INDEX idx_checklist_trip_id ON public.checklist_items(trip_id);
CREATE INDEX idx_strategic_trip_id ON public.strategic_sections(trip_id);
CREATE INDEX idx_videos_trip_id ON public.guide_videos(trip_id);
CREATE INDEX idx_gallery_trip_id ON public.gallery_photos(trip_id);
CREATE INDEX idx_restaurants_trip_id ON public.restaurants(trip_id);
CREATE INDEX idx_photo_tips_trip_id ON public.photography_tips(trip_id);
CREATE INDEX idx_cultural_trip_id ON public.cultural_info(trip_id);
CREATE INDEX idx_vocabulary_trip_id ON public.vocabulary_items(trip_id);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON public.trips FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_itinerary_updated_at BEFORE UPDATE ON public.itinerary_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_financial_updated_at BEFORE UPDATE ON public.financial_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_packing_updated_at BEFORE UPDATE ON public.packing_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_checklist_updated_at BEFORE UPDATE ON public.checklist_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_strategic_updated_at BEFORE UPDATE ON public.strategic_sections FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON public.guide_videos FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_gallery_updated_at BEFORE UPDATE ON public.gallery_photos FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON public.restaurants FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_photo_tips_updated_at BEFORE UPDATE ON public.photography_tips FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_cultural_updated_at BEFORE UPDATE ON public.cultural_info FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_vocabulary_updated_at BEFORE UPDATE ON public.vocabulary_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================================
-- AUTO-CREATE PROFILE ON AUTH SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'client')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategic_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photography_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cultural_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_items ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- PROFILES POLICIES
CREATE POLICY "Profiles: users see own, admins see all"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "Profiles: users update own"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Profiles: admins insert"
  ON public.profiles FOR INSERT
  WITH CHECK (public.is_admin() OR id = auth.uid());

-- TRIPS POLICIES
CREATE POLICY "Trips: clients see own, admins see all"
  ON public.trips FOR SELECT
  USING (client_id = auth.uid() OR public.is_admin());

CREATE POLICY "Trips: admins insert"
  ON public.trips FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Trips: admins update"
  ON public.trips FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Trips: admins delete"
  ON public.trips FOR DELETE
  USING (public.is_admin());

-- Helper: check if user can access trip data
CREATE OR REPLACE FUNCTION public.can_access_trip(trip_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trips t
    WHERE t.id = trip_id
    AND (t.client_id = auth.uid() OR public.is_admin())
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Generic RLS policy creator for trip-linked tables
DO $do$
DECLARE
  tbl TEXT;
  tbls TEXT[] := ARRAY[
    'itinerary_items', 'financial_items', 'documents', 'packing_items',
    'checklist_items', 'strategic_sections', 'guide_videos', 'gallery_photos',
    'restaurants', 'photography_tips', 'cultural_info', 'vocabulary_items'
  ];
BEGIN
  FOREACH tbl IN ARRAY tbls LOOP
    EXECUTE format('
      CREATE POLICY "%s: read own trip data"
        ON public.%s FOR SELECT
        USING (public.can_access_trip(trip_id));
    ', tbl, tbl);

    EXECUTE format('
      CREATE POLICY "%s: admin insert"
        ON public.%s FOR INSERT
        WITH CHECK (public.is_admin());
    ', tbl, tbl);

    EXECUTE format('
      CREATE POLICY "%s: admin update"
        ON public.%s FOR UPDATE
        USING (public.is_admin());
    ', tbl, tbl);

    EXECUTE format('
      CREATE POLICY "%s: admin delete"
        ON public.%s FOR DELETE
        USING (public.is_admin());
    ', tbl, tbl);
  END LOOP;
END;
$do$;

-- Documents: allow client to upload their own files
CREATE POLICY "Documents: clients insert own"
  ON public.documents FOR INSERT
  WITH CHECK (public.can_access_trip(trip_id));

-- ============================================================
-- HELPER FUNCTION: GET USER TRIPS
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_trips(p_user_id UUID)
RETURNS SETOF public.trips AS $$
BEGIN
  IF public.is_admin() THEN
    RETURN QUERY SELECT * FROM public.trips ORDER BY created_at DESC;
  ELSE
    RETURN QUERY SELECT * FROM public.trips WHERE client_id = p_user_id ORDER BY created_at DESC;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- STORAGE BUCKET SETUP (run in Supabase dashboard or via API)
-- Note: Run this manually in Supabase SQL editor or Storage UI
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('trip-files', 'trip-files', false);
-- CREATE POLICY "Trip files: authenticated users read own" ON storage.objects FOR SELECT USING (auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text);
-- CREATE POLICY "Trip files: authenticated users upload own" ON storage.objects FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text);
-- CREATE POLICY "Trip files: authenticated users delete own" ON storage.objects FOR DELETE USING (auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text);
