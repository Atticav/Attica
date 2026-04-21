-- Permite cliente inserir financial_items em suas próprias viagens
CREATE POLICY "Cliente insere financial_items em suas trips"
  ON public.financial_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));

-- Permite cliente atualizar financial_items de suas trips
CREATE POLICY "Cliente atualiza financial_items de suas trips"
  ON public.financial_items FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND client_id = auth.uid()));
