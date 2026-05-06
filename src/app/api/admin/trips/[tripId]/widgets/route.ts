import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', status: 401 }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (!profile || profile.role !== 'admin') return { error: 'Not authorized', status: 403 }
  return { user }
}

export async function GET(request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const auth = await verifyAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { tripId } = await params

  const { data, error } = await supabase
    .from('trip_widgets')
    .select('*')
    .eq('trip_id', tripId)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const auth = await verifyAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { tripId } = await params
  const body = await request.json()

  const { travel_style, ideal_duration, custom_notes, show_weather, show_currency, show_map_button, show_vocabulary, show_cultura, show_restaurantes } = body

  const { data, error } = await supabase
    .from('trip_widgets')
    .upsert(
      {
        trip_id: tripId,
        travel_style: travel_style || null,
        ideal_duration: ideal_duration || null,
        custom_notes: custom_notes || null,
        show_weather: show_weather ?? true,
        show_currency: show_currency ?? true,
        show_map_button: show_map_button ?? true,
        show_vocabulary: show_vocabulary ?? true,
        show_cultura: show_cultura ?? true,
        show_restaurantes: show_restaurantes ?? true,
      },
      { onConflict: 'trip_id' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
