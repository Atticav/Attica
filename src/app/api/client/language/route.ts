import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const VALID_LANGUAGES = ['pt-BR', 'en', 'es', 'fr', 'it']

export async function PUT(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await request.json()
  const { language } = body

  if (!language || !VALID_LANGUAGES.includes(language)) {
    return NextResponse.json({ error: 'Invalid language' }, { status: 400 })
  }

  const { error } = await supabase
    .from('profiles')
    .update({ language })
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
