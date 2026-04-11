'use client'

import { useState, useEffect, useCallback } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Tabs from '@/components/ui/Tabs'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import { ToastContainer } from '@/components/ui/Toast'
import {
  Plus, Trash2, Edit2, Check, ArrowRight, ArrowUp, ArrowDown,
  TrendingUp, TrendingDown, BarChart2, CalendarCheck,
  CreditCard, Clock, AlertCircle, ClipboardList,
  Wallet, RefreshCw, CheckCircle, XCircle, Calendar,
  AlertTriangle, CircleDot, Layers,
} from 'lucide-react'
import type {
  CompanyTransaction, TransactionType, TransactionCategory, TransactionStatus,
  ClientPayment, PaymentStatus, PaymentMethod,
  PlannerTask, TaskPriority, TaskStatus, TaskCategory,
} from '@/lib/types'
import { formatCurrency, formatDateShort, getInitials } from '@/lib/utils'

// ===== LABEL HELPERS =====

const categoryLabels: Record<TransactionCategory, string> = {
  service_fee: 'Taxa de serviço', commission: 'Comissão', salary: 'Salário',
  rent: 'Aluguel', marketing: 'Marketing', tools: 'Ferramentas',
  travel: 'Viagem', tax: 'Impostos', other: 'Outros',
}

const paymentMethodLabels: Record<PaymentMethod, string> = {
  pix: 'PIX', credit_card: 'Cartão de Crédito', bank_transfer: 'Transferência',
  cash: 'Dinheiro', other: 'Outro',
}

const priorityLabels: Record<TaskPriority, string> = {
  low: 'Baixa', medium: 'Média', high: 'Alta', urgent: 'Urgente',
}

const taskStatusLabels: Record<TaskStatus, string> = {
  todo: 'A Fazer', in_progress: 'Em Andamento', done: 'Concluído', cancelled: 'Cancelado',
}

const taskCategoryLabels: Record<TaskCategory, string> = {
  itinerary: 'Roteiro', documents: 'Documentos', payment: 'Pagamento',
  client_contact: 'Contato', booking: 'Reserva', other: 'Outro',
}

const paymentStatusBadge: Record<PaymentStatus, { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string }> = {
  paid: { variant: 'success', label: 'Pago' },
  pending: { variant: 'warning', label: 'Pendente' },
  overdue: { variant: 'error', label: 'Em Atraso' },
  cancelled: { variant: 'neutral', label: 'Cancelado' },
}

interface SimpleProfile { id: string; full_name: string | null; email: string }
interface SimpleTrip { id: string; title: string; client_id?: string }

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState('finance')
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([])

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
  }

  const tabs = [
    { id: 'finance', label: 'Finanças', icon: Wallet },
    { id: 'payments', label: 'Pagamentos', icon: CreditCard },
    { id: 'planner', label: 'Planner', icon: ClipboardList },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-cormorant text-4xl font-semibold text-brand-title">Controle Operacional</h1>
        <p className="font-outfit text-brand-muted mt-1">Finanças, pagamentos e planejamento</p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} className="mb-6" />

      {activeTab === 'finance' && <FinanceTab addToast={addToast} />}
      {activeTab === 'payments' && <PaymentsTab addToast={addToast} />}
      {activeTab === 'planner' && <PlannerTab addToast={addToast} />}

      <ToastContainer toasts={toasts} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  )
}

// =============================================
// FINANCE TAB
// =============================================

