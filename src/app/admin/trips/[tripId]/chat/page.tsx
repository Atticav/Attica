'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import TripChat from '@/components/chat/TripChat'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AdminTripChatPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params)
  const [userId, setUserId] = useState<string | null>(null)
  const [tripTitle, setTripTitle] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.auth.getUser(),
      supabase.from('trips').select('title').eq('id', tripId).single(),
    ]).then(([{ data: authData, error: authError }, { data: tripData, error: tripError }]) => {
      if (authError) {
        console.error('Failed to get user:', authError.message)
        setError('Não foi possível autenticar o usuário.')
        return
      }
      if (tripError) {
        console.error('Failed to fetch trip title:', tripError.message)
        setError('Não foi possível carregar os dados da viagem.')
        return
      }
      if (authData.user) setUserId(authData.user.id)
      if (tripData) setTripTitle(tripData.title)
    })
  }, [tripId])

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/admin/trips/${tripId}`}
          className="flex items-center gap-2 text-brand-muted hover:text-brand-gold font-inter text-sm mb-4 transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Voltar para a viagem
        </Link>
        <h1 className="font-cormorant text-4xl font-semibold text-brand-title">
          Chat — {tripTitle}
        </h1>
        <p className="font-outfit text-sm text-brand-muted mt-1">
          Converse diretamente com o cliente desta viagem
        </p>
      </div>

      {error ? (
        <div className="flex items-center justify-center py-20">
          <p className="font-outfit text-sm text-red-500">{error}</p>
        </div>
      ) : userId ? (
        <div className="max-w-2xl mx-auto h-[600px]">
          <TripChat tripId={tripId} userId={userId} userRole="admin" embedded />
        </div>
      ) : (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
