import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Email SaaS - Send campaigns to your customers',
  description: 'Multi-tenant email marketing platform with templates and automation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
