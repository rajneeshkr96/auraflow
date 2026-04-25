import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
// Adjust path if needed
import '@/app/globals.css';
import { CSWProvider } from '@codeswayam/auth';

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
        <CSWProvider apiUrl={process.env.NEXT_PUBLIC_CORE_API_URL}>
          {children}
        </CSWProvider>
      </body>
    </html>
  );
}