import type React from "react";
import type { Metadata } from "next";

import "~/app/globals.css";

export const metadata: Metadata = {
  title: "Gerador de Link WhatsApp - wa.me com E.164 | Grátis",
  description:
    "Crie links WhatsApp profissionais com formatação E.164. Sanitização automática, QR code, histórico e preview em tempo real. 100% gratuito e client-side.",
  keywords: [
    "whatsapp",
    "wa.me",
    "gerador link",
    "E.164",
    "brasil",
    "telefone",
    "qr code",
  ],
  authors: [{ name: "WhatsApp Link Generator" }],
  creator: "WhatsApp Link Generator",
  publisher: "WhatsApp Link Generator",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://wa-link-generator.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Gerador de Link WhatsApp - wa.me com E.164",
    description:
      "Crie links WhatsApp profissionais com formatação E.164. Sanitização automática, QR code e preview em tempo real.",
    url: "https://wa-link-generator.vercel.app",
    siteName: "WhatsApp Link Generator",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Gerador de Link WhatsApp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gerador de Link WhatsApp - wa.me com E.164",
    description:
      "Crie links WhatsApp profissionais com formatação E.164. Grátis e client-side.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head></head>
      <body>{children}</body>
    </html>
  );
}
