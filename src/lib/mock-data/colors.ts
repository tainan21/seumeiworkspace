import type { BrandColors } from "~/types/workspace-onboarding";

export interface ColorPalette {
  name: string;
  primary: string;
  accent: string;
  description: string;
}

export const MOCK_COLOR_PALETTES: ColorPalette[] = [
  {
    name: "Azul Profissional",
    primary: "#1E40AF",
    accent: "#3B82F6",
    description: "Clássico e confiável",
  },
  {
    name: "Roxo Moderno",
    primary: "#6366F1",
    accent: "#22D3EE",
    description: "Inovador e tech",
  },
  {
    name: "Verde Natural",
    primary: "#10B981",
    accent: "#8B5CF6",
    description: "Fresco e sustentável",
  },
  {
    name: "Rosa Vibrante",
    primary: "#EC4899",
    accent: "#F59E0B",
    description: "Criativo e energético",
  },
  {
    name: "Laranja Quente",
    primary: "#F97316",
    accent: "#FBBF24",
    description: "Dinâmico e acolhedor",
  },
  {
    name: "Preto Minimal",
    primary: "#18181B",
    accent: "#3B82F6",
    description: "Elegante e minimalista",
  },
  {
    name: "Azul Oceano",
    primary: "#0EA5E9",
    accent: "#06B6D4",
    description: "Calmo e profissional",
  },
  {
    name: "Roxo Profundo",
    primary: "#7C3AED",
    accent: "#A78BFA",
    description: "Premium e sofisticado",
  },
];

export const DEFAULT_BRAND_COLORS: BrandColors = {
  primary: "#18181B",
  accent: "#3B82F6",
};
