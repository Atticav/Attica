import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')
  const target = searchParams.get('target') || 'en'
  const source = searchParams.get('source') || 'pt'

  if (!q || q.trim().length < 1) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 })
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(q)}`

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      },
    })

    if (!res.ok) {
      throw new Error(`Translation API returned ${res.status}`)
    }

    const data = await res.json()
    // Google Translate response: [[[translatedText, originalText, ...],...],...]
    // Join all segments to handle longer phrases split into multiple parts
    const translated = data?.[0]?.map((item: unknown[]) => item[0]).filter(Boolean).join('') || ''

    return NextResponse.json({ translated })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
  }
}
