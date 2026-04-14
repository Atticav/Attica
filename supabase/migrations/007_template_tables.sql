-- =============================================
-- MIGRATION 007: Template tables
-- =============================================

-- template_packing
CREATE TABLE IF NOT EXISTS public.template_packing (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name   TEXT NOT NULL,
  category    TEXT,
  quantity    INTEGER DEFAULT 1,
  is_essential BOOLEAN DEFAULT FALSE,
  notes       TEXT,
  order_index INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.template_packing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin acesso total a template_packing"
  ON public.template_packing FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- template_checklist
CREATE TABLE IF NOT EXISTS public.template_checklist (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT NOT NULL,
  section     TEXT,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.template_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin acesso total a template_checklist"
  ON public.template_checklist FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- template_strategic
CREATE TABLE IF NOT EXISTS public.template_strategic (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT NOT NULL,
  content     TEXT,
  order_index INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.template_strategic ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin acesso total a template_strategic"
  ON public.template_strategic FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- template_guide
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

CREATE POLICY "Admin acesso total a template_guide"
  ON public.template_guide FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- template_photography
CREATE TABLE IF NOT EXISTS public.template_photography (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT NOT NULL,
  tip_text    TEXT,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.template_photography ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin acesso total a template_photography"
  ON public.template_photography FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- template_vocabulary
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

CREATE POLICY "Admin acesso total a template_vocabulary"
  ON public.template_vocabulary FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());
