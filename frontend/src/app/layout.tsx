import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agri-Control',
  description: 'Plateforme de pilotage agricole',
  manifest: '/manifest.json'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}