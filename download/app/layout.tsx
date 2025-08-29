import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import { AuthProvider } from '@/contexts/auth-context';
import { AppBackground } from '@/components/app-background';
import { PT_Sans } from 'next/font/google';

const ptSans = PT_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

export const metadata: Metadata = {
  title: 'Speakids',
  description: 'Learn English in a fun way!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ptSans.variable}`}>
      <body className="font-body antialiased" suppressHydrationWarning>
        <AuthProvider>
          <AppBackground>
            <div className="min-h-screen flex flex-col relative z-10">
              <Header />
              <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8">
                {children}
              </main>
            </div>
          </AppBackground>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
