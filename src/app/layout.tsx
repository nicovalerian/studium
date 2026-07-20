import type { Metadata } from 'next';
import { Lexend, Source_Sans_3 } from 'next/font/google';
import './globals.css';

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Studium - Your Study Companion',
    template: '%s | Studium',
  },
  description:
    'Upload your study materials, chat about your notes, and create flashcards. A thoughtful space for learning.',
  keywords: ['study', 'AI', 'flashcards', 'education', 'learning', 'notes', 'PDF'],
  authors: [{ name: 'Studium' }],
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'Studium - Your Study Companion',
    description: 'Upload your study materials, chat about your notes, and create flashcards.',
    url: 'https://studium.tech',
    siteName: 'Studium',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Studium - Your Study Companion',
    description: 'A thoughtful space for learning.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sourceSans.variable} ${lexend.variable} font-sans antialiased`}>
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-lg bg-warm-900 px-4 py-3 font-semibold text-white shadow-xl transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
