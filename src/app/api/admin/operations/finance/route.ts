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
  const month = searchParams.get('month')
  const year = searchParams.get('year')
  const type = searchParams.get('type')
  const category = searchParams.get('category')

  let query = supabase
    .from('company_transactions')
    .select('*')
    .order('date', { ascending: false })

  if (type && type !== 'all') {
    query = query.eq('type', type)
  }
  if (category && category !== 'all') {
    query = query.eq('category', category)
  }
  if (month && year) {
    const startDate = `${year}-${month.padStart(2, '0')}-01`
    const endMonth = parseInt(month)
    const endYear = parseInt(year)
    const nextMonth = endMonth === 12 ? 1 : endMonth + 1
    const nextYear = endMonth === 12 ? endYear + 1 : endYear
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`
    query = query.gte('date', startDate).lt('date', endDate)
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

  const { type, category, description, amount, currency, date, client_id, trip_id, status, notes } = body

  if (!type || !description || amount === undefined) {
    return NextResponse.json({ error: 'type, description e amount são obrigatórios' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('company_transactions')
    .insert({
      type,
      category: category || 'other',
      description,
      amount,
      currency: currency || 'BRL',
      date: date || new Date().toISOString().split('T')[0],
      client_id: client_id || null,
      trip_id: trip_id || null,
      status: status || 'confirmed',
      notes: notes || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
