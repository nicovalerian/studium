import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { CTA } from '@/components/landing/cta';
import { Footer } from '@/components/landing/footer';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <main className="flex min-h-screen flex-col">
      <Hero />
      <Features />
      <CTA />
      <Footer />
    </main>
  );
}
