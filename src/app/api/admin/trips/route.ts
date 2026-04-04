import { createClient } from '@/lib/supabase/server'
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
  return { supabase, user }
}

export async function GET() {
  const auth = await verifyAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { supabase } = auth
  const { data, error } = await supabase
    .from('trips')
    .select('*, profile:profiles(id, full_name, email)')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const auth = await verifyAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { supabase } = auth
  const body = await request.json()
  const { client_id, title, destination, country, start_date, end_date, status, notes, cover_image_url } = body
  if (!client_id || !title || !destination) return NextResponse.json({ error: 'client_id, title, and destination are required' }, { status: 400 })
  const { data, error } = await supabase
    .from('trips')
    .insert({
      client_id,
      title,
      destination,
      country: country || '',
      start_date: start_date || null,
      end_date: end_date || null,
      status: status || 'planning',
      notes: notes || null,
      cover_image_url: cover_image_url || null,
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
