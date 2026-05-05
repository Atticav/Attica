import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? (type === 'invite' || type === 'recovery' ? '/update-password' : '/dashboard')

  const getRedirectUrl = (request: Request, origin: string, path: string) => {
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'
    if (isLocalEnv) return `${origin}${path}`
    if (forwardedHost) return `https://${forwardedHost}${path}`
    return `${origin}${path}`
  }

  // invite/recovery flow via token_hash
  if (token_hash && (type === 'invite' || type === 'recovery')) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'invite' | 'recovery',
    })
    if (!error) {
      return NextResponse.redirect(getRedirectUrl(request, origin, next))
    }
  }

  // OAuth PKCE flow via code
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(getRedirectUrl(request, origin, next))
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
