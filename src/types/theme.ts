/**
 * Sistema de Temas - Tipos Consolidados
 * Unifica types/preferences/theme.ts e types/theme/index.ts
 */

// ===== Theme Mode =====
export const THEME_MODE_OPTIONS = [
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
    { label: "System", value: "system" },
] as const;

export const THEME_MODE_VALUES = THEME_MODE_OPTIONS.map((m) => m.value);
export type ThemeMode = (typeof THEME_MODE_VALUES)[number];

// ===== Theme Presets =====
export const THEME_PRESET_OPTIONS = [
    {
        label: "Default",
        value: "default",
        primary: {
            light: "oklch(0.205 0 0)",
            dark: "oklch(0.922 0 0)",
        },
    },
    {
        label: "Brutalist",
        value: "brutalist",
        primary: {
            light: "oklch(0.6489 0.2370 26.9728)",
            dark: "oklch(0.7044 0.1872 23.1858)",
        },
    },
    {
        label: "Soft Pop",
        value: "soft-pop",
        primary: {
            light: "oklch(0.5106 0.2301 276.9656)",
            dark: "oklch(0.6801 0.1583 276.9349)",
        },
    },
    {
        label: "Tangerine",
        value: "tangerine",
        primary: {
            light: "oklch(0.64 0.17 36.44)",
            dark: "oklch(0.64 0.17 36.44)",
        },
    },
] as const;

export const THEME_PRESET_VALUES = THEME_PRESET_OPTIONS.map((p) => p.value);
export type ThemePreset = (typeof THEME_PRESET_OPTIONS)[number]["value"];

// ===== Theme Configuration =====
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

// ===== Helper Functions =====

/**
 * Busca preset de tema pelo valor
 */
export function getThemePresetByValue(value: ThemePreset) {
    return THEME_PRESET_OPTIONS.find((p) => p.value === value);
}

/**
 * Valida se é um modo de tema válido
 */
export function isValidThemeMode(value: string): value is ThemeMode {
    return THEME_MODE_VALUES.includes(value as ThemeMode);
}

/**
 * Valida se é um preset de tema válido
 */
export function isValidThemePreset(value: string): value is ThemePreset {
    return THEME_PRESET_VALUES.includes(value as ThemePreset);
}

/**
 * Gera CSS variables para o tema
 */
export function generateThemeVariables(config: ThemeConfig): string {
    const preset = getThemePresetByValue(config.preset);
    if (!preset) return "";

    const colors = config.mode === "dark" ? preset.primary.dark : preset.primary.light;

    const customColors = config.colors
        ? Object.entries(config.colors)
            .map(([key, value]) => `  --color-${key}: ${value};`)
            .join("\n")
        : "";

    return `  --color-primary: ${colors};${customColors ? "\n" + customColors : ""}`;
}

/**
 * Valida e normaliza configuração de tema
 */
export function validateThemeConfig(config: Partial<ThemeConfig>): ThemeConfig {
    return {
        mode: config.mode && isValidThemeMode(config.mode) ? config.mode : "light",
        preset: config.preset && isValidThemePreset(config.preset) ? config.preset : "default",
        colors: config.colors,
        custom: config.custom,
    };
}
