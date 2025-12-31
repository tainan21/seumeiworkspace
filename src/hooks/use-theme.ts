"use client";

/**
 * Hook para gerenciar tema (preparado para integração futura)
 *
 * TODO: Integrar com preferences store quando schema estiver pronto
 */

// import { usePreferencesStore } from "~/stores/preferences/preferences-store";
import type { ThemeConfig } from "~/types/theme";

export function useTheme() {
  // TODO: Integrar com store quando estiver pronto
  // const { themeMode, themePreset, setThemeMode, setThemePreset } = usePreferencesStore();

  const setTheme = (config: Partial<ThemeConfig>) => {
    // TODO: Implementar quando store estiver integrado
    console.log("setTheme", config);
  };

  const theme: ThemeConfig = {
    mode: "light",
    preset: "default",
  };

  return {
    theme,
    setTheme,
    // TODO: Expor métodos individuais quando necessário
  };
}
