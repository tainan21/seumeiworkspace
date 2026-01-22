export function updateThemeMode(value: "light" | "dark") {
  const doc = document.documentElement;
  doc.classList.add("disable-transitions");
  doc.classList.toggle("dark", value === "dark");
  requestAnimationFrame(() => {
    doc.classList.remove("disable-transitions");
  });
}

export function updateThemePreset(value: string) {
  document.documentElement.setAttribute("data-theme-preset", value);
}

/**
 * Aplica tema ao documento (client-side helper)
 * @param config - Configuração do tema
 */
export function applyThemeToDocument(config: {
  mode: "light" | "dark" | "system";
  preset: string;
  colors?: Record<string, string>;
}): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // Aplicar modo (light/dark)
  if (config.mode !== "system") {
    root.classList.toggle("dark", config.mode === "dark");
  }

  // Aplicar preset
  root.setAttribute("data-theme-preset", config.preset);

  // Aplicar CSS variables customizadas
  if (config.colors) {
    Object.entries(config.colors).forEach(([key, value]) => {
      if (value) {
        root.style.setProperty(`--color-${key}`, value);
      }
    });
  }
}
