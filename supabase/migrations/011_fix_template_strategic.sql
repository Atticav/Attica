-- Fix: garantir que as colunas existam na tabela template_strategic
ALTER TABLE public.template_strategic ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.template_strategic ADD COLUMN IF NOT EXISTS url TEXT;
