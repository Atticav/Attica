-- =============================================
-- MIGRATION 018: Documents storage bucket policies
-- =============================================
-- Nota: O bucket 'documents' precisa ser criado manualmente no Supabase Dashboard
-- (Storage → New bucket → nome: documents → marcar como Public).
-- Este script adiciona as políticas de acesso ao storage para clientes.

-- Política: cliente pode fazer upload de arquivos para a pasta da sua viagem
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Cliente upload documents de suas trips'
  ) THEN
    EXECUTE $policy$
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
        )
    $policy$;
  END IF;
END;
$$;

-- Política: cliente pode ler arquivos da pasta da sua viagem
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Cliente lê documents de suas trips'
  ) THEN
    EXECUTE $policy$
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
        )
    $policy$;
  END IF;
END;
$$;

-- Política: admin tem acesso total ao bucket documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admin acesso total a documents storage'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Admin acesso total a documents storage"
        ON storage.objects FOR ALL
        USING (bucket_id = 'documents' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
        WITH CHECK (bucket_id = 'documents' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
    $policy$;
  END IF;
END;
$$;
