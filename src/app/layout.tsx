import type { Metadata } from 'next';
import { Source_Serif_4, Inter } from 'next/font/google';
import './globals.css';

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const inter = Inter({
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
      <body className={`${inter.variable} ${sourceSerif.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
