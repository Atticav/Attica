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

interface GenerateRequest {
  tripId: string
  destination: string
  country: string
  start_date: string
  end_date: string
  travel_style?: string
  notes?: string
}

interface AIItineraryItem {
  day_number: number
  date: string
  time: string
  title: string
  description: string
  location: string
  category: string
  notes: string
}

export async function POST(request: Request) {
  const auth = await verifyAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { supabase } = auth

  const body: GenerateRequest = await request.json()
  const { tripId, destination, country, start_date, end_date, travel_style, notes } = body

  if (!tripId || !destination || !country || !start_date || !end_date) {
    return NextResponse.json({ error: 'Campos obrigatórios: tripId, destination, country, start_date, end_date' }, { status: 400 })
  }

  const groqApiKey = process.env.GROQ_API_KEY
  if (!groqApiKey) {
    return NextResponse.json({ error: 'GROQ_API_KEY não configurada no servidor' }, { status: 500 })
  }

  // Calculate number of days (inclusive)
  const start = new Date(start_date + 'T00:00:00Z')
  const end = new Date(end_date + 'T00:00:00Z')
  const numDays = Math.max(1, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)

  const systemPrompt = `Você é uma curadora de viagens de luxo da Attica Viagens, uma agência brasileira premium. 
Você cria roteiros elegantes, detalhados e logisticamente inteligentes. 
Escreva em português do Brasil. 
Os textos devem soar como escritos por uma consultora experiente — descritivos, calorosos e sofisticados — nunca parecer gerados por IA.
Sempre retorne APENAS um JSON válido, sem markdown, sem explicações.`

  const userPrompt = `Crie um roteiro completo de ${numDays} dias para ${destination}, ${country}.
Datas: ${start_date} a ${end_date}.
${travel_style ? `Estilo de viagem: ${travel_style}.` : ''}
${notes ? `Observações: ${notes}` : ''}

Retorne um array JSON com exatamente os itens do roteiro, distribuídos pelos dias.
Cada item deve ter EXATAMENTE estes campos:
{
  "day_number": número do dia (1, 2, 3...),
  "date": "YYYY-MM-DD",
  "time": "HH:MM" (horário sugerido, formato 24h),
  "title": "título conciso e elegante da atividade",
  "description": "descrição de 2-3 frases, com dica logística ou cultural sutil, no estilo editorial da Attica",
  "location": "nome do local ou endereço aproximado",
  "category": um de: "flight", "hotel", "transfer", "tour", "restaurant", "activity", "other",
  "notes": "dica prática opcional (ex: reservar com antecedência, melhor horário, etc)"
}

Distribua ~4-6 atividades por dia. Pense na logística: agrupe pontos próximos, respeite horários de funcionamento, inclua refeições nos horários certos. O primeiro item do dia 1 deve ser o check-in no hotel. O último item do último dia deve ser o check-out/voo de volta.`

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    })

    if (!groqRes.ok) {
      const errText = await groqRes.text()
      console.error('Groq API error:', errText)
      return NextResponse.json({ error: 'Erro ao comunicar com a IA. Tente novamente.' }, { status: 502 })
    }

    const groqData = await groqRes.json()
    const content = groqData.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json({ error: 'Resposta vazia da IA' }, { status: 502 })
    }

    // Parse the JSON response - try to extract JSON array from the response
    let aiItems: AIItineraryItem[]
    try {
      // Try direct parse first
      aiItems = JSON.parse(content)
    } catch {
      // Try to extract JSON array from the response text
      const jsonMatch = content.match(/\[[\s\S]*?\]/)
      if (!jsonMatch) {
        console.error('Failed to parse AI response:', content)
        return NextResponse.json({ error: 'Formato de resposta da IA inválido. Tente novamente.' }, { status: 502 })
      }
      aiItems = JSON.parse(jsonMatch[0])
    }

    if (!Array.isArray(aiItems) || aiItems.length === 0) {
      return NextResponse.json({ error: 'A IA não retornou itens válidos. Tente novamente.' }, { status: 502 })
    }

    // Get current max order_index
    const { data: existingItems } = await supabase
      .from('itinerary_items')
      .select('order_index')
      .eq('trip_id', tripId)
      .order('order_index', { ascending: false })
      .limit(1)

    let nextOrderIndex = existingItems && existingItems.length > 0 ? existingItems[0].order_index + 1 : 0

    // Validate categories
    const validCategories = ['flight', 'hotel', 'transfer', 'tour', 'restaurant', 'activity', 'other']

    // Insert items into Supabase
    const itemsToInsert = aiItems.map((item) => ({
      trip_id: tripId,
      day_number: Number(item.day_number) || 1,
      date: item.date || null,
      time: item.time || null,
      title: String(item.title || 'Sem título'),
      description: item.description || null,
      location: item.location || null,
      category: validCategories.includes(item.category) ? item.category : 'other',
      notes: item.notes || null,
      order_index: nextOrderIndex++,
    }))

    const { data: createdItems, error: insertError } = await supabase
      .from('itinerary_items')
      .insert(itemsToInsert)
      .select()

    if (insertError) {
      console.error('Supabase insert error:', insertError)
      return NextResponse.json({ error: 'Erro ao salvar itens no banco de dados' }, { status: 500 })
    }

    return NextResponse.json({
      items: createdItems,
      count: createdItems?.length || 0,
      message: `${createdItems?.length || 0} itens criados com sucesso!`,
    })
  } catch (err) {
    console.error('AI generation error:', err)
    return NextResponse.json({ error: 'Erro interno ao gerar roteiro. Tente novamente.' }, { status: 500 })
  }
}
