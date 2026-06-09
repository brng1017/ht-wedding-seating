import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import './globals.css';
import Navbar from '@/components/Navbar';
import { EB_Garamond } from 'next/font/google';
import {
  getUploadAccessFromCookieValue,
  UPLOAD_ACCESS_COOKIE_NAME,
} from '@/lib/upload-access';

const garamond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'HT 6/27/26',
  description: "Huy & Teresa's wedding",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const access = getUploadAccessFromCookieValue(
    cookieStore.get(UPLOAD_ACCESS_COOKIE_NAME)?.value,
  );

  return (
    <html lang='en'>
      <body
        suppressHydrationWarning
        className={`${garamond.variable} font-test antialiased h-dvh overflow-hidden`}
      >
        <div className='mx-auto max-w-xl flex flex-col h-full relative'>
          <div className='relative p-4 flex-1 min-h-0'>{children}</div>
          <Navbar hasUploadAccess={Boolean(access)} />
        </div>
      </body>
    </html>
  );
}
