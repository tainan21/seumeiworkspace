// ============================================
// STORE: Component Configuration
// Zustand store para gerenciamento de configuração de componentes
// ============================================

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type {
  SidebarConfig,
  TopBarConfig,
  DashboardLayoutConfig,
  LayoutPreset,
  FontConfig,
  TailwindOverrides,
  EnhancedLayoutComposition,
  LayoutSlots,
} from "@/domains/component/component.types"
import {
  FONT_PRESETS,
  DEFAULT_TAILWIND_OVERRIDES,
  DEFAULT_LAYOUT_SLOTS as PRESET_DEFAULT_LAYOUT_SLOTS,
} from "@/domains/component/component.types"
import {
  createSidebarConfig,
  createTopBarConfig,
  createDashboardLayout,
  LAYOUT_PRESETS,
  validateLayoutComposition,
} from "@/domains/component/component"
import type { ThemeStyle, BrandColors } from "@/types/workspace"

// ============================================
// STORE STATE TYPES
// ============================================

interface HistoryEntry {
  composition: EnhancedLayoutComposition
  timestamp: Date
  action: string
}

interface ComponentConfigState {
  // Current configuration
  composition: EnhancedLayoutComposition
  
  // Presets
  presets: LayoutPreset[]
  activePresetId: string | null
  
  // History for undo/redo
  history: HistoryEntry[]
  historyIndex: number
  maxHistorySize: number
  
  // State flags
  isDirty: boolean
  lastSavedAt: Date | null
  isLoading: boolean
  errors: string[]
  
  // Preview mode
  previewMode: boolean
  previewComposition: EnhancedLayoutComposition | null
}

interface ComponentConfigActions {
  // Sidebar actions
  updateSidebar: (updates: Partial<SidebarConfig>) => void
  setSidebarVariant: (variant: SidebarConfig["variant"]) => void
  toggleSidebarVisibility: () => void
  
  // TopBar actions
  updateTopbar: (updates: Partial<TopBarConfig>) => void
  setTopbarVariant: (variant: TopBarConfig["variant"]) => void
  
  // Dashboard actions
  updateDashboard: (updates: Partial<DashboardLayoutConfig>) => void
  setDashboardLayout: (type: DashboardLayoutConfig["type"]) => void
  
  // Font actions
  updateFonts: (fonts: Partial<FontConfig>) => void
  applyFontPreset: (presetName: string) => void
  
  // Tailwind actions
  updateTailwind: (overrides: Partial<TailwindOverrides>) => void
  updatePrimaryColor: (color: Partial<TailwindOverrides["colors"]["primary"]>) => void
  
  // Slots actions
  updateSlots: (slots: Partial<LayoutSlots>) => void
  toggleSlotVisibility: (slotName: keyof LayoutSlots) => void
  
  // Theme actions
  setTheme: (theme: ThemeStyle) => void
  setColors: (colors: BrandColors) => void
  
  // Preset actions
  applyPreset: (presetId: string) => void
  saveAsPreset: (name: string, description: string) => void
  deletePreset: (presetId: string) => void
  
  // History actions
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  clearHistory: () => void
  
  // Persistence actions
  save: () => Promise<void>
  reset: () => void
  load: (composition: EnhancedLayoutComposition) => void
  
  // Preview actions
  enterPreviewMode: () => void
  exitPreviewMode: () => void
  applyPreviewChanges: () => void
  
  // Validation
  validate: () => { valid: boolean; errors: string[] }
  
  // Utilities
  generateCSSVariables: () => Record<string, string>
  exportConfig: () => string
  importConfig: (json: string) => boolean
}

type ComponentConfigStore = ComponentConfigState & ComponentConfigActions

// ============================================
// DEFAULT COMPOSITION
// ============================================

