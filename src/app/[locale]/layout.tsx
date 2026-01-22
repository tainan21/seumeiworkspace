import type { Metadata } from "next";
import { getPreference } from "~/lib/server/server-actions";
import {
  THEME_MODE_VALUES,
  THEME_PRESET_VALUES,
  type ThemePreset,
  type ThemeMode,
} from "~/types/theme";
import { Toaster } from "~/components/ui/sonner";
import { AnnouncementBanner } from "~/components/announcement-banner";
import Footer from "~/components/layout/footer";
import { siteConfig, siteUrl } from "~/config/site";
import { AppProviders } from "./app-providers";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  const locale = p.locale;
  const site = siteConfig(locale);

  const siteOgImage = `${siteUrl}/api/og?locale=${locale}`;

  return {
    title: {
      default: site.name,
      template: `%s - ${site.name}`,
    },
    description: site.description,
    keywords: [
      "Seumei",
      "sistemas para meis",
      "sistema para microempreendedores",
      "sistema para mei",
      "Vercelsistema para microempreendedores individuais",
      "sistemas para empresas",
      "sistemas para delivery",
      "sistemas para restaurantes",
      "sistemas para barbearias",
      "sistemas para cabeleireiros",
      "sistemas para manicure e pedicure",
      "sistemas para esteticas",
      "sistemas para tatuagens",
      "sistemas para massagens",
      "sistemas para saude",
      "sistemas para beleza",
      "sistemas para saude",
      "sistemas para Casa de material e construção",
    ],
    authors: [
      {
        name: "seumei",
        url: "https://seumei.com.br",
      },
    ],
    creator: "Seumei",
    openGraph: {
      type: "website",
      locale: locale,
      url: site.url,
      title: site.name,
      description: site.description,
      siteName: site.name,
      images: [
        {
          url: siteOgImage,
          width: 1200,
          height: 630,
          alt: site.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: site.name,
      description: site.description,
      images: [siteOgImage],
      creator: "@immoinulmoin",
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon-16x16.png",
      apple: "/apple-touch-icon.png",
    },
    manifest: `${siteUrl}/manifest.json`,
    metadataBase: new URL(site.url),
    alternates: {
      canonical: "/",
      languages: {
        pt: "/pt",
        en: "/en",
        fr: "/fr",
        es: "/es",
      },
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: site.name,
    },
  };
}

export const viewport = {
  width: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default async function LocaleLayout({
  children,
  loginDialog,
  params,
}: {
  children: React.ReactNode;
  loginDialog: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const themeMode = await getPreference<ThemeMode>(
    "theme_mode",
    THEME_MODE_VALUES,
    "light"
  );
  const themePreset = await getPreference<ThemePreset>(
    "theme_preset",
    THEME_PRESET_VALUES,
    "default"
  );

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.setAttribute('data-theme-preset', '${themePreset}');`,
        }}
      />
      <AppProviders
        locale={locale}
        themeMode={themeMode}
        themePreset={themePreset}
      >
        <AnnouncementBanner />
        <main>
          {children}
          {loginDialog}
        </main>
        <Toaster />
      </AppProviders>
    </>
  );
}
