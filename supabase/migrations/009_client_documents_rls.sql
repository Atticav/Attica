-- Permite cliente inserir documentos em suas próprias viagens
CREATE POLICY "Cliente insere documents em suas trips"
  ON public.documents FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- Permite cliente atualizar documentos (para salvar file_url)
CREATE POLICY "Cliente atualiza documents de suas trips"
  ON public.documents FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- Storage policy para bucket documents
-- (executar separadamente no SQL Editor do Supabase se necessário)
