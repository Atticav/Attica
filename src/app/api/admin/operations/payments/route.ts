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

export async function GET(request: Request) {
  const auth = await verifyAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { supabase } = auth

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  let query = supabase
    .from('client_payments')
    .select('*, profile:profiles(id, full_name, email), trip:trips(id, title)')
    .order('due_date', { ascending: true })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const auth = await verifyAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { supabase } = auth
  const body = await request.json()

  const { client_id, trip_id, description, amount, due_date, payment_method, notes } = body

  if (!client_id || !description || amount === undefined) {
    return NextResponse.json({ error: 'client_id, description e amount são obrigatórios' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('client_payments')
    .insert({
      client_id,
      trip_id: trip_id || null,
      description,
      amount,
      due_date: due_date || null,
      payment_method: payment_method || null,
      notes: notes || null,
      status: 'pending',
    })
    .select('*, profile:profiles(id, full_name, email), trip:trips(id, title)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
