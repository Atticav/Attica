'use client';
import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AtticaLogo } from '@/components/AtticaLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (resetError) {
      setError('Erro ao enviar e-mail. Verifique o endereço e tente novamente.');
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF6F3] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <AtticaLogo size="lg" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E5DDD5] p-8">
          {sent ? (
            <div className="text-center">
              <CheckCircle size={48} strokeWidth={1.5} className="text-[#7B9E6B] mx-auto mb-4" />
              <h2 className="font-cormorant text-2xl font-semibold text-[#2D2D2D] mb-2">
                E-mail enviado!
              </h2>
              <p className="font-lora text-sm text-[#9C9C9C] mb-6">
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft size={16} strokeWidth={1.5} />
                  Voltar ao login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="font-cormorant text-3xl font-semibold text-[#2D2D2D] mb-1">
                  Recuperar senha
                </h1>
                <p className="font-lora text-sm text-[#9C9C9C]">
                  Informe seu e-mail para receber o link de recuperação
                </p>
              </div>

              <form onSubmit={handleReset} className="space-y-4">
                <div className="relative">
                  <Input
                    label="E-mail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                  <Mail size={16} strokeWidth={1.5} className="absolute right-3 top-9 text-[#9C9C9C]" />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    <p className="font-inter text-sm text-[#C17B6E]">{error}</p>
                  </div>
                )}

                <Button type="submit" loading={loading} className="w-full" size="lg">
                  Enviar link de recuperação
                </Button>
              </form>

              <div className="mt-4 text-center">
                <Link href="/login" className="font-inter text-sm text-[#9C9C9C] hover:text-[#4A4A4A] flex items-center justify-center gap-1 transition-colors">
                  <ArrowLeft size={14} strokeWidth={1.5} /> Voltar ao login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
