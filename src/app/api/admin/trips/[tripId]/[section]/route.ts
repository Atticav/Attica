import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const SECTION_TABLE_MAP: Record<string, string> = {
  itinerary: 'itinerary_items',
  financial: 'financial_items',
  documents: 'documents',
  packing: 'packing_items',
  checklist: 'checklist_items',
  strategic: 'strategic_sections',
  guide: 'tutorials',
  gallery: 'gallery_items',
  restaurants: 'restaurants',
  photography: 'photography_tips',
  culture: 'cultural_infos',
  vocabulary: 'vocabularies',
  contract: 'contracts',
}

// Tables that do not have an order_index column — fall back to created_at ordering
const TABLES_WITHOUT_ORDER = new Set(['contracts'])

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

export async function GET(request: Request, { params }: { params: Promise<{ tripId: string; section: string }> }) {
  const auth = await verifyAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { supabase } = auth
  const { tripId, section } = await params
  const table = SECTION_TABLE_MAP[section]
  if (!table) return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
  const query = supabase
    .from(table)
    .select('*')
    .eq('trip_id', tripId)

  // order_index may not exist in all tables; fall back to created_at for those
  const { data, error } = TABLES_WITHOUT_ORDER.has(table)
    ? await query.order('created_at', { ascending: true })
    : await query.order('order_index', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request, { params }: { params: Promise<{ tripId: string; section: string }> }) {
  const auth = await verifyAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { supabase } = auth
  const { tripId, section } = await params
  const table = SECTION_TABLE_MAP[section]
  if (!table) return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
  const body = await request.json()
  const { data, error } = await supabase
    .from(table)
    .insert({ ...body, trip_id: tripId })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
