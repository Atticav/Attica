import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

const DEFAULT_ALBUMS = [
  'Fotos da Viagem',
  'Paisagens',
  'Gastronomia',
  'Cultura & Pontos Turísticos',
  'Momentos Especiais',
  'Documentos Visuais',
]

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

  let { data, error } = await supabase
    .from('gallery_albums')
    .select('*')
    .eq('trip_id', tripId)
    .order('order_index', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!data || data.length === 0) {
    const defaults = DEFAULT_ALBUMS.map((name, i) => ({
      trip_id: tripId,
      name,
      visible: true,
      order_index: i,
    }))
    const { data: created, error: insertError } = await supabase
      .from('gallery_albums')
      .insert(defaults)
      .select()
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })
    data = created
  }

  return NextResponse.json(data)
}

export async function POST(request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const auth = await verifyAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { tripId } = await params
  const body = await request.json()
  const { name, visible = true, order_index } = body
  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'name is required and must be a non-empty string' }, { status: 400 })
  }
  const { data, error } = await supabase
    .from('gallery_albums')
    .insert({ name: name.trim(), visible, order_index, trip_id: tripId })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
