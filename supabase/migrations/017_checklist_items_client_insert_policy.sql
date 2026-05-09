-- =============================================
-- MIGRATION 017: Permitir cliente inserir checklist_items da própria viagem
-- =============================================

DROP POLICY IF EXISTS "Cliente insere checklist_items em suas trips" ON public.checklist_items;
CREATE POLICY "Cliente insere checklist_items em suas trips"
  ON public.checklist_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.trips
    WHERE id = trip_id
      AND client_id = auth.uid()
  ));

NOTIFY pgrst, 'reload schema';
