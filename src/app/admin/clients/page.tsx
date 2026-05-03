'use client'

import { useState, useEffect, useCallback } from 'react'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import { ToastContainer } from '@/components/ui/Toast'
import { Users, Plus, Edit2, Eye, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Client {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  created_at: string
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editClient, setEditClient] = useState<Client | null>(null)
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' })
  const [saving, setSaving] = useState(false)
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([])

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
  }

  const loadClients = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/clients')
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setClients(data)
    } catch {
      addToast('Erro ao carregar clientes', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadClients() }, [loadClients])

  function openCreate() {
    setEditClient(null)
    setForm({ full_name: '', email: '', phone: '' })
    setModalOpen(true)
  }

  function openEdit(client: Client) {
    setEditClient(client)
    setForm({ full_name: client.full_name || '', email: client.email, phone: client.phone || '' })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.full_name || (!editClient && !form.email)) {
      addToast('Nome e email são obrigatórios', 'error')
      return
    }
    setSaving(true)
    try {
      let res
      if (editClient) {
        res = await fetch(`/api/admin/clients/${editClient.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ full_name: form.full_name, phone: form.phone }),
        })
      } else {
        res = await fetch('/api/admin/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      }
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao salvar')
      }
      addToast(editClient ? 'Cliente atualizado!' : 'Cliente criado!', 'success')
      setModalOpen(false)
      loadClients()
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : 'Erro ao salvar', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteClient() {
    if (!deleteClientId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/clients/${deleteClientId}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao excluir')
      }
      addToast('Cliente excluído', 'success')
      setDeleteClientId(null)
      loadClients()
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : 'Erro ao excluir', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-cormorant text-4xl font-semibold text-brand-title">Clientes</h1>
          <p className="font-outfit text-brand-muted mt-1">Gerencie os perfis dos clientes</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-gold text-white rounded-lg font-inter text-sm font-medium hover:bg-brand-gold-dark transition-colors"
        >
          <Plus size={16} strokeWidth={1.5} />
          Novo Cliente
        </button>
      </div>

      <Card padding="none">
        {loading ? (
          <div className="p-8 text-center font-outfit text-brand-muted">Carregando...</div>
        ) : clients.length === 0 ? (
          <div className="p-8 text-center">
            <Users size={40} strokeWidth={1.3} className="text-brand-gold mx-auto mb-3" />
            <p className="font-cormorant text-xl text-brand-title">Nenhum cliente encontrado</p>
            <p className="font-outfit text-sm text-brand-muted mt-1">Clique em &quot;Novo Cliente&quot; para adicionar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-border">
                  <th className="text-left px-6 py-3 font-inter text-xs text-brand-muted uppercase tracking-wider">Nome</th>
                  <th className="text-left px-6 py-3 font-inter text-xs text-brand-muted uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-3 font-inter text-xs text-brand-muted uppercase tracking-wider hidden md:table-cell">Telefone</th>
                  <th className="text-left px-6 py-3 font-inter text-xs text-brand-muted uppercase tracking-wider hidden lg:table-cell">Criado em</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b border-brand-border last:border-0 hover:bg-brand-bg transition-colors">
                    <td className="px-6 py-4 font-inter text-sm text-brand-title">{client.full_name || '—'}</td>
                    <td className="px-6 py-4 font-outfit text-sm text-brand-muted">{client.email}</td>
                    <td className="px-6 py-4 font-outfit text-sm text-brand-muted hidden md:table-cell">{client.phone || '—'}</td>
                    <td className="px-6 py-4 font-inter text-xs text-brand-muted hidden lg:table-cell">
                      {new Date(client.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          href={`/admin/clients/${client.id}`}
                          className="p-1.5 text-brand-muted hover:text-brand-gold hover:bg-brand-bg-secondary rounded-lg transition-all"
                          title="Ver detalhes"
                        >
                          <Eye size={16} strokeWidth={1.5} />
                        </Link>
                        <button
                          onClick={() => openEdit(client)}
                          className="p-1.5 text-brand-muted hover:text-brand-gold hover:bg-brand-bg-secondary rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit2 size={16} strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => setDeleteClientId(client.id)}
                          className="p-1.5 text-brand-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Excluir"
                        >
                          <Trash2 size={16} strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editClient ? 'Editar Cliente' : 'Novo Cliente'}
      >
        <div className="space-y-4">
          <Input
            label="Nome completo"
            value={form.full_name}
            onChange={(e) => setForm(prev => ({ ...prev, full_name: e.target.value }))}
            placeholder="Nome do cliente"
            required
          />
          {!editClient && (
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@exemplo.com"
              required
            />
          )}
          <Input
            label="Telefone"
            value={form.phone}
            onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="+55 (11) 99999-9999"
          />
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-brand-border text-brand-text rounded-lg font-inter text-sm hover:bg-brand-bg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-brand-gold text-white rounded-lg font-inter text-sm font-medium hover:bg-brand-gold-dark transition-colors disabled:opacity-60"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!deleteClientId}
        onClose={() => setDeleteClientId(null)}
        title="Excluir cliente"
      >
        <p className="font-outfit text-brand-text mb-6">
          Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteClientId(null)}
            className="flex-1 px-4 py-2.5 border border-brand-border text-brand-text rounded-lg font-inter text-sm hover:bg-brand-bg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleDeleteClient}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-inter text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {deleting ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  )
}
