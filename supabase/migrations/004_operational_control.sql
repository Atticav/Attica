-- =============================================
-- ATTICA VIAGENS – Controle Operacional Admin
-- Migração: 004_operational_control.sql
-- =============================================

-- =============================================
-- TABELA: company_transactions (Finanças da empresa)
-- =============================================
CREATE TABLE IF NOT EXISTS public.company_transactions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type        TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category    TEXT NOT NULL DEFAULT 'other'
              CHECK (category IN ('service_fee', 'commission', 'salary', 'rent', 'marketing', 'tools', 'travel', 'tax', 'other')),
  description TEXT NOT NULL,
  amount      NUMERIC(12,2) NOT NULL,
  currency    TEXT NOT NULL DEFAULT 'BRL',
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  client_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  trip_id     UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  status      TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.company_transactions ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER company_transactions_updated_at
  BEFORE UPDATE ON public.company_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE POLICY "Admin acesso total a company_transactions"
  ON public.company_transactions FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- =============================================
-- TABELA: client_payments (Pagamentos de clientes)
-- =============================================
CREATE TABLE IF NOT EXISTS public.client_payments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trip_id       UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  description   TEXT NOT NULL,
  amount        NUMERIC(12,2) NOT NULL,
  due_date      DATE,
  paid_date     DATE,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  payment_method TEXT CHECK (payment_method IN ('pix', 'credit_card', 'bank_transfer', 'cash', 'other')),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.client_payments ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER client_payments_updated_at
  BEFORE UPDATE ON public.client_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE POLICY "Admin acesso total a client_payments"
  ON public.client_payments FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());

-- =============================================
-- TABELA: planner_tasks (Planner de roteiros)
-- =============================================
CREATE TABLE IF NOT EXISTS public.planner_tasks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT,
  trip_id     UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  client_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date    DATE,
  priority    TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status      TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'cancelled')),
  category    TEXT NOT NULL DEFAULT 'itinerary' CHECK (category IN ('itinerary', 'documents', 'payment', 'client_contact', 'booking', 'other')),
  notes       TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.planner_tasks ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER planner_tasks_updated_at
  BEFORE UPDATE ON public.planner_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE POLICY "Admin acesso total a planner_tasks"
  ON public.planner_tasks FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());
