import './globals.css';
import type { Metadata } from 'next';

const APP_URL = "https://builderscore.vercel.app";

// Define the Embed JSON structure once
const embedMetadata = JSON.stringify({
  version: "next",
  imageUrl: `${APP_URL}/hero.png`,
  button: {
    title: "Check Score",
    action: {
      type: "launch_frame",
      name: "Base Builder Score",
      url: APP_URL,
      splashImageUrl: `${APP_URL}/splash.png`,
      splashBackgroundColor: "#1e293b",
    },
  },
});

export const metadata: Metadata = {
  title: 'Base Builder Score',
  description: 'Check your onchain reputation on Base',
  openGraph: {
    title: 'Base Builder Score',
    description: 'Check your onchain reputation on Base',
    url: APP_URL,
    siteName: 'Base Builder Score',
    images: [
      {
        url: `${APP_URL}/hero.png`,
        width: 1200,
        height: 800,
        alt: 'Base Builder Score Hero Image',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  // Custom tags for Farcaster Mini Apps
  other: {
    "fc:miniapp": embedMetadata,
    "fc:frame": embedMetadata, // For backward compatibility
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}