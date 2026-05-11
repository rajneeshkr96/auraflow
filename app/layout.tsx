import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/app/globals.css';
import { CSWProvider } from '@codeswayam/auth';
import { Analytics } from '@codeswayam/analytics';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Auraflow',
  description: 'Social Media Management SaaS',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <Analytics
          gtmId={process.env.NEXT_PUBLIC_GTM_ID}
          ga4Id={process.env.NEXT_PUBLIC_GA4_ID}
          metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID}
          appName="auraflow"
        />
        <CSWProvider apiUrl={process.env.NEXT_PUBLIC_API_URL} ssoUrl={process.env.NEXT_PUBLIC_APP_AUTH_URL}>
          {children}
        </CSWProvider>
      </body>
    </html>
  );
}