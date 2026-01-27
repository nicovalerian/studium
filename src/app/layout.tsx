import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: {
    default: 'Studium - AI Study Buddy',
    template: '%s | Studium',
  },
  description:
    'Upload your study materials, chat with AI about your notes, and generate flashcards automatically. Your personal AI-powered study companion.',
  keywords: ['study', 'AI', 'flashcards', 'education', 'learning', 'notes', 'PDF'],
  authors: [{ name: 'Studium' }],
  openGraph: {
    title: 'Studium - AI Study Buddy',
    description:
      'Upload your study materials, chat with AI about your notes, and generate flashcards automatically.',
    url: 'https://studium.tech',
    siteName: 'Studium',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Studium - AI Study Buddy',
    description: 'Your personal AI-powered study companion.',
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
