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
  const priority = searchParams.get('priority')
  const category = searchParams.get('category')
  const client_id = searchParams.get('client_id')

  let query = supabase
    .from('planner_tasks')
    .select('*, profile:profiles(id, full_name, email), trip:trips(id, title)')
    .order('order_index', { ascending: true })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }
  if (priority && priority !== 'all') {
    query = query.eq('priority', priority)
  }
  if (category && category !== 'all') {
    query = query.eq('category', category)
  }
  if (client_id) {
    query = query.eq('client_id', client_id)
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

  const { title, description, trip_id, client_id, due_date, priority, category, notes } = body

  if (!title) {
    return NextResponse.json({ error: 'title é obrigatório' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('planner_tasks')
    .insert({
      title,
      description: description || null,
      trip_id: trip_id || null,
      client_id: client_id || null,
      due_date: due_date || null,
      priority: priority || 'medium',
      category: category || 'itinerary',
      notes: notes || null,
      status: 'todo',
    })
    .select('*, profile:profiles(id, full_name, email), trip:trips(id, title)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
