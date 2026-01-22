"use client";

import { useEffect } from "react";
import ThemeProvider from "~/components/shared/theme-provider";
import { PreferencesStoreProvider } from "~/stores/preferences/preferences-provider";
import { I18nProviderClient } from "~/locales/client";
import type { ThemeMode, ThemePreset } from "~/types/theme";

type Props = {
  children: React.ReactNode;
  locale: string;
  themeMode: ThemeMode;
  themePreset: ThemePreset;
};

export function AppProviders({
  children,
  locale,
  themeMode,
  themePreset,
}: Props) {
  // Aplica data-theme-preset no mount para evitar hydration mismatch
  useEffect(() => {
    document.documentElement.setAttribute("data-theme-preset", themePreset);
  }, [themePreset]);

  return (
    <ThemeProvider attribute="class" defaultTheme={themeMode} enableSystem>
      <PreferencesStoreProvider
        themeMode={themeMode}
        themePreset={themePreset}
      >
        <I18nProviderClient locale={locale}>
          {children}
        </I18nProviderClient>
      </PreferencesStoreProvider>
    </ThemeProvider>
  );
}
