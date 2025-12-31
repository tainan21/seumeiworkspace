/**
 * Tipos para sistema de temas
 * Preparado para integração futura com ThemeUI do schema
 */

export type ThemeMode = "light" | "dark" | "system";

export type ThemePreset = "default" | "brutalist" | "soft-pop" | "tangerine";

export interface ThemeColors {
  primary: string;
  secondary?: string;
  accent?: string;
  background?: string;
  foreground?: string;
  [key: string]: string | undefined;
}

export interface ThemeConfig {
  mode: ThemeMode;
  preset: ThemePreset;
  colors?: ThemeColors;
  custom?: Record<string, unknown>;
}