const createDefaultComposition = (): EnhancedLayoutComposition => ({
  id: "default-composition",
  name: "Default Layout",
  description: "Configuração padrão do sistema",
  sidebar: createSidebarConfig("standard"),
  topbar: createTopBarConfig("barTop-A"),
  dashboard: createDashboardLayout("grid"),
  theme: "minimal" as ThemeStyle,
  colors: { primary: "#3B82F6", accent: "#10B981" },
  fonts: FONT_PRESETS.minimal,
  tailwind: DEFAULT_TAILWIND_OVERRIDES,
  slots: PRESET_DEFAULT_LAYOUT_SLOTS,
})

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useComponentConfigStore = create<ComponentConfigStore>()(
  persist(
    (set, get) => ({
      // Initial state
      composition: createDefaultComposition(),
      presets: LAYOUT_PRESETS,
      activePresetId: null,
      history: [],
      historyIndex: -1,
      maxHistorySize: 50,
      isDirty: false,
      lastSavedAt: null,
      isLoading: false,
      errors: [],
      previewMode: false,
      previewComposition: null,

      // ============================================
      // HISTORY MANAGEMENT
      // ============================================
      
      _pushToHistory: (action: string) => {
        const state = get()
        const newEntry: HistoryEntry = {
          composition: JSON.parse(JSON.stringify(state.composition)),
          timestamp: new Date(),
          action,
        }
        
        // Remove future history if we're not at the end
        const newHistory = state.history.slice(0, state.historyIndex + 1)
        newHistory.push(newEntry)
        
        // Limit history size
        if (newHistory.length > state.maxHistorySize) {
          newHistory.shift()
        }
        
        set({
          history: newHistory,
          historyIndex: newHistory.length - 1,
          isDirty: true,
        })
      },

      // ============================================
      // SIDEBAR ACTIONS
      // ============================================
      
      updateSidebar: (updates) => {
        const state = get()
        ;(state as any)._pushToHistory("updateSidebar")
        set({
          composition: {
            ...state.composition,
            sidebar: { ...state.composition.sidebar, ...updates },
          },
          activePresetId: null,
        })
      },

      setSidebarVariant: (variant) => {
        const state = get()
        ;(state as any)._pushToHistory("setSidebarVariant")
        set({
          composition: {
            ...state.composition,
            sidebar: createSidebarConfig(variant, state.composition.sidebar),
          },
          activePresetId: null,
        })
      },

      toggleSidebarVisibility: () => {
        const state = get()
        ;(state as any)._pushToHistory("toggleSidebarVisibility")
        set({
          composition: {
            ...state.composition,
            slots: {
              ...state.composition.slots,
              sidebar: {
                ...state.composition.slots.sidebar!,
                visible: !state.composition.slots.sidebar?.visible,
              },
            },
          },
        })
      },

      // ============================================
      // TOPBAR ACTIONS
      // ============================================
      
      updateTopbar: (updates) => {
        const state = get()
        ;(state as any)._pushToHistory("updateTopbar")
        set({
          composition: {
            ...state.composition,
            topbar: { ...state.composition.topbar, ...updates },
          },
          activePresetId: null,
        })
      },

      setTopbarVariant: (variant) => {
        const state = get()
        ;(state as any)._pushToHistory("setTopbarVariant")
        set({
          composition: {
            ...state.composition,
            topbar: createTopBarConfig(variant, state.composition.topbar),
          },
          activePresetId: null,
        })
      },

      // ============================================
      // DASHBOARD ACTIONS
      // ============================================
      
      updateDashboard: (updates) => {
        const state = get()
        ;(state as any)._pushToHistory("updateDashboard")
        set({
          composition: {
            ...state.composition,
            dashboard: { ...state.composition.dashboard, ...updates },
          },
          activePresetId: null,
        })
      },

      setDashboardLayout: (type) => {
        const state = get()
        ;(state as any)._pushToHistory("setDashboardLayout")
        set({
          composition: {
            ...state.composition,
            dashboard: createDashboardLayout(type, state.composition.dashboard),
          },
          activePresetId: null,
        })
      },

      // ============================================
      // FONT ACTIONS
      // ============================================
      
      updateFonts: (fonts) => {
        const state = get()
        ;(state as any)._pushToHistory("updateFonts")
        set({
          composition: {
            ...state.composition,
            fonts: { ...state.composition.fonts, ...fonts },
          },
        })
      },

      applyFontPreset: (presetName) => {
        const preset = FONT_PRESETS[presetName]
        if (preset) {
          const state = get()
          ;(state as any)._pushToHistory("applyFontPreset")
          set({
            composition: {
              ...state.composition,
              fonts: preset,
            },
          })
        }
      },

      // ============================================
      // TAILWIND ACTIONS
      // ============================================
      
      updateTailwind: (overrides) => {
        const state = get()
        ;(state as any)._pushToHistory("updateTailwind")
        set({
          composition: {
            ...state.composition,
            tailwind: {
              ...state.composition.tailwind,
              ...overrides,
              colors: {
                ...state.composition.tailwind.colors,
                ...overrides.colors,
              },
            },
          },
        })
      },

      updatePrimaryColor: (color) => {
        const state = get()
        ;(state as any)._pushToHistory("updatePrimaryColor")
        set({
          composition: {
            ...state.composition,
            tailwind: {
              ...state.composition.tailwind,
              colors: {
                ...state.composition.tailwind.colors,
                primary: {
                  ...state.composition.tailwind.colors.primary,
                  ...color,
                },
              },
            },
          },
        })
      },

      // ============================================
      // SLOTS ACTIONS
      // ============================================
      
      updateSlots: (slots) => {
        const state = get()
        ;(state as any)._pushToHistory("updateSlots")
        set({
          composition: {
            ...state.composition,
            slots: { ...state.composition.slots, ...slots },
          },
        })
      },

      toggleSlotVisibility: (slotName) => {
        const state = get()
        const slot = state.composition.slots[slotName]
        if (slot) {
          ;(state as any)._pushToHistory("toggleSlotVisibility")
          set({
            composition: {
              ...state.composition,
              slots: {
                ...state.composition.slots,
                [slotName]: { ...slot, visible: !slot.visible },
              },
            },
          })
        }
      },

      // ============================================
      // THEME ACTIONS
      // ============================================
      
      setTheme: (theme) => {
        const state = get()
        ;(state as any)._pushToHistory("setTheme")
        set({
          composition: {
            ...state.composition,
            theme,
          },
        })
      },

      setColors: (colors) => {
        const state = get()
        ;(state as any)._pushToHistory("setColors")
        set({
          composition: {
            ...state.composition,
            colors,
          },
        })
      },

      // ============================================
      // PRESET ACTIONS
      // ============================================
      
      applyPreset: (presetId) => {
        const preset = get().presets.find((p) => p.id === presetId)
        if (preset) {
          const state = get()
          ;(state as any)._pushToHistory("applyPreset")
          set({
            composition: {
              ...state.composition,
              ...preset.composition,
              id: state.composition.id,
              fonts: state.composition.fonts,
              tailwind: state.composition.tailwind,
              slots: state.composition.slots,
            },
            activePresetId: presetId,
          })
        }
      },

      saveAsPreset: (name, description) => {
        const state = get()
        const newPreset: LayoutPreset = {
          id: `custom-${Date.now()}`,
          name,
          description,
          composition: {
            ...state.composition,
            id: `preset-composition-${Date.now()}`,
            name,
            description,
          },
          targetUseCases: ["custom"],
        }
        set({
          presets: [...state.presets, newPreset],
        })
      },

      deletePreset: (presetId) => {
        const state = get()
        // Don't delete built-in presets
        if (presetId.startsWith("preset-")) return
        set({
          presets: state.presets.filter((p) => p.id !== presetId),
          activePresetId: state.activePresetId === presetId ? null : state.activePresetId,
        })
      },

      // ============================================
      // HISTORY ACTIONS
      // ============================================
      
      undo: () => {
        const state = get()
        if (state.historyIndex > 0) {
          const newIndex = state.historyIndex - 1
          set({
            composition: JSON.parse(JSON.stringify(state.history[newIndex].composition)),
            historyIndex: newIndex,
            isDirty: true,
          })
        }
      },

      redo: () => {
        const state = get()
        if (state.historyIndex < state.history.length - 1) {
          const newIndex = state.historyIndex + 1
          set({
            composition: JSON.parse(JSON.stringify(state.history[newIndex].composition)),
            historyIndex: newIndex,
            isDirty: true,
          })
        }
      },

      canUndo: () => {
        return get().historyIndex > 0
      },

      canRedo: () => {
        const state = get()
        return state.historyIndex < state.history.length - 1
      },

      clearHistory: () => {
        set({
          history: [],
          historyIndex: -1,
        })
      },

      // ============================================
      // PERSISTENCE ACTIONS
      // ============================================
      
      save: async () => {
        set({ isLoading: true })
        try {
          // In a real app, this would save to the server
          await new Promise((resolve) => setTimeout(resolve, 500))
          set({
            isDirty: false,
            lastSavedAt: new Date(),
            isLoading: false,
          })
        } catch {
          set({
            isLoading: false,
            errors: ["Falha ao salvar configuração"],
          })
        }
      },

      reset: () => {
        const defaultComposition = createDefaultComposition()
        set({
          composition: defaultComposition,
          activePresetId: null,
          isDirty: false,
          history: [],
          historyIndex: -1,
        })
      },

      load: (composition) => {
        set({
          composition,
          isDirty: false,
          history: [],
          historyIndex: -1,
        })
      },

      // ============================================
      // PREVIEW ACTIONS
      // ============================================
      
      enterPreviewMode: () => {
        const state = get()
        set({
          previewMode: true,
          previewComposition: JSON.parse(JSON.stringify(state.composition)),
        })
      },

      exitPreviewMode: () => {
        const state = get()
        if (state.previewComposition) {
          set({
            composition: state.previewComposition,
            previewMode: false,
            previewComposition: null,
          })
        }
      },

      applyPreviewChanges: () => {
        set({
          previewMode: false,
          previewComposition: null,
          isDirty: true,
        })
      },

      // ============================================
      // VALIDATION
      // ============================================
      
      validate: () => {
        const state = get()
        const result = validateLayoutComposition(state.composition)
        const errors = result.errors.map((e) => `${e.path}: ${e.message}`)
        set({ errors })
        return { valid: result.valid, errors }
      },

      // ============================================
      // UTILITIES
      // ============================================
      
      generateCSSVariables: () => {
        const state = get()
        const { tailwind, fonts } = state.composition
        const vars: Record<string, string> = {}

        // Primary colors
        Object.entries(tailwind.colors.primary).forEach(([shade, color]) => {
          vars[`--color-primary-${shade}`] = color
        })

        // Secondary colors
        Object.entries(tailwind.colors.secondary).forEach(([shade, color]) => {
          vars[`--color-secondary-${shade}`] = color
        })

        // Accent colors
        Object.entries(tailwind.colors.accent).forEach(([shade, color]) => {
          vars[`--color-accent-${shade}`] = color
        })

        // Border radius
        Object.entries(tailwind.borderRadius).forEach(([size, value]) => {
          vars[`--radius-${size}`] = value
        })

        // Shadows
        Object.entries(tailwind.shadows).forEach(([size, value]) => {
          vars[`--shadow-${size}`] = value
        })

        // Fonts
        vars["--font-heading"] = `'${fonts.heading.family}', ${fonts.heading.fallback.join(", ")}`
        vars["--font-body"] = `'${fonts.body.family}', ${fonts.body.fallback.join(", ")}`
        vars["--font-mono"] = `'${fonts.mono.family}', ${fonts.mono.fallback.join(", ")}`

        // Font sizes
        Object.entries(fonts.scale).forEach(([size, value]) => {
          vars[`--text-${size}`] = value
        })

        return vars
      },

      exportConfig: () => {
        const state = get()
        return JSON.stringify(state.composition, null, 2)
      },

      importConfig: (json) => {
        try {
          const composition = JSON.parse(json) as EnhancedLayoutComposition
          const state = get()
          ;(state as any)._pushToHistory("importConfig")
          set({
            composition,
            isDirty: true,
          })
          return true
        } catch {
          set({ errors: ["Configuração JSON inválida"] })
          return false
        }
      },
    }),
    {
      name: "component-config-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        composition: state.composition,
        presets: state.presets.filter((p) => p.id.startsWith("custom-")),
        lastSavedAt: state.lastSavedAt,
      }),
    },
  ),
)

