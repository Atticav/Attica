'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'

const TripChat = dynamic(() => import('@/components/chat/TripChat'), { ssr: false })

export default function TripLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const tripId = params?.tripId as string
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16 lg:pt-8">
      {children}
      {userId && tripId && (
        <TripChat tripId={tripId} userId={userId} userRole="client" />
      )}
    </div>
  )
}
