-- =============================================
-- MIGRATION 016: Fix template_guide description column and template_photography RLS
-- =============================================

-- template_guide: adicionar coluna description se não existir
ALTER TABLE public.template_guide
  ADD COLUMN IF NOT EXISTS description TEXT;

-- template_photography: recriar policy (pode estar corrompida)
DROP POLICY IF EXISTS "Admin acesso total a template_photography" ON public.template_photography;
CREATE POLICY "Admin acesso total a template_photography"
  ON public.template_photography FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- template_guide: recriar policy também por segurança
DROP POLICY IF EXISTS "Admin acesso total a template_guide" ON public.template_guide;
CREATE POLICY "Admin acesso total a template_guide"
  ON public.template_guide FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- Recarrega schema cache
NOTIFY pgrst, 'reload schema';