function FinanceTab({ addToast }: { addToast: (msg: string, type: 'success' | 'error' | 'info') => void }) {
  const [transactions, setTransactions] = useState<CompanyTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [clients, setClients] = useState<SimpleProfile[]>([])
  const [trips, setTrips] = useState<SimpleTrip[]>([])
  const [form, setForm] = useState({
    type: 'income' as TransactionType,
    category: 'other' as TransactionCategory,
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    client_id: '',
    trip_id: '',
    status: 'confirmed' as TransactionStatus,
    notes: '',
  })

  const loadTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterType !== 'all') params.set('type', filterType)
      if (filterCategory !== 'all') params.set('category', filterCategory)
      const res = await fetch(`/api/admin/operations/finance?${params}`)
      if (res.ok) setTransactions(await res.json())
    } catch { /* ignore */ } finally { setLoading(false) }
  }, [filterType, filterCategory])

  const loadClients = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/clients')
      if (res.ok) {
        const data = await res.json()
        setClients(Array.isArray(data) ? data : [])
      }
    } catch { /* ignore */ }
  }, [])

  const loadTrips = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/trips')
      if (res.ok) {
        const data = await res.json()
        setTrips(Array.isArray(data) ? data : [])
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { loadTransactions() }, [loadTransactions])
  useEffect(() => { loadClients(); loadTrips() }, [loadClients, loadTrips])

  const resetForm = () => setForm({
    type: 'income', category: 'other', description: '', amount: '',
    date: new Date().toISOString().split('T')[0], client_id: '', trip_id: '',
    status: 'confirmed', notes: '',
  })

  async function handleSave() {
    if (!form.description || !form.amount) {
      addToast('Preencha descrição e valor', 'error')
      return
    }
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        client_id: form.client_id || null,
        trip_id: form.trip_id || null,
        notes: form.notes || null,
      }
      const url = editingId ? `/api/admin/operations/finance/${editingId}` : '/api/admin/operations/finance'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Erro ao salvar')
      addToast(editingId ? 'Transação atualizada!' : 'Transação criada!', 'success')
      setModalOpen(false)
      resetForm()
      setEditingId(null)
      loadTransactions()
    } catch { addToast('Erro ao salvar transação', 'error') }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/admin/operations/finance/${id}`, { method: 'DELETE' })
      addToast('Transação excluída', 'success')
      loadTransactions()
    } catch { addToast('Erro ao excluir', 'error') }
  }

  function openEdit(t: CompanyTransaction) {
    setForm({
      type: t.type, category: t.category, description: t.description,
      amount: String(t.amount), date: t.date, client_id: t.client_id || '',
      trip_id: t.trip_id || '', status: t.status, notes: t.notes || '',
    })
    setEditingId(t.id)
    setModalOpen(true)
  }

  // Summary
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const monthTransactions = transactions.filter(t => {
    const d = new Date(t.date + 'T00:00:00')
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.status === 'confirmed'
  })
  const monthIncome = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const monthExpense = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const yearIncome = transactions.filter(t => {
    const d = new Date(t.date + 'T00:00:00')
    return d.getFullYear() === currentYear && t.type === 'income' && t.status === 'confirmed'
  }).reduce((s, t) => s + Number(t.amount), 0)

  return (
    <div>
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard icon={TrendingUp} label="Receita do mês" value={formatCurrency(monthIncome)} color="text-brand-success" />
        <SummaryCard icon={TrendingDown} label="Despesas do mês" value={formatCurrency(monthExpense)} color="text-brand-error" />
        <SummaryCard icon={BarChart2} label="Saldo líquido" value={formatCurrency(monthIncome - monthExpense)} color={monthIncome - monthExpense >= 0 ? 'text-brand-success' : 'text-brand-error'} />
        <SummaryCard icon={CalendarCheck} label="Receita do ano" value={formatCurrency(yearIncome)} color="text-brand-gold" />
      </div>

      {/* Filters + Add */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="rounded-lg border border-brand-border font-outfit text-sm px-3 py-2 bg-white">
          <option value="all">Todos os tipos</option>
          <option value="income">Receita</option>
          <option value="expense">Despesa</option>
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="rounded-lg border border-brand-border font-outfit text-sm px-3 py-2 bg-white">
          <option value="all">Todas categorias</option>
          {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button onClick={() => { resetForm(); setEditingId(null); setModalOpen(true) }} className="ml-auto flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-lg font-inter text-sm font-medium hover:bg-brand-gold-dark transition-colors">
          <Plus size={16} /> Nova Transação
        </button>
      </div>

      {/* Table */}
      <Card padding="none" className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-brand-border bg-brand-bg">
              <th className="px-4 py-3 font-inter text-xs font-medium text-brand-muted uppercase">Data</th>
              <th className="px-4 py-3 font-inter text-xs font-medium text-brand-muted uppercase">Descrição</th>
              <th className="px-4 py-3 font-inter text-xs font-medium text-brand-muted uppercase">Categoria</th>
              <th className="px-4 py-3 font-inter text-xs font-medium text-brand-muted uppercase">Tipo</th>
              <th className="px-4 py-3 font-inter text-xs font-medium text-brand-muted uppercase text-right">Valor</th>
              <th className="px-4 py-3 font-inter text-xs font-medium text-brand-muted uppercase">Status</th>
              <th className="px-4 py-3 font-inter text-xs font-medium text-brand-muted uppercase">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center font-outfit text-brand-muted">Carregando...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center font-outfit text-brand-muted">Nenhuma transação encontrada</td></tr>
            ) : transactions.map(t => (
              <tr key={t.id} className="border-b border-brand-border hover:bg-brand-bg/50 transition-colors">
                <td className="px-4 py-3 font-inter text-sm text-brand-text">{formatDateShort(t.date)}</td>
                <td className="px-4 py-3 font-inter text-sm text-brand-title font-medium">{t.description}</td>
                <td className="px-4 py-3"><Badge variant="neutral">{categoryLabels[t.category]}</Badge></td>
                <td className="px-4 py-3">
                  <Badge variant={t.type === 'income' ? 'success' : 'error'}>
                    {t.type === 'income' ? <><ArrowUp size={12} className="mr-1" /> Receita</> : <><ArrowDown size={12} className="mr-1" /> Despesa</>}
                  </Badge>
                </td>
                <td className="px-4 py-3 font-inter text-sm font-semibold text-right">{formatCurrency(Number(t.amount))}</td>
                <td className="px-4 py-3">
                  <Badge variant={t.status === 'confirmed' ? 'success' : t.status === 'pending' ? 'warning' : 'neutral'}>
                    {t.status === 'confirmed' ? 'Confirmado' : t.status === 'pending' ? 'Pendente' : 'Cancelado'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(t)} className="p-1.5 rounded hover:bg-brand-hover text-brand-muted hover:text-brand-gold transition-colors"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded hover:bg-red-50 text-brand-muted hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); resetForm(); setEditingId(null) }} title={editingId ? 'Editar Transação' : 'Nova Transação'} size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-sm font-medium text-brand-text">Tipo</label>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as TransactionType }))} className="rounded-lg border border-brand-border font-outfit text-sm px-4 py-3 bg-brand-bg">
              <option value="income">Receita</option>
              <option value="expense">Despesa</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-sm font-medium text-brand-text">Categoria</label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as TransactionCategory }))} className="rounded-lg border border-brand-border font-outfit text-sm px-4 py-3 bg-brand-bg">
              {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <Input label="Descrição" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Descrição da transação" required className="md:col-span-2" />
          <Input label="Valor (R$)" type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" required />
          <Input label="Data" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-sm font-medium text-brand-text">Cliente (opcional)</label>
            <select value={form.client_id} onChange={e => setForm(p => ({ ...p, client_id: e.target.value }))} className="rounded-lg border border-brand-border font-outfit text-sm px-4 py-3 bg-brand-bg">
              <option value="">Nenhum</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.full_name || c.email}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-sm font-medium text-brand-text">Viagem (opcional)</label>
            <select value={form.trip_id} onChange={e => setForm(p => ({ ...p, trip_id: e.target.value }))} className="rounded-lg border border-brand-border font-outfit text-sm px-4 py-3 bg-brand-bg">
              <option value="">Nenhuma</option>
              {trips.filter(t => !form.client_id || t.client_id === form.client_id).map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-sm font-medium text-brand-text">Status</label>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as TransactionStatus }))} className="rounded-lg border border-brand-border font-outfit text-sm px-4 py-3 bg-brand-bg">
              <option value="confirmed">Confirmado</option>
              <option value="pending">Pendente</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="font-inter text-sm font-medium text-brand-text">Notas</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Notas..." rows={2} className="rounded-lg border border-brand-border font-outfit text-sm px-4 py-3 bg-brand-bg resize-none" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => { setModalOpen(false); resetForm(); setEditingId(null) }} className="flex-1 px-4 py-2.5 border border-brand-border text-brand-text rounded-lg font-inter text-sm hover:bg-brand-bg transition-colors">Cancelar</button>
          <button onClick={handleSave} className="flex-1 px-4 py-2.5 bg-brand-gold text-white rounded-lg font-inter text-sm font-medium hover:bg-brand-gold-dark transition-colors">Salvar</button>
        </div>
      </Modal>
    </div>
  )
}

// =============================================
// PAYMENTS TAB
// =============================================

function PaymentsTab({ addToast }: { addToast: (msg: string, type: 'success' | 'error' | 'info') => void }) {
  const [payments, setPayments] = useState<ClientPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [clients, setClients] = useState<SimpleProfile[]>([])
  const [trips, setTrips] = useState<SimpleTrip[]>([])
  const [form, setForm] = useState({
    client_id: '', trip_id: '', description: '', amount: '',
    due_date: '', payment_method: '' as PaymentMethod | '', notes: '',
  })

  const loadPayments = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.set('status', filterStatus)
      const res = await fetch(`/api/admin/operations/payments?${params}`)
      if (res.ok) setPayments(await res.json())
    } catch { /* ignore */ } finally { setLoading(false) }
  }, [filterStatus])

  const loadClients = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/clients')
      if (res.ok) {
        const data = await res.json()
        setClients(Array.isArray(data) ? data : [])
      }
    } catch { /* ignore */ }
  }, [])

  const loadTrips = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/trips')
      if (res.ok) {
        const data = await res.json()
        setTrips(Array.isArray(data) ? data : [])
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { loadPayments() }, [loadPayments])
  useEffect(() => { loadClients(); loadTrips() }, [loadClients, loadTrips])

  const resetForm = () => setForm({ client_id: '', trip_id: '', description: '', amount: '', due_date: '', payment_method: '', notes: '' })

  async function handleSave() {
    if (!form.client_id || !form.description || !form.amount) {
      addToast('Preencha cliente, descrição e valor', 'error')
      return
    }
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        trip_id: form.trip_id || null,
        due_date: form.due_date || null,
        payment_method: form.payment_method || null,
        notes: form.notes || null,
      }
      const url = editingId ? `/api/admin/operations/payments/${editingId}` : '/api/admin/operations/payments'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Erro ao salvar')
      addToast(editingId ? 'Cobrança atualizada!' : 'Cobrança criada!', 'success')
      setModalOpen(false)
      resetForm()
      setEditingId(null)
      loadPayments()
    } catch { addToast('Erro ao salvar cobrança', 'error') }
  }

  async function markAsPaid(id: string) {
    try {
      await fetch(`/api/admin/operations/payments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid', paid_date: new Date().toISOString().split('T')[0] }),
      })
      addToast('Marcado como pago!', 'success')
      loadPayments()
    } catch { addToast('Erro ao atualizar', 'error') }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/admin/operations/payments/${id}`, { method: 'DELETE' })
      addToast('Cobrança excluída', 'success')
      loadPayments()
    } catch { addToast('Erro ao excluir', 'error') }
  }

  function openEdit(p: ClientPayment) {
    setForm({
      client_id: p.client_id, trip_id: p.trip_id || '', description: p.description,
      amount: String(p.amount), due_date: p.due_date || '',
      payment_method: (p.payment_method || '') as PaymentMethod | '', notes: p.notes || '',
    })
    setEditingId(p.id)
    setModalOpen(true)
  }

  // Summary
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const paidThisMonth = payments.filter(p => p.status === 'paid' && p.paid_date).filter(p => {
    const d = new Date(p.paid_date! + 'T00:00:00')
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  }).reduce((s, p) => s + Number(p.amount), 0)
  const pendingTotal = payments.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0)
  const overdueTotal = payments.filter(p => p.status === 'overdue').reduce((s, p) => s + Number(p.amount), 0)

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard icon={CheckCircle} label="Recebido (mês)" value={formatCurrency(paidThisMonth)} color="text-brand-success" />
        <SummaryCard icon={Clock} label="A receber" value={formatCurrency(pendingTotal)} color="text-brand-warning" />
        <SummaryCard icon={AlertCircle} label="Em atraso" value={formatCurrency(overdueTotal)} color="text-brand-error" />
        <SummaryCard icon={Layers} label="Total cobranças" value={String(payments.length)} color="text-brand-gold" />
      </div>

      {/* Filters + Add */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="rounded-lg border border-brand-border font-outfit text-sm px-3 py-2 bg-white">
          <option value="all">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="paid">Pago</option>
          <option value="overdue">Em Atraso</option>
          <option value="cancelled">Cancelado</option>
        </select>
        <button onClick={() => { resetForm(); setEditingId(null); setModalOpen(true) }} className="ml-auto flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-lg font-inter text-sm font-medium hover:bg-brand-gold-dark transition-colors">
          <Plus size={16} /> Nova Cobrança
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <Card padding="md"><p className="text-center font-outfit text-brand-muted">Carregando...</p></Card>
        ) : payments.length === 0 ? (
          <Card padding="md"><p className="text-center font-outfit text-brand-muted">Nenhuma cobrança encontrada</p></Card>
        ) : payments.map(p => {
          const badge = paymentStatusBadge[p.status]
          return (
            <Card key={p.id} padding="md">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="w-10 h-10 rounded-full bg-brand-bg-secondary flex items-center justify-center flex-shrink-0">
                  <span className="font-inter text-xs font-bold text-brand-gold">
                    {getInitials(p.profile?.full_name)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-inter text-sm font-semibold text-brand-title truncate">
                    {p.profile?.full_name || p.profile?.email || '—'}
                    {p.trip && <span className="font-normal text-brand-muted"> · {p.trip.title}</span>}
                  </p>
                  <p className="font-outfit text-sm text-brand-text">{p.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-inter text-lg font-semibold text-brand-title">{formatCurrency(Number(p.amount))}</p>
                  {p.due_date && (
                    <p className="font-inter text-xs text-brand-muted flex items-center gap-1 justify-end">
                      <Calendar size={10} /> Vence: {formatDateShort(p.due_date)}
                    </p>
                  )}
                </div>
                <Badge variant={badge.variant}>{badge.label}</Badge>
                <div className="flex gap-1">
                  {p.status === 'pending' && (
                    <button onClick={() => markAsPaid(p.id)} className="p-1.5 rounded hover:bg-green-50 text-brand-muted hover:text-brand-success transition-colors" title="Marcar como pago">
                      <Check size={14} />
                    </button>
                  )}
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-brand-hover text-brand-muted hover:text-brand-gold transition-colors"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded hover:bg-red-50 text-brand-muted hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); resetForm(); setEditingId(null) }} title={editingId ? 'Editar Cobrança' : 'Nova Cobrança'} size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-sm font-medium text-brand-text">Cliente</label>
            <select value={form.client_id} onChange={e => setForm(p => ({ ...p, client_id: e.target.value }))} className="rounded-lg border border-brand-border font-outfit text-sm px-4 py-3 bg-brand-bg">
              <option value="">Selecionar...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.full_name || c.email}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-sm font-medium text-brand-text">Viagem (opcional)</label>
            <select value={form.trip_id} onChange={e => setForm(p => ({ ...p, trip_id: e.target.value }))} className="rounded-lg border border-brand-border font-outfit text-sm px-4 py-3 bg-brand-bg">
              <option value="">Nenhuma</option>
              {trips.filter(t => !form.client_id || t.client_id === form.client_id).map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
          <Input label="Descrição" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Descrição do pagamento" required className="md:col-span-2" />
          <Input label="Valor (R$)" type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" required />
          <Input label="Vencimento" type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} />
          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-sm font-medium text-brand-text">Método de pagamento</label>
            <select value={form.payment_method} onChange={e => setForm(p => ({ ...p, payment_method: e.target.value as PaymentMethod | '' }))} className="rounded-lg border border-brand-border font-outfit text-sm px-4 py-3 bg-brand-bg">
              <option value="">Não definido</option>
              {Object.entries(paymentMethodLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="font-inter text-sm font-medium text-brand-text">Notas</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Notas..." rows={2} className="rounded-lg border border-brand-border font-outfit text-sm px-4 py-3 bg-brand-bg resize-none" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => { setModalOpen(false); resetForm(); setEditingId(null) }} className="flex-1 px-4 py-2.5 border border-brand-border text-brand-text rounded-lg font-inter text-sm hover:bg-brand-bg transition-colors">Cancelar</button>
          <button onClick={handleSave} className="flex-1 px-4 py-2.5 bg-brand-gold text-white rounded-lg font-inter text-sm font-medium hover:bg-brand-gold-dark transition-colors">Salvar</button>
        </div>
      </Modal>
    </div>
  )
}

// =============================================
// PLANNER TAB
// =============================================

function PlannerTab({ addToast }: { addToast: (msg: string, type: 'success' | 'error' | 'info') => void }) {
  const [tasks, setTasks] = useState<PlannerTask[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [clients, setClients] = useState<SimpleProfile[]>([])
  const [trips, setTrips] = useState<SimpleTrip[]>([])
  const [form, setForm] = useState({
    title: '', description: '', trip_id: '', client_id: '',
    due_date: '', priority: 'medium' as TaskPriority,
    category: 'itinerary' as TaskCategory, notes: '',
  })

  const loadTasks = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterPriority !== 'all') params.set('priority', filterPriority)
      if (filterCategory !== 'all') params.set('category', filterCategory)
      const res = await fetch(`/api/admin/operations/planner?${params}`)
      if (res.ok) setTasks(await res.json())
    } catch { /* ignore */ } finally { setLoading(false) }
  }, [filterPriority, filterCategory])

  const loadClients = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/clients')
      if (res.ok) {
        const data = await res.json()
        setClients(Array.isArray(data) ? data : [])
      }
    } catch { /* ignore */ }
  }, [])

  const loadTrips = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/trips')
      if (res.ok) {
        const data = await res.json()
        setTrips(Array.isArray(data) ? data : [])
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { loadTasks() }, [loadTasks])
  useEffect(() => { loadClients(); loadTrips() }, [loadClients, loadTrips])

  const resetForm = () => setForm({ title: '', description: '', trip_id: '', client_id: '', due_date: '', priority: 'medium', category: 'itinerary', notes: '' })

  async function handleSave() {
    if (!form.title) {
      addToast('Preencha o título', 'error')
      return
    }
    try {
      const payload = {
        ...form,
        trip_id: form.trip_id || null,
        client_id: form.client_id || null,
        due_date: form.due_date || null,
        notes: form.notes || null,
        description: form.description || null,
      }
      const url = editingId ? `/api/admin/operations/planner/${editingId}` : '/api/admin/operations/planner'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Erro ao salvar')
      addToast(editingId ? 'Tarefa atualizada!' : 'Tarefa criada!', 'success')
      setModalOpen(false)
      resetForm()
      setEditingId(null)
      loadTasks()
    } catch { addToast('Erro ao salvar tarefa', 'error') }
  }

  async function updateStatus(id: string, newStatus: TaskStatus) {
    try {
      await fetch(`/api/admin/operations/planner/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      loadTasks()
    } catch { addToast('Erro ao atualizar status', 'error') }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/admin/operations/planner/${id}`, { method: 'DELETE' })
      addToast('Tarefa excluída', 'success')
      loadTasks()
    } catch { addToast('Erro ao excluir', 'error') }
  }

  function openEdit(t: PlannerTask) {
    setForm({
      title: t.title, description: t.description || '', trip_id: t.trip_id || '',
      client_id: t.client_id || '', due_date: t.due_date || '',
      priority: t.priority, category: t.category, notes: t.notes || '',
    })
    setEditingId(t.id)
    setModalOpen(true)
  }

  const columns: { status: TaskStatus; label: string; icon: React.ElementType }[] = [
    { status: 'todo', label: 'A Fazer', icon: CircleDot },
    { status: 'in_progress', label: 'Em Andamento', icon: RefreshCw },
    { status: 'done', label: 'Concluído', icon: CheckCircle },
    { status: 'cancelled', label: 'Cancelado', icon: XCircle },
  ]

  return (
    <div>
      {/* Filters + Add */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="rounded-lg border border-brand-border font-outfit text-sm px-3 py-2 bg-white">
          <option value="all">Todas prioridades</option>
          <option value="urgent">Urgente</option>
          <option value="high">Alta</option>
          <option value="medium">Média</option>
          <option value="low">Baixa</option>
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="rounded-lg border border-brand-border font-outfit text-sm px-3 py-2 bg-white">
          <option value="all">Todas categorias</option>
          {Object.entries(taskCategoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button onClick={() => { resetForm(); setEditingId(null); setModalOpen(true) }} className="ml-auto flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-lg font-inter text-sm font-medium hover:bg-brand-gold-dark transition-colors">
          <Plus size={16} /> Nova Tarefa
        </button>
      </div>

      {loading ? (
        <Card padding="md"><p className="text-center font-outfit text-brand-muted">Carregando...</p></Card>
      ) : (
        <>
          {/* Desktop: Kanban */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-4">
            {columns.map(col => {
              const colTasks = tasks.filter(t => t.status === col.status)
              const ColIcon = col.icon
              return (
                <div key={col.status} className="bg-brand-bg rounded-lg border border-brand-border p-3">
                  <h3 className="font-inter text-sm font-semibold text-brand-title mb-3 flex items-center gap-2">
                    <ColIcon size={14} strokeWidth={1.5} className="text-brand-gold" />
                    {col.label}
                    <span className="text-xs text-brand-muted bg-brand-hover rounded-full px-2 py-0.5">{colTasks.length}</span>
                  </h3>
                  <div className="space-y-2">
                    {colTasks.map(task => (
                      <TaskCard key={task.id} task={task} onEdit={openEdit} onDelete={handleDelete} onStatusChange={updateStatus} />
                    ))}
                    {colTasks.length === 0 && (
                      <p className="text-center font-outfit text-xs text-brand-muted py-4">Vazio</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Mobile: List */}
          <div className="lg:hidden space-y-3">
            {tasks.length === 0 ? (
              <Card padding="md"><p className="text-center font-outfit text-brand-muted">Nenhuma tarefa encontrada</p></Card>
            ) : tasks.map(task => (
              <TaskCard key={task.id} task={task} onEdit={openEdit} onDelete={handleDelete} onStatusChange={updateStatus} showStatus />
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); resetForm(); setEditingId(null) }} title={editingId ? 'Editar Tarefa' : 'Nova Tarefa'} size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Título" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Título da tarefa" required className="md:col-span-2" />
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="font-inter text-sm font-medium text-brand-text">Descrição</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Descrição..." rows={2} className="rounded-lg border border-brand-border font-outfit text-sm px-4 py-3 bg-brand-bg resize-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-sm font-medium text-brand-text">Cliente (opcional)</label>
            <select value={form.client_id} onChange={e => setForm(p => ({ ...p, client_id: e.target.value }))} className="rounded-lg border border-brand-border font-outfit text-sm px-4 py-3 bg-brand-bg">
              <option value="">Nenhum</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.full_name || c.email}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-sm font-medium text-brand-text">Viagem (opcional)</label>
            <select value={form.trip_id} onChange={e => setForm(p => ({ ...p, trip_id: e.target.value }))} className="rounded-lg border border-brand-border font-outfit text-sm px-4 py-3 bg-brand-bg">
              <option value="">Nenhuma</option>
              {trips.filter(t => !form.client_id || t.client_id === form.client_id).map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
          <Input label="Data de entrega" type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} />
          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-sm font-medium text-brand-text">Prioridade</label>
            <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as TaskPriority }))} className="rounded-lg border border-brand-border font-outfit text-sm px-4 py-3 bg-brand-bg">
              {Object.entries(priorityLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-sm font-medium text-brand-text">Categoria</label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as TaskCategory }))} className="rounded-lg border border-brand-border font-outfit text-sm px-4 py-3 bg-brand-bg">
              {Object.entries(taskCategoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="font-inter text-sm font-medium text-brand-text">Notas</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Notas..." rows={2} className="rounded-lg border border-brand-border font-outfit text-sm px-4 py-3 bg-brand-bg resize-none" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => { setModalOpen(false); resetForm(); setEditingId(null) }} className="flex-1 px-4 py-2.5 border border-brand-border text-brand-text rounded-lg font-inter text-sm hover:bg-brand-bg transition-colors">Cancelar</button>
          <button onClick={handleSave} className="flex-1 px-4 py-2.5 bg-brand-gold text-white rounded-lg font-inter text-sm font-medium hover:bg-brand-gold-dark transition-colors">Salvar</button>
        </div>
      </Modal>
    </div>
  )
}

// =============================================
// SHARED COMPONENTS
// =============================================

import React from 'react'

function SummaryCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <Card padding="md">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-brand-bg-secondary flex items-center justify-center flex-shrink-0">
          <Icon size={18} strokeWidth={1.5} className={color} />
        </div>
        <div>
          <p className={`font-inter text-xl font-semibold leading-none ${color}`}>{value}</p>
          <p className="font-inter text-xs text-brand-muted mt-0.5">{label}</p>
        </div>
      </div>
    </Card>
  )
}

function TaskCard({ task, onEdit, onDelete, onStatusChange, showStatus }: {
  task: PlannerTask
  onEdit: (t: PlannerTask) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: TaskStatus) => void
  showStatus?: boolean
}) {
  const priorityBadge: Record<TaskPriority, { variant: 'error' | 'warning' | 'gold' | 'success'; label: string }> = {
    urgent: { variant: 'error', label: 'Urgente' },
    high: { variant: 'warning', label: 'Alta' },
    medium: { variant: 'gold', label: 'Média' },
    low: { variant: 'success', label: 'Baixa' },
  }

  const pb = priorityBadge[task.priority]
  const nextStatuses: Record<TaskStatus, { label: string; next: TaskStatus }[]> = {
    todo: [{ label: 'Iniciar', next: 'in_progress' }],
    in_progress: [{ label: 'Concluir', next: 'done' }, { label: 'Voltar', next: 'todo' }],
    done: [{ label: 'Reabrir', next: 'todo' }],
    cancelled: [{ label: 'Reabrir', next: 'todo' }],
  }

  return (
    <Card padding="sm" className="hover:shadow-card transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-inter text-sm font-semibold text-brand-title leading-tight">{task.title}</h4>
        <div className="flex gap-0.5 flex-shrink-0">
          <button onClick={() => onEdit(task)} className="p-1 rounded hover:bg-brand-hover text-brand-muted hover:text-brand-gold transition-colors"><Edit2 size={12} /></button>
          <button onClick={() => onDelete(task.id)} className="p-1 rounded hover:bg-red-50 text-brand-muted hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
        </div>
      </div>
      {task.profile && (
        <p className="font-outfit text-xs text-brand-muted mb-1">
          {task.profile.full_name || task.profile.email}
          {task.trip && <> · {task.trip.title}</>}
        </p>
      )}
      <div className="flex flex-wrap gap-1 mb-2">
        <Badge variant={pb.variant}>{pb.label}</Badge>
        <Badge variant="neutral">{taskCategoryLabels[task.category]}</Badge>
        {showStatus && <Badge variant="neutral">{taskStatusLabels[task.status]}</Badge>}
      </div>
      {task.due_date && (
        <p className="font-inter text-xs text-brand-muted mb-2 flex items-center gap-1">
          <Calendar size={10} /> {formatDateShort(task.due_date)}
        </p>
      )}
      <div className="flex gap-1 flex-wrap">
        {nextStatuses[task.status].map(({ label, next }) => (
          <button key={next} onClick={() => onStatusChange(task.id, next)} className="px-2 py-1 text-xs font-inter rounded bg-brand-bg border border-brand-border text-brand-text hover:bg-brand-hover transition-colors flex items-center gap-1">
            <ArrowRight size={10} />{label}
          </button>
        ))}
      </div>
    </Card>
  )
}