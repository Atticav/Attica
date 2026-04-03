'use client';
import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { AtticaLogo } from '@/components/AtticaLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('E-mail ou senha inválidos. Por favor, verifique suas credenciais.');
      setLoading(false);
      return;
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profile?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F3] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <AtticaLogo size="lg" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5DDD5] p-8">
          <div className="mb-6 text-center">
            <h1 className="font-cormorant text-3xl font-semibold text-[#2D2D2D] mb-1">
              Bem-vindo de volta
            </h1>
            <p className="font-lora text-sm text-[#9C9C9C]">
              Acesse sua plataforma de viagens
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Input
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
              />
              <Mail size={16} strokeWidth={1.5} className="absolute right-3 top-9 text-[#9C9C9C]" />
            </div>

            <div className="relative">
              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-[#9C9C9C] hover:text-[#4A4A4A] transition-colors"
              >
                {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="font-inter text-sm text-[#C17B6E]">{error}</p>
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Entrar
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link
              href="/reset-password"
              className="font-inter text-sm text-[#C4A97D] hover:text-[#8B7355] transition-colors"
            >
              Esqueceu sua senha?
            </Link>
          </div>
        </div>

        <p className="text-center font-lora text-xs text-[#9C9C9C] mt-6">
          © {new Date().getFullYear()} Attica Studio de Viagens. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
