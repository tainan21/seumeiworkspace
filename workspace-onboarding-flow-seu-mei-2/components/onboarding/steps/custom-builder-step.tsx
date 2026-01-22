"use client"

import React, { useState, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import {
  ArrowRight,
  ArrowLeft,
  Palette,
  PanelTop,
  Menu,
  LayoutGrid,
  Columns,
  Rows,
  Grid3X3,
  Layers,
  ChevronDown,
  ChevronUp,
  Settings2,
  Eye,
  PanelLeftClose,
  LayoutDashboard,
  GitBranch,
  Calendar,
  Table,
  List,
  LayoutList,
  PanelTopClose,
  Footprints,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react"
import { useOnboardingStore } from "@/lib/stores/onboarding-store"
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion"
import { ColorPicker } from "../primitives/color-picker"
import { TopBarSelector } from "../primitives/topbar-selector"
import { MenuBuilder } from "../primitives/menu-builder"
import { ThemeLivePreviewer } from "../primitives/theme-live-previewer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// Import domain
import {
  createLayoutConfig,
  applyPreset,
  SIDEBAR_VARIANT_OPTIONS,
  DASHBOARD_LAYOUT_OPTIONS,
  LAYOUT_PRESETS,
  DEFAULT_LAYOUT_CONFIG,
  getEffectiveSidebarWidth,
} from "@/domains/layout-builder/layout-builder"
import type {
  LayoutConfig,
  SidebarVariant,
  DashboardLayoutType,
  LayoutDensity,
  BorderStyle,
} from "@/domains/layout-builder/layout-builder.types"

// ============================================
// ICON MAP
// ============================================

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Columns,
  Rows,
  Menu,
  Layers,
  LayoutList,
  PanelTopClose,
  LayoutGrid,
  Grid3X3,
  List,
  PanelLeftClose,
  LayoutDashboard,
  GitBranch,
  Calendar,
  Table,
}

// ============================================
// COLOR PALETTE GENERATOR
// ============================================

const SUGGESTED_COLORS = {
  primary: [
    "#2563eb", // Blue
    "#7c3aed", // Violet
    "#059669", // Emerald
    "#dc2626", // Red
    "#ea580c", // Orange
    "#0891b2", // Cyan
    "#4f46e5", // Indigo
    "#be185d", // Pink
  ],
  accent: [
    "#f59e0b", // Amber
    "#10b981", // Emerald
    "#6366f1", // Indigo
    "#ec4899", // Pink
    "#14b8a6", // Teal
    "#f97316", // Orange
    "#8b5cf6", // Violet
    "#06b6d4", // Cyan
  ],
}

interface ColorSwatchProps {
  color: string
  isSelected: boolean
  onClick: () => void
  size?: "sm" | "md"
}

function ColorSwatch({ color, isSelected, onClick, size = "sm" }: ColorSwatchProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border-2 transition-all hover:scale-110",
        isSelected ? "border-foreground ring-2 ring-foreground/20" : "border-transparent",
        size === "sm" ? "w-6 h-6" : "w-8 h-8"
      )}
      style={{ backgroundColor: color }}
    />
  )
}

// ============================================
// ADVANCED COLOR PICKER
// ============================================

interface AdvancedColorPickerProps {
  label: string
  value: string
  onChange: (color: string) => void
  suggestions: string[]
}

