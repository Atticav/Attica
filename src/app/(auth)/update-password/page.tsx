'use client';
import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { AtticaLogo } from '@/components/AtticaLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CheckCircle } from 'lucide-react';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    setLoading(true);
    setError('');

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError('Erro ao atualizar senha. O link pode ter expirado.');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push('/login'), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF6F3] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <AtticaLogo size="lg" />
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5DDD5] p-8">
          {success ? (
            <div className="text-center">
              <CheckCircle size={48} strokeWidth={1.5} className="text-[#7B9E6B] mx-auto mb-4" />
              <h2 className="font-cormorant text-2xl font-semibold text-[#2D2D2D] mb-2">Senha atualizada!</h2>
              <p className="font-lora text-sm text-[#9C9C9C]">Redirecionando para o login...</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="font-cormorant text-3xl font-semibold text-[#2D2D2D] mb-1">Nova senha</h1>
                <p className="font-lora text-sm text-[#9C9C9C]">Defina uma nova senha segura</p>
              </div>
              <form onSubmit={handleUpdate} className="space-y-4">
                <Input label="Nova senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" required />
                <Input label="Confirmar senha" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repita a senha" required />
                {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3"><p className="font-inter text-sm text-[#C17B6E]">{error}</p></div>}
                <Button type="submit" loading={loading} className="w-full" size="lg">Atualizar senha</Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
