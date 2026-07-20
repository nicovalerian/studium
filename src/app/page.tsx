import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { Footer } from '@/components/landing/footer';

export default function Home() {
  return (
    <main id="main-content" className="flex min-h-screen flex-col" tabIndex={-1}>
      <Hero />
      <Features />
      <Footer />
    </main>
  );
}
