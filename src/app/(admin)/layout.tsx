import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminLayout } from '@/components/layout/AdminLayout';

export default async function AdminAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') redirect('/dashboard');

  return <AdminLayout>{children}</AdminLayout>;
}
