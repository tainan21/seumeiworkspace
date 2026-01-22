# Component Domain Implementation Plan

## Comprehensive Modular Component Architecture for Next.js

---

## Executive Summary

This document outlines a detailed implementation plan for a modular component domain in Next.js, enabling dynamic selection of UI elements (Sidebar, TopBar, Dashboard layouts, Charts), customization of fonts and Tailwind CSS configurations, and a flexible configuration interface.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Type Definitions](#2-type-definitions)
3. [Component Composition Strategy](#3-component-composition-strategy)
4. [State Management](#4-state-management)
5. [Tailwind CSS Integration](#5-tailwind-css-integration)
6. [Configuration Interface](#6-configuration-interface)
7. [Implementation Phases](#7-implementation-phases)
8. [Future Extensibility](#8-future-extensibility)

---

## 1. Architecture Overview

### 1.1 Domain-Driven Structure

```
domains/
└── component/
    ├── component.types.ts      # Type definitions (EXISTING)
    ├── component.ts            # Pure logic functions (EXISTING)
    ├── component.registry.ts   # Component registration (NEW)
    ├── component.factory.ts    # Component instantiation (NEW)
    └── component.validators.ts # Validation logic (NEW)

components/
└── dashboard/
    ├── configurable-sidebar.tsx   # (EXISTING)
    ├── configurable-topbar.tsx    # (EXISTING)
    ├── configurable-chart.tsx     # (EXISTING)
    ├── configurable-layout.tsx    # (NEW)
    ├── widget-container.tsx       # (NEW)
    └── component-renderer.tsx     # (NEW)

lib/
├── stores/
│   └── component-config-store.ts  # Zustand store (NEW)
└── hooks/
    ├── use-component-config.ts    # Configuration hook (NEW)
    └── use-layout-composition.ts  # Composition hook (NEW)
```

### 1.2 Core Principles

| Principle | Description |
|-----------|-------------|
| **Separation of Concerns** | Domain logic separate from UI components |
| **Pure Functions** | All configuration operations are stateless |
| **Type Safety** | Full TypeScript coverage with strict types |
| **Composition over Inheritance** | Components composed via configuration |
| **Single Source of Truth** | Configuration stored in centralized store |

### 1.3 Data Flow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Configuration   │───▶│ Component        │───▶│ Rendered        │
│ State (Zustand) │    │ Factory          │    │ Components      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                      │                        │
        │                      ▼                        │
        │              ┌──────────────────┐             │
        │              │ Validation       │             │
        │              │ Layer            │             │
        │              └──────────────────┘             │
        │                      │                        │
        ▼                      ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Tailwind CSS Variables                       │
│              (--theme-*, --sidebar-*, --topbar-*)               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Type Definitions

### 2.1 Core Types (Existing - Enhanced)

```typescript
// domains/component/component.types.ts

// ============================================
// SIDEBAR CONFIGURATION
// ============================================
export type SidebarVariant = "standard" | "compact" | "mini" | "floating"
export type SidebarPosition = "left" | "right"
export type SidebarBehavior = "fixed" | "collapsible" | "auto-hide"

export interface SidebarConfig {
  variant: SidebarVariant
  position: SidebarPosition
  behavior: SidebarBehavior
  width: { expanded: number; collapsed: number }
  showLogo: boolean
  showSearch: boolean
  showUserProfile: boolean
  groupNavigation: boolean
  enableTooltips: boolean
  customCSS?: Record<string, string>
}

// ============================================
// TOPBAR CONFIGURATION
// ============================================
export type TopBarVariant = "barTop-A" | "barTop-B" | "barTop-C"
export type TopBarLayout = "centered" | "left-aligned" | "split" | "minimal"

export interface TopBarConfig {
  variant: TopBarVariant
  layout: TopBarLayout
  showSearch: boolean
  showNotifications: boolean
  showUserMenu: boolean
  showBreadcrumbs: boolean
  showQuickActions: boolean
  stickyOnScroll: boolean
  height: number
  customCSS?: Record<string, string>
}

// ============================================
// DASHBOARD LAYOUT
// ============================================
export type DashboardLayoutType = "grid" | "masonry" | "list" | "kanban" | "split"

export interface DashboardLayoutConfig {
  type: DashboardLayoutType
  columns: number
  gap: number
  padding: number
  widgets: WidgetConfig[]
  enableDragDrop: boolean
  enableResize: boolean
  responsiveBreakpoints: ResponsiveBreakpoints
}

// ============================================
// CHART TYPES
// ============================================
export type ChartType = "line" | "bar" | "area" | "pie" | "donut" | "scatter" | "radar" | "gauge"
export type ChartColorScheme = "default" | "brand" | "monochrome" | "divergent" | "sequential"

export interface ChartConfig {
  id: string
  type: ChartType
  title: string
  colorScheme: ChartColorScheme
  series: ChartDataSeries[]
  showLegend: boolean
  showTooltip: boolean
  showGrid: boolean
  animate: boolean
  responsive: boolean
}
```

### 2.2 New Types to Add

```typescript
// domains/component/component.types.ts (additions)

// ============================================
// FONT CONFIGURATION
// ============================================
export type FontFamily = "inter" | "geist" | "roboto" | "poppins" | "custom"
export type FontWeight = 300 | 400 | 500 | 600 | 700

export interface FontConfig {
  heading: {
    family: FontFamily
    weight: FontWeight
    letterSpacing: number
  }
  body: {
    family: FontFamily
    weight: FontWeight
    lineHeight: number
  }
  mono: {
    family: "geist-mono" | "fira-code" | "jetbrains-mono"
  }
  scale: {
    base: number // px
    ratio: number // modular scale ratio
  }
}

// ============================================
// TAILWIND CONFIGURATION
// ============================================
export interface TailwindOverrides {
  colors?: Record<string, string>
  spacing?: Record<string, string>
  borderRadius?: Record<string, string>
  shadows?: Record<string, string>
  animations?: Record<string, string>
}

// ============================================
// COMPONENT SLOT SYSTEM
// ============================================
export type SlotPosition = "header" | "sidebar" | "main" | "footer" | "modal"

export interface ComponentSlot {
  position: SlotPosition
  componentId: string
  config: Record<string, unknown>
  visible: boolean
  order: number
}

// ============================================
// LAYOUT COMPOSITION (Enhanced)
// ============================================
export interface LayoutComposition {
  id: string
  name: string
  description: string
  sidebar: SidebarConfig
  topbar: TopBarConfig
  dashboard: DashboardLayoutConfig
  theme: ThemeStyle
  colors: BrandColors
  fonts: FontConfig
  tailwind: TailwindOverrides
  slots: ComponentSlot[]
}
```

---

## 3. Component Composition Strategy

### 3.1 Component Registry Pattern

```typescript
// domains/component/component.registry.ts (NEW FILE)

export interface RegisteredComponent {
  id: string
  name: string
  category: ComponentCategory
  component: React.ComponentType<any>
  configSchema: z.ZodSchema
  defaultConfig: Record<string, unknown>
  variants: string[]
  slots: SlotPosition[]
}

class ComponentRegistry {
  private components: Map<string, RegisteredComponent> = new Map()

  register(component: RegisteredComponent): void {
    this.components.set(component.id, component)
  }

  get(id: string): RegisteredComponent | undefined {
    return this.components.get(id)
  }

  getByCategory(category: ComponentCategory): RegisteredComponent[] {
    return Array.from(this.components.values())
      .filter(c => c.category === category)
  }

  getForSlot(slot: SlotPosition): RegisteredComponent[] {
    return Array.from(this.components.values())
      .filter(c => c.slots.includes(slot))
  }
}

export const componentRegistry = new ComponentRegistry()
```

### 3.2 Component Factory Pattern

```typescript
// domains/component/component.factory.ts (NEW FILE)

export function createComponentInstance(
  componentId: string,
  config: Record<string, unknown>
): React.ReactElement | null {
  const registered = componentRegistry.get(componentId)
  if (!registered) return null

  // Validate config against schema
  const validatedConfig = registered.configSchema.safeParse(config)
  if (!validatedConfig.success) {
    console.error(`Invalid config for ${componentId}:`, validatedConfig.error)
    return null
  }

  const Component = registered.component
  return <Component {...validatedConfig.data} />
}

export function createLayoutFromComposition(
  composition: LayoutComposition
): React.ReactElement {
  return (
    <LayoutProvider composition={composition}>
      <div className="layout-root">
        {composition.slots.map(slot => (
          <SlotRenderer key={slot.position} slot={slot} />
        ))}
      </div>
    </LayoutProvider>
  )
}
```

### 3.3 Slot-Based Rendering

```typescript
// components/dashboard/component-renderer.tsx (NEW FILE)

interface SlotRendererProps {
  slot: ComponentSlot
}

export function SlotRenderer({ slot }: SlotRendererProps) {
  if (!slot.visible) return null

  const component = createComponentInstance(slot.componentId, slot.config)
  if (!component) return null

  return (
    <div 
      className={cn("slot", `slot-${slot.position}`)}
      style={{ order: slot.order }}
    >
      {component}
    </div>
  )
}
```

---

## 4. State Management

### 4.1 Zustand Store Structure

```typescript
// lib/stores/component-config-store.ts (NEW FILE)

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { LayoutComposition, SidebarConfig, TopBarConfig } from "@/domains/component/component.types"

interface ComponentConfigState {
  // Current configuration
  currentComposition: LayoutComposition
  
  // History for undo/redo
  history: LayoutComposition[]
  historyIndex: number
  
  // Dirty state
  isDirty: boolean
  lastSavedAt: string | null
  
  // Actions
  updateSidebar: (updates: Partial<SidebarConfig>) => void
  updateTopbar: (updates: Partial<TopBarConfig>) => void
  updateDashboard: (updates: Partial<DashboardLayoutConfig>) => void
  updateFonts: (updates: Partial<FontConfig>) => void
  updateTailwind: (updates: Partial<TailwindOverrides>) => void
  
  // Preset operations
  applyPreset: (presetId: string) => void
  saveAsPreset: (name: string) => void
  
  // History operations
  undo: () => void
  redo: () => void
  
  // Persistence
  save: () => Promise<void>
  reset: () => void
}

export const useComponentConfigStore = create<ComponentConfigState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentComposition: getDefaultComposition(),
      history: [],
      historyIndex: -1,
      isDirty: false,
      lastSavedAt: null,

      // Sidebar updates
      updateSidebar: (updates) => {
        const current = get().currentComposition
        const updated = updateSidebarInComposition(current, updates)
        set({ 
          currentComposition: updated, 
          isDirty: true,
          history: [...get().history.slice(0, get().historyIndex + 1), updated],
          historyIndex: get().historyIndex + 1
        })
      },

      // TopBar updates
      updateTopbar: (updates) => {
        const current = get().currentComposition
        const updated = updateTopbarInComposition(current, updates)
        set({ currentComposition: updated, isDirty: true })
      },

      // Apply preset
      applyPreset: (presetId) => {
        const preset = getPresetById(presetId)
        if (preset) {
          set({ 
            currentComposition: preset.composition,
            isDirty: true 
          })
        }
      },

      // Undo/Redo
      undo: () => {
        const { history, historyIndex } = get()
        if (historyIndex > 0) {
          set({
            currentComposition: history[historyIndex - 1],
            historyIndex: historyIndex - 1
          })
        }
      },

      redo: () => {
        const { history, historyIndex } = get()
        if (historyIndex < history.length - 1) {
          set({
            currentComposition: history[historyIndex + 1],
            historyIndex: historyIndex + 1
          })
        }
      },

      // Save to backend
      save: async () => {
        const composition = get().currentComposition
        await saveCompositionToBackend(composition)
        set({ isDirty: false, lastSavedAt: new Date().toISOString() })
      },

      reset: () => {
        set({ 
          currentComposition: getDefaultComposition(),
          isDirty: false 
        })
      }
    }),
    {
      name: "component-config",
      partialize: (state) => ({ 
        currentComposition: state.currentComposition 
      })
    }
  )
)
```

### 4.2 Configuration Hook

```typescript
// lib/hooks/use-component-config.ts (NEW FILE)

export function useComponentConfig() {
  const store = useComponentConfigStore()
  
  // Memoized selectors
  const sidebar = useMemo(() => store.currentComposition.sidebar, [store.currentComposition])
  const topbar = useMemo(() => store.currentComposition.topbar, [store.currentComposition])
  const dashboard = useMemo(() => store.currentComposition.dashboard, [store.currentComposition])
  
  // Derived state
  const canUndo = store.historyIndex > 0
  const canRedo = store.historyIndex < store.history.length - 1
  
  return {
    // Current config
    composition: store.currentComposition,
    sidebar,
    topbar,
    dashboard,
    
    // State
    isDirty: store.isDirty,
    canUndo,
    canRedo,
    
    // Actions
    updateSidebar: store.updateSidebar,
    updateTopbar: store.updateTopbar,
    updateDashboard: store.updateDashboard,
    applyPreset: store.applyPreset,
    undo: store.undo,
    redo: store.redo,
    save: store.save,
    reset: store.reset
  }
}
```

---

## 5. Tailwind CSS Integration

### 5.1 Dynamic CSS Variable Generation

```typescript
// lib/tailwind/generate-css-variables.ts (NEW FILE)

export function generateCSSVariables(composition: LayoutComposition): string {
  const { colors, fonts, tailwind, sidebar, topbar } = composition

  return `
    :root {
      /* Brand Colors */
      --theme-primary: ${colors.primary};
      --theme-accent: ${colors.accent};
      
      /* Sidebar */
      --sidebar-width-expanded: ${sidebar.width.expanded}px;
      --sidebar-width-collapsed: ${sidebar.width.collapsed}px;
      
      /* TopBar */
      --topbar-height: ${topbar.height}px;
      
      /* Fonts */
      --font-heading: ${fonts.heading.family};
      --font-body: ${fonts.body.family};
      --font-base-size: ${fonts.scale.base}px;
      
      /* Custom Tailwind Overrides */
      ${Object.entries(tailwind.colors || {})
        .map(([key, value]) => `--tw-${key}: ${value};`)
        .join('\n      ')}
    }
  `
}
```

### 5.2 Tailwind Config Extension

```typescript
// tailwind.config.ts (additions)

export default {
  theme: {
    extend: {
      colors: {
        theme: {
          primary: "var(--theme-primary)",
          accent: "var(--theme-accent)",
        }
      },
      spacing: {
        sidebar: "var(--sidebar-width-expanded)",
        "sidebar-collapsed": "var(--sidebar-width-collapsed)",
        topbar: "var(--topbar-height)"
      },
      fontFamily: {
        heading: "var(--font-heading)",
        body: "var(--font-body)"
      }
    }
  }
}
```

### 5.3 CSS Variable Provider

```typescript
// components/providers/css-variable-provider.tsx (NEW FILE)

export function CSSVariableProvider({ 
  children,
  composition 
}: { 
  children: React.ReactNode
  composition: LayoutComposition 
}) {
  const cssVariables = useMemo(() => 
    generateCSSVariables(composition), 
    [composition]
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
      {children}
    </>
  )
}
```

---

## 6. Configuration Interface

### 6.1 Page Structure

```
app/dashboard/settings/components/
├── page.tsx                    # Main configuration page
├── layout.tsx                  # Settings layout with tabs
├── components/
│   ├── sidebar-configurator.tsx
│   ├── topbar-configurator.tsx
│   ├── dashboard-configurator.tsx
│   ├── chart-configurator.tsx
│   ├── font-configurator.tsx
│   ├── preset-selector.tsx
│   └── live-preview.tsx
```

### 6.2 Configuration Page Layout

```typescript
// app/dashboard/settings/components/page.tsx

export default function ComponentConfigurationPage() {
  const { composition, isDirty, save, reset, undo, redo, canUndo, canRedo } = useComponentConfig()
  const [activeTab, setActiveTab] = useState("sidebar")

  return (
    <div className="flex h-full">
      {/* Configuration Panel */}
      <div className="w-1/2 overflow-auto border-r">
        <div className="sticky top-0 bg-background z-10 border-b p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Component Configuration</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={undo} disabled={!canUndo}>
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={redo} disabled={!canRedo}>
                <Redo2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={reset}>
                Reset
              </Button>
              <Button onClick={save} disabled={!isDirty}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start px-4 pt-4">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="sidebar">Sidebar</TabsTrigger>
            <TabsTrigger value="topbar">TopBar</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="fonts">Fonts</TabsTrigger>
          </TabsList>

          <div className="p-4">
            <TabsContent value="presets">
              <PresetSelector />
            </TabsContent>
            <TabsContent value="sidebar">
              <SidebarConfigurator />
            </TabsContent>
            <TabsContent value="topbar">
              <TopBarConfigurator />
            </TabsContent>
            <TabsContent value="dashboard">
              <DashboardConfigurator />
            </TabsContent>
            <TabsContent value="charts">
              <ChartConfigurator />
            </TabsContent>
            <TabsContent value="fonts">
              <FontConfigurator />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Live Preview Panel */}
      <div className="w-1/2 bg-muted/30">
        <LivePreview composition={composition} />
      </div>
    </div>
  )
}
```

### 6.3 Individual Configurators

```typescript
// components/settings/sidebar-configurator.tsx

export function SidebarConfigurator() {
  const { sidebar, updateSidebar } = useComponentConfig()

  return (
    <div className="space-y-6">
      {/* Variant Selection */}
      <div className="space-y-2">
        <Label>Variant</Label>
        <div className="grid grid-cols-2 gap-2">
          {SIDEBAR_VARIANTS.map(variant => (
            <Card 
              key={variant}
              className={cn(
                "cursor-pointer p-4 hover:border-primary",
                sidebar.variant === variant && "border-primary bg-primary/5"
              )}
              onClick={() => updateSidebar({ variant })}
            >
              <div className="text-sm font-medium">{variant}</div>
              <div className="text-xs text-muted-foreground">
                {getSidebarVariantDescription(variant)}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Width Configuration */}
      <div className="space-y-2">
        <Label>Width (Expanded)</Label>
        <Slider
          value={[sidebar.width.expanded]}
          min={180}
          max={320}
          step={8}
          onValueChange={([value]) => updateSidebar({ 
            width: { ...sidebar.width, expanded: value } 
          })}
        />
        <span className="text-sm text-muted-foreground">
          {sidebar.width.expanded}px
        </span>
      </div>

      {/* Feature Toggles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Show Logo</Label>
          <Switch
            checked={sidebar.showLogo}
            onCheckedChange={(showLogo) => updateSidebar({ showLogo })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>Show Search</Label>
          <Switch
            checked={sidebar.showSearch}
            onCheckedChange={(showSearch) => updateSidebar({ showSearch })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>Enable Tooltips</Label>
          <Switch
            checked={sidebar.enableTooltips}
            onCheckedChange={(enableTooltips) => updateSidebar({ enableTooltips })}
          />
        </div>
      </div>
    </div>
  )
}
```

---

## 7. Implementation Phases

### Phase 1: Foundation (Week 1-2)

| Task | Priority | Status |
|------|----------|--------|
| Enhance `component.types.ts` with FontConfig and TailwindOverrides | High | Pending |
| Create `component.registry.ts` | High | Pending |
| Create `component.factory.ts` | High | Pending |
| Create `component-config-store.ts` (Zustand) | High | Pending |
| Create `use-component-config.ts` hook | High | Pending |

### Phase 2: Core Components (Week 2-3)

| Task | Priority | Status |
|------|----------|--------|
| Enhance `configurable-sidebar.tsx` with slot support | High | Partial |
| Enhance `configurable-topbar.tsx` with slot support | High | Partial |
| Create `configurable-layout.tsx` | Medium | Pending |
| Create `component-renderer.tsx` | Medium | Pending |
| Create `widget-container.tsx` | Medium | Pending |

### Phase 3: Configuration UI (Week 3-4)

| Task | Priority | Status |
|------|----------|--------|
| Create `SidebarConfigurator` | High | Pending |
| Create `TopBarConfigurator` | High | Pending |
| Create `DashboardConfigurator` | Medium | Pending |
| Create `FontConfigurator` | Medium | Pending |
| Create `PresetSelector` | Medium | Pending |
| Create `LivePreview` component | High | Pending |

### Phase 4: Tailwind Integration (Week 4-5)

| Task | Priority | Status |
|------|----------|--------|
| Create CSS variable generator | High | Pending |
| Update `tailwind.config.ts` | High | Pending |
| Create `CSSVariableProvider` | High | Pending |
| Test responsive breakpoints | Medium | Pending |

### Phase 5: Persistence & Testing (Week 5-6)

| Task | Priority | Status |
|------|----------|--------|
| Create database schema for configurations | High | Pending |
| Create API routes for save/load | High | Pending |
| Add undo/redo functionality | Medium | Pending |
| Write unit tests for domain logic | Medium | Pending |
| Write integration tests for UI | Low | Pending |

---

## 8. Future Extensibility

### 8.1 Plugin System

```typescript
// Future: Plugin architecture for third-party components

interface ComponentPlugin {
  id: string
  name: string
  version: string
  components: RegisteredComponent[]
  presets?: LayoutPreset[]
  install: (registry: ComponentRegistry) => void
  uninstall: (registry: ComponentRegistry) => void
}

export function loadPlugin(plugin: ComponentPlugin): void {
  plugin.install(componentRegistry)
}
```

### 8.2 Theme Marketplace

```typescript
// Future: Theme sharing and marketplace

interface SharedTheme {
  id: string
  author: string
  composition: LayoutComposition
  downloads: number
  rating: number
  tags: string[]
}

async function importTheme(themeId: string): Promise<LayoutComposition> {
  const theme = await fetchThemeFromMarketplace(themeId)
  return theme.composition
}
```

### 8.3 AI-Assisted Configuration

```typescript
// Future: AI suggestions for layout optimization

interface AILayoutSuggestion {
  suggestion: string
  reasoning: string
  changes: Partial<LayoutComposition>
  confidence: number
}

async function getAILayoutSuggestions(
  currentComposition: LayoutComposition,
  userGoals: string[]
): Promise<AILayoutSuggestion[]> {
  // AI-powered layout recommendations
}
```

---

## Appendix A: File Checklist

### New Files to Create

- [ ] `domains/component/component.registry.ts`
- [ ] `domains/component/component.factory.ts`
- [ ] `domains/component/component.validators.ts`
- [ ] `lib/stores/component-config-store.ts`
- [ ] `lib/hooks/use-component-config.ts`
- [ ] `lib/hooks/use-layout-composition.ts`
- [ ] `lib/tailwind/generate-css-variables.ts`
- [ ] `components/providers/css-variable-provider.tsx`
- [ ] `components/dashboard/configurable-layout.tsx`
- [ ] `components/dashboard/widget-container.tsx`
- [ ] `components/dashboard/component-renderer.tsx`
- [ ] `components/settings/sidebar-configurator.tsx`
- [ ] `components/settings/topbar-configurator.tsx`
- [ ] `components/settings/dashboard-configurator.tsx`
- [ ] `components/settings/chart-configurator.tsx`
- [ ] `components/settings/font-configurator.tsx`
- [ ] `components/settings/preset-selector.tsx`
- [ ] `components/settings/live-preview.tsx`
- [ ] `scripts/007-component-config-ddl.sql`

### Files to Modify

- [ ] `domains/component/component.types.ts` - Add FontConfig, TailwindOverrides
- [ ] `domains/component/component.ts` - Add font/tailwind helpers
- [ ] `components/dashboard/configurable-sidebar.tsx` - Add slot support
- [ ] `components/dashboard/configurable-topbar.tsx` - Add slot support
- [ ] `app/globals.css` - Add CSS variable declarations
- [ ] `app/layout.tsx` - Add CSSVariableProvider

---

## Appendix B: Database Schema

```sql
-- scripts/007-component-config-ddl.sql

CREATE TABLE IF NOT EXISTS workspace_layout_compositions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  sidebar_config JSONB NOT NULL,
  topbar_config JSONB NOT NULL,
  dashboard_config JSONB NOT NULL,
  font_config JSONB,
  tailwind_overrides JSONB,
  slots JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(workspace_id, name)
);

CREATE INDEX idx_compositions_workspace ON workspace_layout_compositions(workspace_id);
CREATE INDEX idx_compositions_active ON workspace_layout_compositions(workspace_id, is_active) WHERE is_active = true;
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-20  
**Status:** Ready for Implementation Approval
