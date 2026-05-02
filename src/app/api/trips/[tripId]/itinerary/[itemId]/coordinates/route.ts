import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string; itemId: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { tripId, itemId } = await params

  // Verify the trip belongs to the authenticated user
  const { data: trip } = await supabase
    .from('trips')
    .select('id')
    .eq('id', tripId)
    .eq('client_id', user.id)
    .single()

  if (!trip) return NextResponse.json({ error: 'Trip not found' }, { status: 404 })

  const body = await request.json()
  const { latitude, longitude } = body

  // Validate coordinates are finite numbers within valid ranges
  if (
    typeof latitude !== 'number' || typeof longitude !== 'number' ||
    !isFinite(latitude) || !isFinite(longitude) ||
    latitude < -90 || latitude > 90 ||
    longitude < -180 || longitude > 180
  ) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
  }

  // Use admin client to bypass the RLS write restriction on itinerary_items.
  // The WHERE clause enforces both item ownership (trip_id) and trip ownership
  // (already verified above), so only items that belong to this trip are updated.
  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('itinerary_items')
    .update({ latitude, longitude })
    .eq('id', itemId)
    .eq('trip_id', tripId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
