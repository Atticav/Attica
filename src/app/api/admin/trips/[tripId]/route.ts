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
    .from('trips')
    .select('*, profile:profiles(id, full_name, email)')
    .eq('id', tripId)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const auth = await verifyAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { tripId } = await params
  const body = await request.json()
  const { title, destination, country, start_date, end_date, status, notes, cover_image_url } = body
  const { data, error } = await supabase
    .from('trips')
    .update({ title, destination, country, start_date, end_date, status, notes, cover_image_url, updated_at: new Date().toISOString() })
    .eq('id', tripId)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const auth = await verifyAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { tripId } = await params
  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', tripId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
