import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: existingClass, error: selectError } = await supabase
    .from('classes')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (selectError) {
    console.error('Error checking for class:', selectError);
    throw new Error('Failed to check for existing class');
  }

  if (existingClass) {
    redirect(`/class/${existingClass.id}`);
  }

  const { data: newClass, error: insertError } = await supabase
    .from('classes')
    .insert({ user_id: user.id, name: 'My Study Materials' })
    .select('id')
    .single();

  if (insertError?.code === '23505') {
    const { data: raceClass } = await supabase
      .from('classes')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (raceClass) redirect(`/class/${raceClass.id}`);
  }

  if (insertError && insertError.code !== '23505') {
    console.error('Error creating class:', insertError);
    throw new Error('Failed to create class');
  }

  if (newClass) redirect(`/class/${newClass.id}`);

  return <div>Getting started...</div>;
}
