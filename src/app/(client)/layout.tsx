import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ClientLayout } from '@/components/layout/ClientLayout';

export default async function ClientAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <ClientLayout>{children}</ClientLayout>;
}
