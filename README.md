# Attica Viagens - Plataforma de Concierge

> Plataforma premium de concierge de viagens para consultores e clientes.

---

## Pré-requisitos

- **Node.js** 18+
- **npm** ou **yarn**
- Conta no [Supabase](https://supabase.com) (gratuita)
- Conta na [Vercel](https://vercel.com) (para deploy)

---

## 1. Clonagem e Instalação

```bash
git clone <seu-repositorio>
cd attica-viagens
npm install
```

---

## 2. Configuração do Supabase

### 2.1 Criar Projeto

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Clique em **New Project**
3. Escolha um nome (ex: `attica-viagens`) e senha
4. Anote a **URL** e as **chaves** do projeto

### 2.2 Rodar Migrations

1. No painel Supabase, acesse **SQL Editor**
2. Cole o conteúdo de `supabase/migrations/001_initial_schema.sql`
3. Clique em **Run**

### 2.3 Configurar Autenticação

No painel Supabase → **Authentication** → **Settings**:
- **Site URL**: `https://seu-dominio.vercel.app`
- **Redirect URLs**: adicione `https://seu-dominio.vercel.app/update-password`
- **Email confirmação**: desabilitada (para desenvolvimento)

### 2.4 Criar Bucket de Arquivos

No painel Supabase → **Storage** → **New Bucket**:
- Nome: `trip-files`
- Público: **Não**

Execute no SQL Editor:
```sql
CREATE POLICY "Acesso autenticado" ON storage.objects FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Upload autenticado" ON storage.objects FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Delete autenticado" ON storage.objects FOR DELETE USING (auth.uid() IS NOT NULL);
```

---

## 3. Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Você encontra esses valores em: **Supabase Dashboard** → **Settings** → **API**

---

## 4. Templates de E-mail

No painel Supabase → **Authentication** → **Email Templates**, configure:

### Confirmação de Conta
```html
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Georgia, serif; background: #FAF6F3; padding: 40px;">
  <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; border: 1px solid #E5DDD5;">
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="width: 50px; height: 50px; background: #C4A97D; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
        <span style="color: white; font-family: serif; font-weight: bold; font-size: 18px;">AC</span>
      </div>
      <h1 style="font-family: 'Cinzel', serif; color: #2D2D2D; margin: 12px 0 4px; font-size: 24px; letter-spacing: 4px;">ATTICA</h1>
      <p style="color: #8B7355; font-style: italic; margin: 0; font-size: 12px;">Studio de Viagens</p>
    </div>
    <h2 style="color: #2D2D2D; font-size: 22px; margin-bottom: 16px;">Confirme seu e-mail</h2>
    <p style="color: #4A4A4A; line-height: 1.6; margin-bottom: 24px;">
      Obrigado por se cadastrar na Attica Studio de Viagens. Clique no botão abaixo para confirmar seu endereço de e-mail.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="{{ .ConfirmationURL }}" style="background: #C4A97D; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-family: sans-serif; font-weight: 600; font-size: 14px;">
        Confirmar E-mail
      </a>
    </div>
    <p style="color: #9C9C9C; font-size: 12px; text-align: center;">
      Se não solicitou este e-mail, pode ignorá-lo com segurança.
    </p>
  </div>
</body>
</html>
```

### Reset de Senha
```html
<!DOCTYPE html>
<html>
<body style="font-family: Georgia, serif; background: #FAF6F3; padding: 40px;">
  <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; border: 1px solid #E5DDD5;">
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="width: 50px; height: 50px; background: #C4A97D; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
        <span style="color: white; font-family: serif; font-weight: bold; font-size: 18px;">AC</span>
      </div>
      <h1 style="color: #2D2D2D; margin: 12px 0 4px; font-size: 24px; letter-spacing: 4px;">ATTICA</h1>
    </div>
    <h2 style="color: #2D2D2D;">Recuperação de Senha</h2>
    <p style="color: #4A4A4A; line-height: 1.6;">
      Recebemos uma solicitação para redefinir a senha da sua conta Attica Viagens.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="{{ .ConfirmationURL }}" style="background: #C4A97D; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-family: sans-serif; font-weight: 600; font-size: 14px;">
        Redefinir Senha
      </a>
    </div>
    <p style="color: #9C9C9C; font-size: 12px; text-align: center;">
      Este link expira em 1 hora. Se não solicitou, ignore este e-mail.
    </p>
  </div>
</body>
</html>
```

---

## 5. Criar Usuário Administrador

### Passo 1: Criar o usuário
No painel Supabase → **Authentication** → **Users** → **Add User**:
- E-mail: `admin@atticaviagens.com`
- Senha: (senha segura)
- Confirmar e-mail: ✓

### Passo 2: Definir papel de admin
Execute no SQL Editor:
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'admin@atticaviagens.com';
```

---

## 6. Executar Localmente

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 7. Deploy na Vercel

1. Faça push do projeto para o GitHub
2. Acesse [vercel.com](https://vercel.com) → **New Project**
3. Importe o repositório
4. Configure as variáveis de ambiente (as mesmas do `.env.local`)
5. Clique em **Deploy**

---

## 8. Como Usar

### Fluxo do Admin

1. **Login** em `/login` com as credenciais de admin
2. **Criar Cliente**: `/admin/clientes` → botão "Novo Cliente"
3. **Criar Viagem**: `/admin/viagens/nova` → selecione cliente e destino
4. **Preencher Seções**: `/admin/viagens/[id]` → use as abas para preencher:
   - **Geral**: informações básicas da viagem
   - **Itinerário**: programa dia a dia
   - **Financeiro**: custos e pagamentos
   - **Documentos**: lista de documentos necessários
   - **Mala**: lista de itens para empacotar
   - **Checklist**: tarefas pré-viagem
   - **Central Estratégica**: informações práticas com links
   - **Guia em Vídeo**: vídeos YouTube/Vimeo preparatórios
   - **Galeria**: fotos do destino
   - **Restaurantes**: indicações gastronômicas
   - **Fotografia**: dicas de locais e horários
   - **Cultura**: costumes e etiqueta local
   - **Vocabulário**: palavras essenciais no idioma local
   - **Contrato**: PDF e formulário de assinatura

### Fluxo do Cliente

1. **Recebe** e-mail de boas-vindas com credenciais
2. **Login** em `/login`
3. **Dashboard**: visão geral da viagem com mapa e informações
4. **Navega** pelo menu lateral para acessar cada seção
5. **Marca** itens da mala e checklist como concluídos
6. **Envia** documentos necessários

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/          # Páginas de login/reset senha
│   ├── (client)/        # Portal do cliente
│   │   └── dashboard/   # 14 páginas do cliente
│   ├── (admin)/         # Portal administrativo
│   │   └── admin/       # Gestão de clientes e viagens
│   └── api/             # API Routes
├── components/
│   ├── ui/              # Componentes base (Button, Card, etc.)
│   └── layout/          # Layouts (Sidebar, ClientLayout, AdminLayout)
├── lib/
│   ├── supabase/        # Clientes Supabase
│   ├── database.types.ts
│   └── destinations-data.ts  # 50+ destinos
└── middleware.ts         # Proteção de rotas
supabase/
└── migrations/
    └── 001_initial_schema.sql
```

---

## Cores da Marca

| Nome | Hex | Uso |
|------|-----|-----|
| Primary BG | `#FAF6F3` | Fundo principal |
| Secondary BG | `#F5EDE8` | Fundo secundário |
| Accent Gold | `#C4A97D` | Cor principal de destaque |
| Accent Dark | `#8B7355` | Marrom escuro |
| Text Main | `#4A4A4A` | Texto principal |
| Text Title | `#2D2D2D` | Títulos |
| Border | `#E5DDD5` | Bordas sutis |

---

## Suporte

Para dúvidas ou problemas, entre em contato com a equipe Attica Studio de Viagens.

---

*© 2024 Attica Studio de Viagens. Todos os direitos reservados.*
