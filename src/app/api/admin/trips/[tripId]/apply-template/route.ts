import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

const SECTION_TABLE_MAP: Record<string, string> = {
  packing: 'packing_items',
  checklist: 'checklist_items',
  strategic: 'strategic_sections',
  guide: 'tutorials',
  photography: 'photography_tips',
  vocabulary: 'vocabulary',
}

const PACKING_VALID_CATEGORIES = new Set([
  'clothing', 'documents', 'health', 'electronics', 'toiletries', 'accessories', 'other',
])

const GUIDE_VALID_TYPES = new Set(['video', 'youtube', 'pdf', 'link'])

/**
 * Normalises a raw template row before inserting it into the live section table.
 * Fills in NOT NULL / CHECK-constrained columns that may be null/empty in
 * template tables, preventing constraint violations on insert.
 * Returns null when the item cannot be inserted (e.g. missing a required URL).
 */
function normalizeItem(
  section: string,
  raw: Record<string, unknown>,
  tripId: string,
): Record<string, unknown> | null {
  // Strip template-only meta columns
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, created_at: _ca, updated_at: _ua, ...item } = raw

  // Always set trip_id
  item.trip_id = tripId

  // Ensure order_index has a fallback
  if (item.order_index === null || item.order_index === undefined) {
    item.order_index = 0
  }

  switch (section) {
    case 'packing': {
      // Build an explicit whitelist-only object so that legacy template columns
      // like 'name' (instead of 'item_name') never reach the insert payload.
      const rawName =
        (item.item_name as string | null | undefined) ||
        (item.name as string | null | undefined)
      const cat = item.category as string | null | undefined
      return {
        trip_id: tripId,
        item_name:
          typeof rawName === 'string' && rawName.trim()
            ? rawName.trim()
            : 'Item sem nome',
        category:
          cat && PACKING_VALID_CATEGORIES.has(cat) ? cat : 'other',
        quantity:
          typeof item.quantity === 'number' && Number.isFinite(item.quantity)
            ? item.quantity
            : 1,
        is_packed: false,
        is_essential: Boolean(item.is_essential),
        notes: typeof item.notes === 'string' ? item.notes : null,
        order_index:
          typeof item.order_index === 'number' && Number.isFinite(item.order_index)
            ? item.order_index
            : 0,
      }
    }

    case 'checklist': {
      // section: NOT NULL DEFAULT 'geral'
      if (!item.section) item.section = 'geral'
      // is_completed: NOT NULL DEFAULT FALSE (column not in template)
      item.is_completed = false
      break
    }

    case 'guide': {
      // type: NOT NULL DEFAULT 'youtube', CHECK constraint
      const t = item.type as string | null | undefined
      item.type = t && GUIDE_VALID_TYPES.has(t) ? t : 'youtube'
      // url: NOT NULL — items without a URL cannot be inserted; mark for removal
      if (!item.url) return null
      break
    }

    case 'photography': {
      // tip_text: NOT NULL (template allows null; fall back to title)
      if (!item.tip_text) {
        item.tip_text = (item.title as string) || ''
      }
      break
    }

    case 'vocabulary': {
      // local_language: NOT NULL (template allows null)
      if (!item.local_language) item.local_language = ''
      break
    }

    // strategic: all NOT NULL columns (title, order_index) have defaults in template
    default:
      break
  }

  return item
}

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', status: 401 as const }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (!profile || profile.role !== 'admin') return { error: 'Not authorized', status: 403 as const }
  return { user }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> },
) {
  const auth = await verifyAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { tripId } = await params

  let section: string
  try {
    const body = await request.json()
    section = body?.section
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!section || !SECTION_TABLE_MAP[section]) {
    return NextResponse.json(
      { error: `Seção inválida ou sem suporte a templates: "${section}"` },
      { status: 400 },
    )
  }

  const targetTable = SECTION_TABLE_MAP[section]
  const templateTable = `template_${section}`

  // Use admin client to bypass RLS for both read and write
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminClient = createAdminClient() as any

  // 1. Fetch template rows
  const { data: templateItems, error: fetchError } = await adminClient
    .from(templateTable)
    .select('*')
    .order('order_index', { ascending: true })

  if (fetchError) {
    console.error(`[apply-template] fetch error (${templateTable}):`, fetchError)
    return NextResponse.json(
      { error: `Erro ao ler template: ${fetchError.message}` },
      { status: 500 },
    )
  }

  if (!templateItems || templateItems.length === 0) {
    return NextResponse.json(
      { error: 'Nenhum item encontrado no template desta seção' },
      { status: 404 },
    )
  }

  // 2. Normalise each row; skip items that cannot be inserted (e.g. missing required URL)
  const itemsToInsert = (templateItems as Record<string, unknown>[])
    .map(row => normalizeItem(section, row, tripId))
    .filter((item): item is Record<string, unknown> => item !== null)

  if (itemsToInsert.length === 0) {
    return NextResponse.json(
      { error: 'Nenhum item do template pôde ser inserido (verifique os campos obrigatórios)' },
      { status: 422 },
    )
  }

  // 3. Insert into target table using admin client
  const { data: inserted, error: insertError } = await adminClient
    .from(targetTable)
    .insert(itemsToInsert)
    .select()

  if (insertError) {
    console.error(`[apply-template] insert error (${targetTable}):`, insertError)
    return NextResponse.json(
      { error: `Erro ao inserir itens: ${insertError.message}` },
      { status: 500 },
    )
  }

  return NextResponse.json(
    { count: inserted?.length ?? itemsToInsert.length, items: inserted },
    { status: 201 },
  )
}
