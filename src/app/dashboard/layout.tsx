import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClientSidebar from '@/components/layout/ClientSidebar'
import { LanguageProvider } from '@/lib/i18n/LanguageContext'
import type { Language } from '@/lib/i18n/translations'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Buscar viagens e perfil do cliente
  const [{ data: trips }, { data: profile }] = await Promise.all([
    supabase
      .from('trips')
      .select('*, trip_widgets(show_vocabulary)')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('language')
      .eq('id', user.id)
      .single(),
  ])

  const defaultLanguage = (profile?.language as Language) || 'pt-BR'

  return (
    <LanguageProvider defaultLanguage={defaultLanguage}>
      <div className="flex min-h-screen bg-brand-bg">
        <ClientSidebar
          trips={trips ?? []}
          userEmail={user.email}
        />
        {/* Conteúdo principal */}
        <main className="flex-1 lg:ml-64 min-h-screen">
          {children}
        </main>
      </div>
    </LanguageProvider>
  )
}
