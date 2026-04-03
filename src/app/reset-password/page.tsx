'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/layout/Logo'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })

    if (resetError) {
      setError('Não foi possível enviar o e-mail. Verifique o endereço e tente novamente.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-brand shadow-card px-8 py-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="font-cormorant text-2xl font-semibold text-brand-title mb-2">
                E-mail enviado!
              </h2>
              <p className="font-lora text-brand-muted text-sm leading-relaxed">
                Enviamos as instruções para redefinir sua senha para{' '}
                <strong className="text-brand-text">{email}</strong>.
                Verifique sua caixa de entrada e spam.
              </p>
              <a
                href="/login"
                className="mt-6 inline-block font-inter text-sm text-brand-gold hover:text-brand-gold-dark transition-colors"
              >
                ← Voltar ao login
              </a>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="font-cormorant text-3xl font-semibold text-brand-title">
                  Recuperar senha
                </h1>
                <p className="font-lora text-brand-muted mt-2 text-sm">
                  Informe seu e-mail para receber as instruções
                </p>
              </div>

              <form onSubmit={handleReset} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block font-inter text-sm font-medium text-brand-text mb-1.5"
                  >
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="seu@email.com"
                    className="
                      w-full px-4 py-3 rounded-lg border border-brand-border
                      bg-brand-bg font-lora text-brand-text text-sm
                      placeholder:text-brand-muted
                      focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent
                      transition-all duration-200
                    "
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-brand-error/30 rounded-lg px-4 py-3">
                    <p className="font-inter text-sm text-brand-error">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full py-3 px-6 rounded-lg
                    bg-brand-gold hover:bg-brand-gold-dark
                    text-white font-inter font-medium text-sm
                    transition-all duration-200
                    disabled:opacity-60 disabled:cursor-not-allowed
                    shadow-gold hover:shadow-none
                  "
                >
                  {loading ? 'Enviando…' : 'Enviar instruções'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <a
                  href="/login"
                  className="font-inter text-sm text-brand-gold hover:text-brand-gold-dark transition-colors"
                >
                  ← Voltar ao login
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
