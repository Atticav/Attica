# Attica Viagens – Studio de Viagens

Plataforma exclusiva de concierge de viagens da Attica Viagens. Um caderno de viagem digital e personalizado para cada cliente.

---

## Stack Técnico

| Tecnologia | Uso |
|-----------|-----|
| **Next.js 14** | Framework React com App Router |
| **TypeScript** | Tipagem estática |
| **Tailwind CSS** | Estilização com design system Attica |
| **Supabase** | Banco de dados PostgreSQL + Auth + Storage |
| **Lucide React** | Ícones |

---

## Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no [Supabase](https://supabase.com)

---

## Instalação

```bash
# Clonar o repositório
git clone https://github.com/Atticav/Attica.git
cd Attica

# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env.local
```

---

## Variáveis de Ambiente

Edite o arquivo `.env.local` com os dados do seu projeto Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

---

## Configurar o Supabase

### 1. Criar projeto

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Clique em **New Project**
3. Defina nome, senha do banco e região (recomendado: South America – São Paulo)
4. Aguarde o projeto ser criado (~2 min)

### 2. Obter credenciais

1. Vá em **Project Settings → API**
2. Copie `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
3. Copie `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Executar migração

1. Vá em **SQL Editor** no Supabase
2. Clique em **New query**
3. Cole o conteúdo de `supabase/migrations/001_initial_schema.sql`
4. Clique em **Run**

### 4. Configurar Auth

1. Vá em **Authentication → URL Configuration**
2. Configure:
   - **Site URL:** `https://seu-dominio.vercel.app` (ou `http://localhost:3000` para dev)
   - **Redirect URLs:** adicione `https://seu-dominio.vercel.app/auth/callback`

### 5. Configurar Storage (para fotos e documentos)

1. Vá em **Storage** → **New bucket**
2. Crie os buckets:
   - `avatars` (public)
   - `documents` (private)
   - `gallery` (private)

---

## Templates de Email (PT-BR com branding Attica)

### Template: Confirmação de Email

No Supabase, vá em **Authentication → Email Templates → Confirm signup** e use:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Georgia', serif; background: #FAF6F3; margin: 0; padding: 40px 20px; }
    .card { max-width: 500px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 48px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .logo { text-align: center; margin-bottom: 32px; }
    .logo-title { font-family: 'Georgia', serif; font-size: 18px; letter-spacing: 6px; color: #2D2D2D; }
    .logo-sub { font-size: 11px; color: #9C9C9C; letter-spacing: 3px; margin-top: 4px; }
    h1 { font-size: 28px; color: #2D2D2D; text-align: center; margin-bottom: 16px; }
    p { color: #4A4A4A; font-size: 15px; line-height: 1.7; text-align: center; }
    .btn { display: block; width: fit-content; margin: 28px auto; padding: 14px 36px; background: #C4A97D; color: #fff; text-decoration: none; border-radius: 8px; font-size: 14px; font-family: sans-serif; font-weight: 600; }
    .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #9C9C9C; border-top: 1px solid #E5DDD5; padding-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <div class="logo-title">ATTICA</div>
      <div class="logo-sub">STUDIO DE VIAGENS</div>
    </div>
    <h1>Confirme seu acesso</h1>
    <p>Olá! Estamos felizes em tê-la conosco. Clique no botão abaixo para confirmar seu e-mail e acessar seu Caderno de Viagem.</p>
    <a href="{{ .ConfirmationURL }}" class="btn">Confirmar e-mail</a>
    <div class="footer">Attica Studio de Viagens · contato@atticaviagens.com.br</div>
  </div>
</body>
</html>
```

### Template: Reset de Senha

Em **Authentication → Email Templates → Reset password**:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Georgia', serif; background: #FAF6F3; margin: 0; padding: 40px 20px; }
    .card { max-width: 500px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 48px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .logo { text-align: center; margin-bottom: 32px; }
    .logo-title { font-family: 'Georgia', serif; font-size: 18px; letter-spacing: 6px; color: #2D2D2D; }
    .logo-sub { font-size: 11px; color: #9C9C9C; letter-spacing: 3px; margin-top: 4px; }
    h1 { font-size: 28px; color: #2D2D2D; text-align: center; margin-bottom: 16px; }
    p { color: #4A4A4A; font-size: 15px; line-height: 1.7; text-align: center; }
    .btn { display: block; width: fit-content; margin: 28px auto; padding: 14px 36px; background: #C4A97D; color: #fff; text-decoration: none; border-radius: 8px; font-size: 14px; font-family: sans-serif; font-weight: 600; }
    .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #9C9C9C; border-top: 1px solid #E5DDD5; padding-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <div class="logo-title">ATTICA</div>
      <div class="logo-sub">STUDIO DE VIAGENS</div>
    </div>
    <h1>Redefinir senha</h1>
    <p>Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha.</p>
    <a href="{{ .ConfirmationURL }}" class="btn">Redefinir minha senha</a>
    <p style="font-size: 13px; color: #9C9C9C;">Se você não solicitou isso, ignore este e-mail. Sua senha permanece a mesma.</p>
    <div class="footer">Attica Studio de Viagens · contato@atticaviagens.com.br</div>
  </div>
</body>
</html>
```

---

## Criar Primeiro Usuário Admin

1. No Supabase, vá em **Authentication → Users**
2. Clique em **Invite user** e envie o convite para o e-mail do admin
3. Após o usuário confirmar o e-mail, vá em **SQL Editor** e execute:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'email-do-admin@exemplo.com';
```

---

## Rodar Localmente

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

---

## Deploy na Vercel

1. Faça push do código para o GitHub
2. Acesse [vercel.com](https://vercel.com) e importe o repositório
3. Em **Environment Variables**, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Clique em **Deploy**
5. Após o deploy, atualize o **Site URL** e **Redirect URLs** no Supabase com a URL da Vercel

---

## Estrutura de Pastas

```
attica/
├── src/
│   ├── app/                    # App Router (Next.js 14)
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Redirect home
│   │   ├── globals.css         # Estilos globais + fontes
│   │   ├── login/              # Página de login
│   │   ├── reset-password/     # Reset de senha
│   │   ├── update-password/    # Atualizar senha
│   │   ├── auth/callback/      # Handler OAuth
│   │   ├── dashboard/          # Área do cliente
│   │   └── admin/              # Painel admin
│   ├── components/
│   │   ├── layout/             # Logo, Sidebars
│   │   └── ui/                 # Button, Input, Modal, Card, Badge, Toast
│   └── lib/
│       ├── supabase/           # Client e server Supabase
│       ├── types.ts            # Tipos TypeScript
│       ├── utils.ts            # Funções utilitárias
│       └── destinations-data.ts # 50+ destinos com dados
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Schema completo
├── tailwind.config.ts          # Cores da marca Attica
├── next.config.js
├── tsconfig.json
└── .env.example
```

---

## Design System

| Elemento | Valor |
|---------|-------|
| **Fundo** | `#FAF6F3` |
| **Fundo secundário** | `#F5EDE8` |
| **Dourado** | `#C4A97D` |
| **Marrom** | `#6B5B45` |
| **Texto** | `#4A4A4A` |
| **Título** | `#2D2D2D` |
| **Fonte títulos** | Cormorant Garamond |
| **Fonte corpo** | Lora |
| **Fonte UI** | Inter |

---

Desenvolvido com ✨ para a Attica Studio de Viagens