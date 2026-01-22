import type { ThemeStyle, BrandColors } from "@/types/workspace"

export interface ThemePreset {
  style: ThemeStyle
  name: string
  description: string
  colors: BrandColors
  preview: {
    background: string
    surface: string
    text: string
  }
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    style: "minimal",
    name: "Minimal",
    description: "Clean e moderno, foco no conteúdo",
    colors: { primary: "#18181B", accent: "#3B82F6" },
    preview: {
      background: "#FAFAFA",
      surface: "#FFFFFF",
      text: "#18181B",
    },
  },
  {
    style: "corporate",
    name: "Corporativo",
    description: "Profissional e confiável",
    colors: { primary: "#1E40AF", accent: "#059669" },
    preview: {
      background: "#F8FAFC",
      surface: "#FFFFFF",
      text: "#0F172A",
    },
  },
  {
    style: "playful",
    name: "Vibrante",
    description: "Colorido e energético",
    colors: { primary: "#EC4899", accent: "#F59E0B" },
    preview: {
      background: "#FFFBEB",
      surface: "#FFFFFF",
      text: "#1F2937",
    },
  },
]

export const COLOR_PALETTES: BrandColors[] = [
  { primary: "#18181B", accent: "#3B82F6" },
  { primary: "#1E40AF", accent: "#059669" },
  { primary: "#6366F1", accent: "#22D3EE" },
  { primary: "#EC4899", accent: "#F59E0B" },
  { primary: "#10B981", accent: "#8B5CF6" },
  { primary: "#DC2626", accent: "#FBBF24" },
  { primary: "#7C3AED", accent: "#14B8A6" },
  { primary: "#0891B2", accent: "#F97316" },
]

export const MOCK_COLOR_PALETTES = COLOR_PALETTES.map((palette, idx) => ({
  id: `palette-${idx}`,
  ...palette,
}))

export function getThemePreset(style: ThemeStyle): ThemePreset {
  return THEME_PRESETS.find((t) => t.style === style) || THEME_PRESETS[0]
}
