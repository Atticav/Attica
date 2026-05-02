import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')

  if (!q?.trim()) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 })
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'AtticaViagens/1.0 (travel-platform)',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
      next: { revalidate: 86400 },
    })

    if (!res.ok) throw new Error(`Nominatim returned ${res.status}`)

    const data = await res.json()
    if (data && data.length > 0) {
      return NextResponse.json({
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      })
    }

    return NextResponse.json({ lat: null, lng: null })
  } catch (error) {
    console.error('Geocode error:', error)
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 })
  }
}