function AdvancedColorPicker({ label, value, onChange, suggestions }: AdvancedColorPickerProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRandomize = () => {
    const randomColor = suggestions[Math.floor(Math.random() * suggestions.length)]
    onChange(randomColor)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRandomize}>
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Cor aleatoria</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{copied ? "Copiado!" : "Copiar HEX"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex gap-3 items-center">
        {/* Color Input */}
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-12 rounded-lg cursor-pointer border-2 border-border"
          />
        </div>

        {/* Hex Input */}
        <div className="flex-1">
          <Input
            value={value}
            onChange={(e) => {
              const val = e.target.value
              if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                onChange(val)
              }
            }}
            className="font-mono text-sm h-10"
            placeholder="#000000"
          />
        </div>

        {/* Preview */}
        <div
          className="w-12 h-12 rounded-lg border-2 border-border transition-colors duration-200"
          style={{ backgroundColor: value }}
        />
      </div>

      {/* Suggested Colors */}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((color) => (
          <ColorSwatch
            key={color}
            color={color}
            isSelected={value.toLowerCase() === color.toLowerCase()}
            onClick={() => onChange(color)}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================
// SIDEBAR VARIANT SELECTOR
// ============================================

interface SidebarVariantSelectorProps {
  selected: SidebarVariant
  onChange: (variant: SidebarVariant) => void
}

function SidebarVariantSelector({ selected, onChange }: SidebarVariantSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {SIDEBAR_VARIANT_OPTIONS.map((variant) => {
        const Icon = ICON_MAP[variant.icon] || Columns
        return (
          <button
            key={variant.id}
            type="button"
            onClick={() => onChange(variant.id)}
            className={cn(
              "flex flex-col items-start p-3 rounded-lg border-2 transition-all text-left",
              selected === variant.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon className="w-4 h-4" />
              <span className="font-medium text-sm">{variant.label}</span>
            </div>
            <span className="text-xs text-muted-foreground">{variant.description}</span>
          </button>
        )
      })}
    </div>
  )
}

// ============================================
// DASHBOARD LAYOUT SELECTOR
// ============================================

interface DashboardLayoutSelectorProps {
  selected: DashboardLayoutType
  onChange: (layout: DashboardLayoutType) => void
}

function DashboardLayoutSelector({ selected, onChange }: DashboardLayoutSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {DASHBOARD_LAYOUT_OPTIONS.map((layout) => {
        const Icon = ICON_MAP[layout.icon] || LayoutGrid
        return (
          <button
            key={layout.id}
            type="button"
            onClick={() => onChange(layout.id)}
            className={cn(
              "flex flex-col items-center p-3 rounded-lg border-2 transition-all text-center",
              selected === layout.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium text-xs mt-1">{layout.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// ============================================
// PRESET SELECTOR
// ============================================

interface PresetSelectorProps {
  onSelect: (presetId: string) => void
}

function PresetSelector({ onSelect }: PresetSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {LAYOUT_PRESETS.map((preset) => (
        <button
          key={preset.id}
          type="button"
          onClick={() => onSelect(preset.id)}
          className="flex flex-col items-start p-3 rounded-lg border-2 border-border hover:border-primary/50 transition-all text-left group"
        >
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="font-medium text-sm">{preset.name}</span>
          </div>
          <span className="text-xs text-muted-foreground mt-0.5">{preset.description}</span>
          <Badge variant="secondary" className="mt-2 text-xs">
            {preset.category}
          </Badge>
        </button>
      ))}
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export function CustomBuilderStep() {
  const reducedMotion = useReducedMotion()
  const [activeTab, setActiveTab] = useState("colors")
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(
    createLayoutConfig(DEFAULT_LAYOUT_CONFIG)
  )
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showPresets, setShowPresets] = useState(false)

  const {
    brandColors,
    setBrandColors,
    topBarVariant,
    setTopBarVariant,
    menuComponents,
    setMenuComponents,
    selectedFeatures,
    canProceed,
    nextStep,
    prevStep,
    markStepComplete,
  } = useOnboardingStore()

  const handleContinue = () => {
    if (canProceed(5)) {
      markStepComplete(5)
      nextStep()
    }
  }

  const updateLayoutConfig = useCallback((updates: Partial<LayoutConfig>) => {
    setLayoutConfig((prev) => ({
      ...prev,
      ...updates,
      sidebar: { ...prev.sidebar, ...(updates.sidebar || {}) },
      topBar: { ...prev.topBar, ...(updates.topBar || {}) },
      dashboard: { ...prev.dashboard, ...(updates.dashboard || {}) },
      footer: { ...prev.footer, ...(updates.footer || {}) },
      visualStyle: { ...prev.visualStyle, ...(updates.visualStyle || {}) },
    }))
  }, [])

  const handleApplyPreset = (presetId: string) => {
    const newConfig = applyPreset(layoutConfig, presetId)
    setLayoutConfig(newConfig)
    setShowPresets(false)
  }

  const handlePrimaryColorChange = useCallback((color: string) => {
    setBrandColors({ ...brandColors, primary: color })
  }, [brandColors, setBrandColors])

  const handleAccentColorChange = useCallback((color: string) => {
    setBrandColors({ ...brandColors, accent: color })
  }, [brandColors, setBrandColors])

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-7xl mx-auto px-4 sm:px-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Monte seu Sistema</h2>
        <p className="text-muted-foreground">
          Personalize cores, layout e componentes do seu workspace em tempo real
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left: Configuration Tabs */}
        <div className="space-y-4">
          {/* Presets Button */}
          <Collapsible open={showPresets} onOpenChange={setShowPresets}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between bg-transparent">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Aplicar um Preset
                </span>
                {showPresets ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <PresetSelector onSelect={handleApplyPreset} />
            </CollapsibleContent>
          </Collapsible>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="colors" className="gap-1.5">
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">Cores</span>
              </TabsTrigger>
              <TabsTrigger value="topbar" className="gap-1.5">
                <PanelTop className="w-4 h-4" />
                <span className="hidden sm:inline">TopBar</span>
              </TabsTrigger>
              <TabsTrigger value="sidebar" className="gap-1.5">
                <Menu className="w-4 h-4" />
                <span className="hidden sm:inline">Sidebar</span>
              </TabsTrigger>
              <TabsTrigger value="layout" className="gap-1.5">
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Layout</span>
              </TabsTrigger>
              <TabsTrigger value="footer" className="gap-1.5">
                <Footprints className="w-4 h-4" />
                <span className="hidden sm:inline">Footer</span>
              </TabsTrigger>
            </TabsList>

            <Card>
              <ScrollArea className="h-[420px]">
                <CardContent className="pt-6">
                  {/* COLORS TAB */}
                  <TabsContent value="colors" className="mt-0 space-y-6">
                    <AdvancedColorPicker
                      label="Cor Primaria"
                      value={brandColors.primary}
                      onChange={handlePrimaryColorChange}
                      suggestions={SUGGESTED_COLORS.primary}
                    />

                    <Separator />

                    <AdvancedColorPicker
                      label="Cor de Destaque"
                      value={brandColors.accent}
                      onChange={handleAccentColorChange}
                      suggestions={SUGGESTED_COLORS.accent}
                    />

                    <Separator />

                    {/* Combined Preview */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Preview Combinado</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div
                          className="rounded-lg p-4 transition-colors duration-200"
                          style={{ backgroundColor: brandColors.primary }}
                        >
                          <p
                            className="text-sm font-medium"
                            style={{ color: brandColors.accent }}
                          >
                            Texto Destaque
                          </p>
                          <p className="text-xs text-white/80 mt-1">
                            Sobre fundo primario
                          </p>
                        </div>
                        <div
                          className="rounded-lg p-4 transition-colors duration-200"
                          style={{ backgroundColor: brandColors.accent }}
                        >
                          <p
                            className="text-sm font-medium"
                            style={{ color: brandColors.primary }}
                          >
                            Texto Primario
                          </p>
                          <p className="text-xs text-white/80 mt-1">
                            Sobre fundo destaque
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* TOPBAR TAB */}
                  <TabsContent value="topbar" className="mt-0 space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-3 block">
                        Estilo da barra superior
                      </Label>
                      <TopBarSelector
                        selected={topBarVariant}
                        onChange={setTopBarVariant}
                        colors={brandColors}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-header" className="text-sm">
                          Mostrar cabecalho
                        </Label>
                        <Switch
                          id="show-header"
                          checked={layoutConfig.topBar.isVisible}
                          onCheckedChange={(checked) =>
                            updateLayoutConfig({
                              topBar: { ...layoutConfig.topBar, isVisible: checked },
                            })
                          }
                        />
                      </div>

                      {layoutConfig.topBar.isVisible && (
                        <>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Label className="text-sm">Altura do cabecalho</Label>
                              <span className="text-sm text-muted-foreground">
                                {layoutConfig.topBar.height}px
                              </span>
                            </div>
                            <Slider
                              value={[layoutConfig.topBar.height]}
                              min={40}
                              max={80}
                              step={4}
                              onValueChange={([value]) =>
                                updateLayoutConfig({
                                  topBar: { ...layoutConfig.topBar, height: value },
                                })
                              }
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Busca</Label>
                              <Switch
                                checked={layoutConfig.topBar.showSearch}
                                onCheckedChange={(checked) =>
                                  updateLayoutConfig({
                                    topBar: { ...layoutConfig.topBar, showSearch: checked },
                                  })
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Notificacoes</Label>
                              <Switch
                                checked={layoutConfig.topBar.showNotifications}
                                onCheckedChange={(checked) =>
                                  updateLayoutConfig({
                                    topBar: { ...layoutConfig.topBar, showNotifications: checked },
                                  })
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Breadcrumb</Label>
                              <Switch
                                checked={layoutConfig.topBar.showBreadcrumb}
                                onCheckedChange={(checked) =>
                                  updateLayoutConfig({
                                    topBar: { ...layoutConfig.topBar, showBreadcrumb: checked },
                                  })
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Sticky</Label>
                              <Switch
                                checked={layoutConfig.topBar.isSticky}
                                onCheckedChange={(checked) =>
                                  updateLayoutConfig({
                                    topBar: { ...layoutConfig.topBar, isSticky: checked },
                                  })
                                }
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </TabsContent>

                  {/* SIDEBAR TAB */}
                  <TabsContent value="sidebar" className="mt-0 space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Variante da Sidebar</Label>
                      <SidebarVariantSelector
                        selected={layoutConfig.sidebar.variant}
                        onChange={(variant) =>
                          updateLayoutConfig({
                            sidebar: { ...layoutConfig.sidebar, variant },
                          })
                        }
                      />
                    </div>

                    <Separator />

                    {layoutConfig.sidebar.variant !== "hidden" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="sidebar-collapsible" className="text-sm">
                            Sidebar colapsavel
                          </Label>
                          <Switch
                            id="sidebar-collapsible"
                            checked={layoutConfig.sidebar.isCollapsible}
                            onCheckedChange={(checked) =>
                              updateLayoutConfig({
                                sidebar: { ...layoutConfig.sidebar, isCollapsible: checked },
                              })
                            }
                          />
                        </div>

                        {(layoutConfig.sidebar.variant === "standard" ||
                          layoutConfig.sidebar.variant === "floating" ||
                          layoutConfig.sidebar.variant === "dual") && (
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Label className="text-sm">Largura da sidebar</Label>
                              <span className="text-sm text-muted-foreground">
                                {layoutConfig.sidebar.width}px
                              </span>
                            </div>
                            <Slider
                              value={[layoutConfig.sidebar.width]}
                              min={180}
                              max={320}
                              step={10}
                              onValueChange={([value]) =>
                                updateLayoutConfig({
                                  sidebar: { ...layoutConfig.sidebar, width: value },
                                })
                              }
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Header</Label>
                            <Switch
                              checked={layoutConfig.sidebar.showHeader}
                              onCheckedChange={(checked) =>
                                updateLayoutConfig({
                                  sidebar: { ...layoutConfig.sidebar, showHeader: checked },
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Footer</Label>
                            <Switch
                              checked={layoutConfig.sidebar.showFooter}
                              onCheckedChange={(checked) =>
                                updateLayoutConfig({
                                  sidebar: { ...layoutConfig.sidebar, showFooter: checked },
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <Separator />

                    <div>
                      <Label className="text-sm font-medium mb-3 block">Menu lateral</Label>
                      <MenuBuilder
                        items={menuComponents}
                        onChange={setMenuComponents}
                        enabledFeatures={selectedFeatures}
                      />
                    </div>
                  </TabsContent>

                  {/* LAYOUT TAB */}
                  <TabsContent value="layout" className="mt-0 space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Layout do Dashboard</Label>
                      <DashboardLayoutSelector
                        selected={layoutConfig.dashboard.layoutType}
                        onChange={(layout) =>
                          updateLayoutConfig({
                            dashboard: { ...layoutConfig.dashboard, layoutType: layout },
                          })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="text-sm">Colunas do grid</Label>
                          <span className="text-sm text-muted-foreground">
                            {layoutConfig.dashboard.columns}
                          </span>
                        </div>
                        <Slider
                          value={[layoutConfig.dashboard.columns]}
                          min={1}
                          max={24}
                          step={1}
                          onValueChange={([value]) =>
                            updateLayoutConfig({
                              dashboard: { ...layoutConfig.dashboard, columns: value },
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="text-sm">Espacamento (gap)</Label>
                          <span className="text-sm text-muted-foreground">
                            {layoutConfig.dashboard.gap}px
                          </span>
                        </div>
                        <Slider
                          value={[layoutConfig.dashboard.gap]}
                          min={0}
                          max={32}
                          step={4}
                          onValueChange={([value]) =>
                            updateLayoutConfig({
                              dashboard: { ...layoutConfig.dashboard, gap: value },
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="text-sm">Padding do conteudo</Label>
                          <span className="text-sm text-muted-foreground">
                            {layoutConfig.dashboard.padding}px
                          </span>
                        </div>
                        <Slider
                          value={[layoutConfig.dashboard.padding]}
                          min={0}
                          max={48}
                          step={4}
                          onValueChange={([value]) =>
                            updateLayoutConfig({
                              dashboard: { ...layoutConfig.dashboard, padding: value },
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Advanced Options */}
                    <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full justify-between">
                          <span className="flex items-center gap-2">
                            <Settings2 className="w-4 h-4" />
                            Opcoes avancadas
                          </span>
                          {showAdvanced ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Densidade</Label>
                            <Select
                              value={layoutConfig.visualStyle.density}
                              onValueChange={(value: LayoutDensity) =>
                                updateLayoutConfig({
                                  visualStyle: { ...layoutConfig.visualStyle, density: value },
                                })
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="compact">Compacto</SelectItem>
                                <SelectItem value="comfortable">Confortavel</SelectItem>
                                <SelectItem value="spacious">Espacoso</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Bordas</Label>
                            <Select
                              value={layoutConfig.visualStyle.borderStyle}
                              onValueChange={(value: BorderStyle) =>
                                updateLayoutConfig({
                                  visualStyle: { ...layoutConfig.visualStyle, borderStyle: value },
                                })
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sharp">Retas</SelectItem>
                                <SelectItem value="rounded">Arredondadas</SelectItem>
                                <SelectItem value="pill">Pilula</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </TabsContent>

                  {/* FOOTER TAB */}
                  <TabsContent value="footer" className="mt-0 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Mostrar Footer</Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Area inferior com informacoes adicionais
                        </p>
                      </div>
                      <Switch
                        checked={layoutConfig.footer.isVisible}
                        onCheckedChange={(checked) =>
                          updateLayoutConfig({
                            footer: { ...layoutConfig.footer, isVisible: checked },
                          })
                        }
                      />
                    </div>

                    {layoutConfig.footer.isVisible && (
                      <>
                        <Separator />

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Label className="text-sm">Altura do footer</Label>
                              <span className="text-sm text-muted-foreground">
                                {layoutConfig.footer.height}px
                              </span>
                            </div>
                            <Slider
                              value={[layoutConfig.footer.height]}
                              min={32}
                              max={80}
                              step={4}
                              onValueChange={([value]) =>
                                updateLayoutConfig({
                                  footer: { ...layoutConfig.footer, height: value },
                                })
                              }
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Fixo (sticky)</Label>
                              <Switch
                                checked={layoutConfig.footer.isSticky}
                                onCheckedChange={(checked) =>
                                  updateLayoutConfig({
                                    footer: { ...layoutConfig.footer, isSticky: checked },
                                  })
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Versao</Label>
                              <Switch
                                checked={layoutConfig.footer.showVersion}
                                onCheckedChange={(checked) =>
                                  updateLayoutConfig({
                                    footer: { ...layoutConfig.footer, showVersion: checked },
                                  })
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Copyright</Label>
                              <Switch
                                checked={layoutConfig.footer.showCopyright}
                                onCheckedChange={(checked) =>
                                  updateLayoutConfig({
                                    footer: { ...layoutConfig.footer, showCopyright: checked },
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </TabsContent>
                </CardContent>
              </ScrollArea>
            </Card>
          </Tabs>
        </div>

        {/* Right: Live Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview em Tempo Real
              </CardTitle>
              <CardDescription className="text-xs">
                As alteracoes sao refletidas instantaneamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeLivePreviewer
                brandColors={brandColors}
                layoutConfig={layoutConfig}
                topBarVariant={topBarVariant}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Configuracao atual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sidebar</span>
                  <Badge variant="secondary" className="capitalize">
                    {layoutConfig.sidebar.variant}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Layout</span>
                  <Badge variant="secondary" className="capitalize">
                    {layoutConfig.dashboard.layoutType}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TopBar</span>
                  <Badge variant="secondary">{topBarVariant}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Footer</span>
                  <Badge variant="secondary">
                    {layoutConfig.footer.isVisible ? "Visivel" : "Oculto"}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Menu items</span>
                  <Badge variant="secondary">{menuComponents.length}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Densidade</span>
                  <Badge variant="secondary" className="capitalize">
                    {layoutConfig.visualStyle.density}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        <Button variant="outline" onClick={prevStep} className="flex-1 bg-transparent">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button onClick={handleContinue} disabled={!canProceed(5)} className="flex-1">
          Continuar
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  )
}
