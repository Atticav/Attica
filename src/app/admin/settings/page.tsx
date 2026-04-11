import { createClient } from '@/lib/supabase/server'
import Card from '@/components/ui/Card'
import { User, Bell, Palette } from 'lucide-react'

export default async function AdminSettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single()
    : { data: null }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-cormorant text-4xl font-semibold text-brand-title">
          Configurações
        </h1>
        <p className="font-outfit text-brand-muted mt-1">
          Configurações do sistema
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Perfil do administrador */}
        <Card padding="md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-brand-bg-secondary flex items-center justify-center">
              <User size={18} strokeWidth={1.5} className="text-brand-gold" />
            </div>
            <h2 className="font-cormorant text-xl font-semibold text-brand-title">
              Perfil do administrador
            </h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="font-inter text-xs text-brand-muted mb-0.5">Nome</p>
              <p className="font-outfit text-sm text-brand-text">
                {profile?.full_name ?? '—'}
              </p>
            </div>
            <div>
              <p className="font-inter text-xs text-brand-muted mb-0.5">E-mail</p>
              <p className="font-outfit text-sm text-brand-text">
                {user?.email ?? '—'}
              </p>
            </div>
            <div>
              <p className="font-inter text-xs text-brand-muted mb-0.5">Perfil</p>
              <p className="font-outfit text-sm text-brand-text capitalize">
                {profile?.role ?? '—'}
              </p>
            </div>
          </div>
        </Card>

        {/* Notificações */}
        <Card padding="md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-brand-bg-secondary flex items-center justify-center">
              <Bell size={18} strokeWidth={1.5} className="text-brand-gold" />
            </div>
            <h2 className="font-cormorant text-xl font-semibold text-brand-title">
              Notificações
            </h2>
          </div>
          <p className="font-outfit text-sm text-brand-muted">
            Configurações de notificações em breve.
          </p>
        </Card>

        {/* Aparência */}
        <Card padding="md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-brand-bg-secondary flex items-center justify-center">
              <Palette size={18} strokeWidth={1.5} className="text-brand-gold" />
            </div>
            <h2 className="font-cormorant text-xl font-semibold text-brand-title">
              Aparência
            </h2>
          </div>
          <p className="font-outfit text-sm text-brand-muted">
            Configurações de aparência em breve.
          </p>
        </Card>
      </div>
    </div>
  )
}