// ============================================
// SELECTOR HOOKS
// ============================================

export const useSidebarConfig = () =>
  useComponentConfigStore((state) => state.composition.sidebar)

export const useTopbarConfig = () =>
  useComponentConfigStore((state) => state.composition.topbar)

export const useDashboardConfig = () =>
  useComponentConfigStore((state) => state.composition.dashboard)

export const useFontsConfig = () =>
  useComponentConfigStore((state) => state.composition.fonts)

export const useTailwindConfig = () =>
  useComponentConfigStore((state) => state.composition.tailwind)

export const useSlotsConfig = () =>
  useComponentConfigStore((state) => state.composition.slots)

export const useThemeConfig = () =>
  useComponentConfigStore((state) => ({
    theme: state.composition.theme,
    colors: state.composition.colors,
  }))

export const useConfigHistory = () =>
  useComponentConfigStore((state) => ({
    canUndo: state.historyIndex > 0,
    canRedo: state.historyIndex < state.history.length - 1,
    historyLength: state.history.length,
    currentIndex: state.historyIndex,
  }))

export const useConfigStatus = () =>
  useComponentConfigStore((state) => ({
    isDirty: state.isDirty,
    isLoading: state.isLoading,
    errors: state.errors,
    lastSavedAt: state.lastSavedAt,
  }))

export const useColorsConfig = () =>
  useComponentConfigStore((state) => state.composition.colors)

export const useLayoutPresets = () =>
  useComponentConfigStore((state) => ({
    presets: state.presets,
    activePresetId: state.activePresetId,
  }))
