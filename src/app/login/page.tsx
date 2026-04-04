'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/layout/Logo'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError('E-mail ou senha inválidos. Por favor, verifique suas credenciais.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-brand shadow-card px-8 py-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          {/* Título */}
          <div className="text-center mb-8">
            <h1 className="font-cormorant text-3xl font-semibold text-brand-title">
              Bem-vinda de volta
            </h1>
            <p className="font-outfit text-brand-muted mt-2 text-sm">
              Acesse seu Caderno de Viagem
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleLogin} className="space-y-5">
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
                autoComplete="email"
                placeholder="seu@email.com"
                className="
                  w-full px-4 py-3 rounded-lg border border-brand-border
                  bg-brand-bg font-outfit text-brand-text text-sm
                  placeholder:text-brand-muted
                  focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent
                  transition-all duration-200
                "
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block font-inter text-sm font-medium text-brand-text mb-1.5"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="
                  w-full px-4 py-3 rounded-lg border border-brand-border
                  bg-brand-bg font-outfit text-brand-text text-sm
                  placeholder:text-brand-muted
                  focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent
                  transition-all duration-200
                "
              />
            </div>

            {/* Link esqueceu a senha */}
            <div className="text-right">
              <a
                href="/reset-password"
                className="font-inter text-xs text-brand-gold hover:text-brand-gold-dark transition-colors"
              >
                Esqueceu a senha?
              </a>
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-50 border border-brand-error/30 rounded-lg px-4 py-3">
                <p className="font-inter text-sm text-brand-error">{error}</p>
              </div>
            )}

            {/* Botão */}
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
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          {/* Rodapé */}
          <div className="mt-8 pt-6 border-t border-brand-border text-center">
            <p className="font-cinzel text-xs text-brand-muted tracking-widest uppercase">
              Attica Studio de Viagens
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
