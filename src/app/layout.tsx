import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { cn } from "~/lib/utils";
import { I18nProviderWrapper } from "~/components/providers/i18n-provider-wrapper";
import GTag from "~/app/[locale]/_components/Body/GTag";
import "./globals.css";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontHeading = localFont({
  src: "../assets/fonts/CalSans-SemiBold.woff2",
  variable: "--font-heading",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen font-sans antialiased",
          fontSans.variable,
          fontHeading.variable
        )}
      >
        <GTag />
        <I18nProviderWrapper locale="pt">
          {children}
        </I18nProviderWrapper>
      </body>
    </html>
  );
}
