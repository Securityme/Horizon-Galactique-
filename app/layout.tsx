import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Horizon Cosmique — L’Arche des Étoiles',
  description: 'Simulation 4X interstellaire combinée à un système roguelike narratif sur l’Arche des Étoiles.',
  openGraph: {
    title: 'Horizon Cosmique — L’Arche des Étoiles',
    description: 'Simulation 4X interstellaire combinée à un système roguelike narratif sur l’Arche des Étoiles.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Horizon Cosmique — L’Arche des Étoiles',
    description: 'Simulation 4X interstellaire combinée à un système roguelike narratif sur l’Arche des Étoiles.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
