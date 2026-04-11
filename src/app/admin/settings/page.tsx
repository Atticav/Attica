'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import { createClient } from '@/lib/supabase/client'
import { Settings, User, Shield, Info } from 'lucide-react'

export default function AdminSettingsPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      setEmail(user.email || '')

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (profile) {
        setFullName(profile.full_name || '')
      }
      setLoading(false)
    }

    loadProfile()
  }, [])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage({ text: 'Usuário não autenticado.', type: 'error' })
      setSaving(false)
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id)

    if (error) {
      setMessage({ text: 'Erro ao salvar alterações. Tente novamente.', type: 'error' })
    } else {
      setMessage({ text: 'Alterações salvas com sucesso!', type: 'success' })
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="font-outfit text-brand-muted">Carregando...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Settings size={28} strokeWidth={1.5} className="text-brand-gold" />
          <h1 className="font-cormorant text-4xl font-semibold text-brand-title">
            Configurações
          </h1>
        </div>
        <p className="font-outfit text-brand-muted mt-1">
          Gerencie seu perfil e preferências do sistema
        </p>
      </div>

      <div className="space-y-6">
        {/* Perfil do Administrador */}
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <User size={20} strokeWidth={1.5} className="text-blue-500" />
            </div>
            <div>
              <h2 className="font-cormorant text-2xl font-semibold text-brand-title">
                Perfil do Administrador
              </h2>
              <p className="font-outfit text-sm text-brand-muted">
                Informações da sua conta
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div>
              <label className="block font-inter text-sm font-medium text-brand-text mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="
                  w-full px-4 py-3 rounded-lg border border-brand-border
                  bg-brand-bg font-outfit text-brand-muted text-sm
                  cursor-not-allowed
                "
              />
              <p className="font-outfit text-xs text-brand-muted mt-1">
                O e-mail não pode ser alterado por aqui.
              </p>
            </div>

            <div>
              <label
                htmlFor="fullName"
                className="block font-inter text-sm font-medium text-brand-text mb-1.5"
              >
                Nome completo
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome completo"
                className="
                  w-full px-4 py-3 rounded-lg border border-brand-border
                  bg-brand-bg font-outfit text-brand-text text-sm
                  placeholder:text-brand-muted
                  focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent
                  transition-all duration-200
                "
              />
            </div>

            {/* Feedback message */}
            {message && (
              <div
                className={`rounded-lg px-4 py-3 border ${
                  message.type === 'success'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-brand-error/30'
                }`}
              >
                <p
                  className={`font-inter text-sm ${
                    message.type === 'success' ? 'text-brand-success' : 'text-brand-error'
                  }`}
                >
                  {message.text}
                </p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={saving}
                className="
                  px-6 py-2.5 rounded-lg
                  bg-brand-gold hover:bg-brand-gold-dark
                  text-white font-inter font-medium text-sm
                  transition-all duration-200
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </form>
        </Card>

        {/* Segurança */}
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Shield size={20} strokeWidth={1.5} className="text-brand-warning" />
            </div>
            <div>
              <h2 className="font-cormorant text-2xl font-semibold text-brand-title">
                Segurança
              </h2>
              <p className="font-outfit text-sm text-brand-muted">
                Gerencie a segurança da sua conta
              </p>
            </div>
          </div>

          <div>
            <p className="font-outfit text-sm text-brand-text mb-4">
              Para alterar sua senha, você será redirecionado para a página de recuperação de senha.
            </p>
            <button
              onClick={() => router.push('/reset-password')}
              className="
                px-6 py-2.5 rounded-lg
                border border-brand-border
                text-brand-text font-inter font-medium text-sm
                hover:bg-brand-bg hover:border-brand-gold/30
                transition-all duration-200
              "
            >
              Alterar senha
            </button>
          </div>
        </Card>

        {/* Sobre o Sistema */}
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-brand-bg-secondary flex items-center justify-center">
              <Info size={20} strokeWidth={1.5} className="text-brand-gold" />
            </div>
            <div>
              <h2 className="font-cormorant text-2xl font-semibold text-brand-title">
                Sobre o Sistema
              </h2>
              <p className="font-outfit text-sm text-brand-muted">
                Informações sobre a plataforma
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-brand-border">
              <span className="font-inter text-sm text-brand-muted">Sistema</span>
              <span className="font-inter text-sm font-medium text-brand-title">
                Attica Studio de Viagens
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="font-inter text-sm text-brand-muted">Versão</span>
              <span className="font-inter text-sm font-medium text-brand-title">1.0.0</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
