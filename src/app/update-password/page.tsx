'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/layout/Logo'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.')
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError('Não foi possível atualizar a senha. O link pode ter expirado.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-brand shadow-card px-8 py-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          <div className="text-center mb-8">
            <h1 className="font-cormorant text-3xl font-semibold text-brand-title">
              Nova senha
            </h1>
            <p className="font-outfit text-brand-muted mt-2 text-sm">
              Escolha uma nova senha para sua conta
            </p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-5">
            <div>
              <label
                htmlFor="password"
                className="block font-inter text-sm font-medium text-brand-text mb-1.5"
              >
                Nova senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Mínimo 8 caracteres"
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
                htmlFor="confirm"
                className="block font-inter text-sm font-medium text-brand-text mb-1.5"
              >
                Confirmar nova senha
              </label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="Repita a senha"
                className="
                  w-full px-4 py-3 rounded-lg border border-brand-border
                  bg-brand-bg font-outfit text-brand-text text-sm
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
              {loading ? 'Salvando…' : 'Definir nova senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
