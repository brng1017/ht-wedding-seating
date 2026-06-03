import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import { EB_Garamond } from 'next/font/google';

const garamond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'HT 6/27/26',
  description: "Huy & Teresa's wedding",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        suppressHydrationWarning
        className={`${garamond.variable} font-test antialiased h-dvh overflow-hidden`}
      >
        <div className='mx-auto max-w-xl flex flex-col h-full relative'>
          <div className='relative p-4 flex-1 min-h-0'>{children}</div>
          <Navbar />
        </div>
      </body>
    </html>
  );
}
