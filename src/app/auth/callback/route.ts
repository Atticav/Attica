import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
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

  if (code) {
    const supabase = await createClient()

    // If type is invite or recovery, the token is a hash — use verifyOtp
    if (type === 'invite' || type === 'recovery') {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: code,
        type: type as 'invite' | 'recovery',
      })
      if (!error) {
        return NextResponse.redirect(getRedirectUrl(request, origin, next))
      }
    } else {
      // OAuth flow — exchange code for session
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        return NextResponse.redirect(getRedirectUrl(request, origin, next))
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
