import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClientSidebar from '@/components/layout/ClientSidebar'

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

  // Buscar viagens do cliente
  const { data: trips } = await supabase
    .from('trips')
    .select('*')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="flex min-h-screen bg-brand-bg">
      <ClientSidebar
        trips={trips ?? []}
        userEmail={user.email}
      />
      {/* Conteúdo principal */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  )
}
