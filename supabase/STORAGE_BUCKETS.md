# Supabase Storage Buckets

Os buckets abaixo precisam ser criados manualmente no **Supabase Dashboard → Storage → New bucket → marcar como Public**.

> **Nota:** O Supabase não cria buckets automaticamente a partir de migrations SQL.  
> Sempre que um novo ambiente for configurado (produção, staging, etc.), crie todos os buckets listados aqui.

---

## Buckets necessários

| Bucket | Usado para | Público? |
|---|---|---|
| `gallery` | Fotos e vídeos da galeria de viagens | Sim |
| `trip-covers` | Imagem de capa das viagens | Sim |
| `strategic-images` | Imagens exibidas na Central Estratégica | Sim |
| `guide-videos` | Vídeos do Guia Attica (tutoriais, guias) | Sim |
| `restaurants-photos` | Fotos de restaurantes recomendados | Sim |
| `photography-images` | Fotos e vídeos de dicas de fotografia | Sim |

---

## Como criar cada bucket

1. Acesse o **Supabase Dashboard** do seu projeto
2. No menu lateral, clique em **Storage**
3. Clique em **New bucket**
4. Informe o nome exato do bucket (ex: `gallery`)
5. Marque a opção **Public bucket** ✅
6. Clique em **Create bucket**
7. Repita para todos os buckets da tabela acima

---

## Referências no código

| Bucket | Arquivos que fazem upload |
|---|---|
| `gallery` | `src/app/admin/templates/page.tsx`, `src/app/dashboard/[tripId]/gallery/` |
| `trip-covers` | `src/app/admin/trips/` |
| `strategic-images` | `src/app/admin/trips/[tripId]/[section]/page.tsx` |
| `guide-videos` | `src/app/admin/trips/[tripId]/[section]/page.tsx`, `src/app/admin/templates/page.tsx` |
| `restaurants-photos` | `src/app/admin/trips/[tripId]/[section]/page.tsx` |
| `photography-images` | `src/app/admin/trips/[tripId]/[section]/page.tsx`, `src/app/admin/templates/page.tsx` |
