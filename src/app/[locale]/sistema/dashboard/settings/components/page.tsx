"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Slider } from "~/components/ui/slider"
import { Badge } from "~/components/ui/badge"
import { Separator } from "~/components/ui/separator"
import { PanelLeft, PanelTop, LayoutGrid, BarChart3, Eye, Save, RotateCcw, Palette, Check } from "lucide-react"
import type { WorkspaceLayoutContract } from "~/types/workspace"
import { useWorkspaceLayout } from "~/lib/hooks/use-workspace-layout"
import type {
  SidebarConfig,
  SidebarVariant,
  TopBarConfig,
  DashboardLayoutConfig,
  DashboardLayoutType,
  ChartConfig,
  ChartType,
  LayoutPreset,
} from "~/domains/component/component.types"
import {
  createSidebarConfig,
  createTopBarConfig,
  createDashboardLayout,
  createChartConfig,
  getSidebarVariantDescription,
  getTopBarVariantDescription,
  getDashboardLayoutDescription,
  getChartTypeDescription,
  LAYOUT_PRESETS,
} from "~/domains/component/component"
import { ConfigurableSidebar } from "~/components/dashboard/configurable-sidebar"
import { ConfigurableTopBar } from "~/components/dashboard/configurable-topbar"
import { ConfigurableChart } from "~/components/dashboard/configurable-chart"

// Sample chart data for preview
const SAMPLE_CHART_DATA = [
  { name: "Jan", vendas: 4000, custos: 2400, lucro: 1600 },
  { name: "Fev", vendas: 3000, custos: 1398, lucro: 1602 },
  { name: "Mar", vendas: 2000, custos: 980, lucro: 1020 },
  { name: "Abr", vendas: 2780, custos: 908, lucro: 1872 },
  { name: "Mai", vendas: 1890, custos: 800, lucro: 1090 },
  { name: "Jun", vendas: 2390, custos: 800, lucro: 1590 },
]

const SAMPLE_PIE_DATA = [
  { name: "Produto A", value: 400 },
  { name: "Produto B", value: 300 },
  { name: "Produto C", value: 200 },
  { name: "Produto D", value: 100 },
]

export default function ComponentSettingsPage() {
  const router = useRouter()
  const { workspace, theme, colors } = useWorkspaceLayout()
  const [activeTab, setActiveTab] = useState("sidebar")
  const [isDirty, setIsDirty] = useState(false)

  // Component configurations
  const [sidebarConfig, setSidebarConfig] = useState<SidebarConfig>(createSidebarConfig("standard"))
  const [topbarConfig, setTopbarConfig] = useState<TopBarConfig>(createTopBarConfig("barTop-A"))
  const [dashboardConfig, setDashboardConfig] = useState<DashboardLayoutConfig>(createDashboardLayout("grid"))
  const [chartConfig, setChartConfig] = useState<ChartConfig>(
    createChartConfig("preview-chart", "Vendas vs Custos", "bar", [
      { id: "vendas", name: "Vendas", dataKey: "vendas" },
      { id: "custos", name: "Custos", dataKey: "custos" },
    ]),
  )

  // Preview states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  useEffect(() => {
    if (!workspace) {
      router.push("/sistema/onboarding")
      return
    }
    // Initialize configs from workspace if available
    setTopbarConfig(createTopBarConfig(workspace.topBarVariant))
  }, [workspace, router])

  const handleApplyPreset = (preset: LayoutPreset) => {
    setSidebarConfig(preset.composition.sidebar)
    setTopbarConfig(preset.composition.topbar)
    setDashboardConfig(preset.composition.dashboard)
    setSelectedPreset(preset.id)
    setIsDirty(true)
  }

  const handleSave = () => {
    if (!workspace) return

    // Ler workspace completo do localStorage para preservar campos de domínio
    const stored = localStorage.getItem("seumei-workspace")
    if (stored) {
      try {
        const fullWorkspace = JSON.parse(stored)
        const updatedWorkspace = {
          ...fullWorkspace,
          topBarVariant: topbarConfig.variant,
          updatedAt: new Date().toISOString(),
        }
        localStorage.setItem("seumei-workspace", JSON.stringify(updatedWorkspace))
        setIsDirty(false)
        // Recarregar página para atualizar provider
        window.location.reload()
      } catch {
        // Ignore
      }
    }
  }

  const handleReset = () => {
    if (!workspace) return
    setSidebarConfig(createSidebarConfig("standard"))
    setTopbarConfig(createTopBarConfig(workspace.topBarVariant))
    setDashboardConfig(createDashboardLayout("grid"))
    setChartConfig(
      createChartConfig("preview-chart", "Vendas vs Custos", "bar", [
        { id: "vendas", name: "Vendas", dataKey: "vendas" },
        { id: "custos", name: "Custos", dataKey: "custos" },
      ]),
    )
    setSelectedPreset(null)
    setIsDirty(false)
  }

  if (!workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configuração de Componentes</h1>
          <p className="text-muted-foreground">Personalize a aparência e comportamento dos componentes do dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset} disabled={!isDirty}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Resetar
          </Button>
          <Button onClick={handleSave} disabled={!isDirty}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Presets de Layout
          </CardTitle>
          <CardDescription>Escolha um preset para aplicar configurações pré-definidas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {LAYOUT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className={cn(
                  "relative p-4 rounded-lg border-2 transition-all text-left",
                  selectedPreset === preset.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50",
                )}
              >
                {selectedPreset === preset.id && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                )}
                <h3 className="font-medium">{preset.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{preset.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {preset.targetUseCases.slice(0, 2).map((useCase) => (
                    <Badge key={useCase} variant="secondary" className="text-xs">
                      {useCase}
                    </Badge>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="sidebar" className="gap-2">
            <PanelLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Sidebar</span>
          </TabsTrigger>
          <TabsTrigger value="topbar" className="gap-2">
            <PanelTop className="w-4 h-4" />
            <span className="hidden sm:inline">TopBar</span>
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="gap-2">
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="charts" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Gráficos</span>
          </TabsTrigger>
        </TabsList>

        {/* Sidebar Configuration */}
        <TabsContent value="sidebar" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações da Sidebar</CardTitle>
                <CardDescription>Ajuste o comportamento e aparência da barra lateral</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Variant */}
                <div className="space-y-2">
                  <Label>Variante</Label>
                  <Select
                    value={sidebarConfig.variant}
                    onValueChange={(value: SidebarVariant) => {
                      setSidebarConfig(createSidebarConfig(value, sidebarConfig))
                      setIsDirty(true)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["standard", "compact", "mini", "floating"] as SidebarVariant[]).map((variant) => (
                        <SelectItem key={variant} value={variant}>
                          <div>
                            <span className="font-medium capitalize">{variant}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {getSidebarVariantDescription(variant)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <Label>Posição</Label>
                  <Select
                    value={sidebarConfig.position}
                    onValueChange={(value: "left" | "right") => {
                      setSidebarConfig({ ...sidebarConfig, position: value })
                      setIsDirty(true)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Esquerda</SelectItem>
                      <SelectItem value="right">Direita</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Behavior */}
                <div className="space-y-2">
                  <Label>Comportamento</Label>
                  <Select
                    value={sidebarConfig.behavior}
                    onValueChange={(value: "fixed" | "collapsible" | "auto-hide") => {
                      setSidebarConfig({ ...sidebarConfig, behavior: value })
                      setIsDirty(true)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixa</SelectItem>
                      <SelectItem value="collapsible">Colapsável</SelectItem>
                      <SelectItem value="auto-hide">Auto-ocultar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Toggles */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-logo">Mostrar Logo</Label>
                    <Switch
                      id="show-logo"
                      checked={sidebarConfig.showLogo}
                      onCheckedChange={(checked) => {
                        setSidebarConfig({ ...sidebarConfig, showLogo: checked })
                        setIsDirty(true)
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-search">Mostrar Busca</Label>
                    <Switch
                      id="show-search"
                      checked={sidebarConfig.showSearch}
                      onCheckedChange={(checked) => {
                        setSidebarConfig({ ...sidebarConfig, showSearch: checked })
                        setIsDirty(true)
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-profile">Mostrar Perfil</Label>
                    <Switch
                      id="show-profile"
                      checked={sidebarConfig.showUserProfile}
                      onCheckedChange={(checked) => {
                        setSidebarConfig({ ...sidebarConfig, showUserProfile: checked })
                        setIsDirty(true)
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enable-tooltips">Habilitar Tooltips</Label>
                    <Switch
                      id="enable-tooltips"
                      checked={sidebarConfig.enableTooltips}
                      onCheckedChange={(checked) => {
                        setSidebarConfig({ ...sidebarConfig, enableTooltips: checked })
                        setIsDirty(true)
                      }}
                    />
                  </div>
                </div>

                {/* Width */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Largura Expandida: {sidebarConfig.width.expanded}px</Label>
                    <Slider
                      value={[sidebarConfig.width.expanded]}
                      min={180}
                      max={320}
                      step={10}
                      onValueChange={([value]) => {
                        setSidebarConfig({
                          ...sidebarConfig,
                          width: { ...sidebarConfig.width, expanded: value },
                        })
                        setIsDirty(true)
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Largura Colapsada: {sidebarConfig.width.collapsed}px</Label>
                    <Slider
                      value={[sidebarConfig.width.collapsed]}
                      min={48}
                      max={96}
                      step={8}
                      onValueChange={([value]) => {
                        setSidebarConfig({
                          ...sidebarConfig,
                          width: { ...sidebarConfig.width, collapsed: value },
                        })
                        setIsDirty(true)
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden h-[400px] relative bg-muted/30">
                  <ConfigurableSidebar
                    config={sidebarConfig}
                    menuItems={workspace.menuItems}
                    colors={colors}
                    theme={workspace.theme}
                    logo={workspace.brand.logo}
                    workspaceName={workspace.name}
                    isCollapsed={sidebarCollapsed}
                    onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="absolute inset-y-0 left-0"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TopBar Configuration */}
        <TabsContent value="topbar" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações da TopBar</CardTitle>
                <CardDescription>Ajuste os elementos e layout da barra superior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Variant */}
                <div className="space-y-2">
                  <Label>Variante</Label>
                  <Select
                    value={topbarConfig.variant}
                    onValueChange={(value: "barTop-A" | "barTop-B" | "barTop-C") => {
                      setTopbarConfig(createTopBarConfig(value, topbarConfig))
                      setIsDirty(true)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["barTop-A", "barTop-B", "barTop-C"] as const).map((variant) => (
                        <SelectItem key={variant} value={variant}>
                          <div>
                            <span className="font-medium">{variant}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {getTopBarVariantDescription(variant)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Layout */}
                <div className="space-y-2">
                  <Label>Layout</Label>
                  <Select
                    value={topbarConfig.layout}
                    onValueChange={(value: "centered" | "left-aligned" | "split" | "minimal") => {
                      setTopbarConfig({ ...topbarConfig, layout: value })
                      setIsDirty(true)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="split">Dividido</SelectItem>
                      <SelectItem value="centered">Centralizado</SelectItem>
                      <SelectItem value="left-aligned">Alinhado à Esquerda</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Height */}
                <div className="space-y-2">
                  <Label>Altura: {topbarConfig.height}px</Label>
                  <Slider
                    value={[topbarConfig.height]}
                    min={48}
                    max={80}
                    step={4}
                    onValueChange={([value]) => {
                      setTopbarConfig({ ...topbarConfig, height: value })
                      setIsDirty(true)
                    }}
                  />
                </div>

                <Separator />

                {/* Toggles */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-topbar-search">Mostrar Busca</Label>
                    <Switch
                      id="show-topbar-search"
                      checked={topbarConfig.showSearch}
                      onCheckedChange={(checked) => {
                        setTopbarConfig({ ...topbarConfig, showSearch: checked })
                        setIsDirty(true)
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-notifications">Mostrar Notificações</Label>
                    <Switch
                      id="show-notifications"
                      checked={topbarConfig.showNotifications}
                      onCheckedChange={(checked) => {
                        setTopbarConfig({ ...topbarConfig, showNotifications: checked })
                        setIsDirty(true)
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-user-menu">Mostrar Menu do Usuário</Label>
                    <Switch
                      id="show-user-menu"
                      checked={topbarConfig.showUserMenu}
                      onCheckedChange={(checked) => {
                        setTopbarConfig({ ...topbarConfig, showUserMenu: checked })
                        setIsDirty(true)
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-breadcrumbs">Mostrar Breadcrumbs</Label>
                    <Switch
                      id="show-breadcrumbs"
                      checked={topbarConfig.showBreadcrumbs}
                      onCheckedChange={(checked) => {
                        setTopbarConfig({ ...topbarConfig, showBreadcrumbs: checked })
                        setIsDirty(true)
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-quick-actions">Mostrar Ações Rápidas</Label>
                    <Switch
                      id="show-quick-actions"
                      checked={topbarConfig.showQuickActions}
                      onCheckedChange={(checked) => {
                        setTopbarConfig({ ...topbarConfig, showQuickActions: checked })
                        setIsDirty(true)
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sticky-on-scroll">Fixar ao Rolar</Label>
                    <Switch
                      id="sticky-on-scroll"
                      checked={topbarConfig.stickyOnScroll}
                      onCheckedChange={(checked) => {
                        setTopbarConfig({ ...topbarConfig, stickyOnScroll: checked })
                        setIsDirty(true)
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden bg-muted/30">
                  <ConfigurableTopBar
                    config={topbarConfig}
                    colors={colors}
                    theme={workspace.theme}
                    workspaceName={workspace.name}
                    onToggleSidebar={() => {}}
                    onLogout={() => {}}
                  />
                  <div className="h-32 flex items-center justify-center text-muted-foreground">Conteúdo da página</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Dashboard Configuration */}
        <TabsContent value="dashboard" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Dashboard</CardTitle>
                <CardDescription>Defina o layout e organização do dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Layout Type */}
                <div className="space-y-2">
                  <Label>Tipo de Layout</Label>
                  <Select
                    value={dashboardConfig.type}
                    onValueChange={(value: DashboardLayoutType) => {
                      setDashboardConfig(createDashboardLayout(value, dashboardConfig))
                      setIsDirty(true)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["grid", "masonry", "list", "kanban", "split"] as DashboardLayoutType[]).map((type) => (
                        <SelectItem key={type} value={type}>
                          <div>
                            <span className="font-medium capitalize">{type}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {getDashboardLayoutDescription(type)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Columns */}
                <div className="space-y-2">
                  <Label>Colunas: {dashboardConfig.columns}</Label>
                  <Slider
                    value={[dashboardConfig.columns]}
                    min={1}
                    max={12}
                    step={1}
                    onValueChange={([value]) => {
                      setDashboardConfig({ ...dashboardConfig, columns: value })
                      setIsDirty(true)
                    }}
                  />
                </div>

                {/* Gap */}
                <div className="space-y-2">
                  <Label>Espaçamento: {dashboardConfig.gap}px</Label>
                  <Slider
                    value={[dashboardConfig.gap]}
                    min={8}
                    max={32}
                    step={4}
                    onValueChange={([value]) => {
                      setDashboardConfig({ ...dashboardConfig, gap: value })
                      setIsDirty(true)
                    }}
                  />
                </div>

                {/* Padding */}
                <div className="space-y-2">
                  <Label>Padding: {dashboardConfig.padding}px</Label>
                  <Slider
                    value={[dashboardConfig.padding]}
                    min={16}
                    max={48}
                    step={4}
                    onValueChange={([value]) => {
                      setDashboardConfig({ ...dashboardConfig, padding: value })
                      setIsDirty(true)
                    }}
                  />
                </div>

                <Separator />

                {/* Toggles */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enable-drag-drop">Habilitar Drag & Drop</Label>
                    <Switch
                      id="enable-drag-drop"
                      checked={dashboardConfig.enableDragDrop}
                      onCheckedChange={(checked) => {
                        setDashboardConfig({ ...dashboardConfig, enableDragDrop: checked })
                        setIsDirty(true)
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enable-resize">Habilitar Redimensionamento</Label>
                    <Switch
                      id="enable-resize"
                      checked={dashboardConfig.enableResize}
                      onCheckedChange={(checked) => {
                        setDashboardConfig({ ...dashboardConfig, enableResize: checked })
                        setIsDirty(true)
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Preview do Layout
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="border rounded-lg bg-muted/30 min-h-[300px]"
                  style={{ padding: dashboardConfig.padding }}
                >
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: `repeat(${Math.min(dashboardConfig.columns, 4)}, 1fr)`,
                      gap: dashboardConfig.gap,
                    }}
                  >
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "bg-background border rounded-lg p-4 flex items-center justify-center text-muted-foreground text-sm",
                          i === 0 && "col-span-2 row-span-2",
                          i === 3 && "col-span-2",
                        )}
                        style={{
                          gridColumn: i === 0 ? "span 2" : i === 3 ? "span 2" : "span 1",
                          gridRow: i === 0 ? "span 2" : "span 1",
                        }}
                      >
                        Widget {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Charts Configuration */}
        <TabsContent value="charts" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Gráficos</CardTitle>
                <CardDescription>Personalize os gráficos do dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Chart Type */}
                <div className="space-y-2">
                  <Label>Tipo de Gráfico</Label>
                  <Select
                    value={chartConfig.type}
                    onValueChange={(value: ChartType) => {
                      setChartConfig({ ...chartConfig, type: value })
                      setIsDirty(true)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["line", "bar", "area", "pie", "donut"] as ChartType[]).map((type) => (
                        <SelectItem key={type} value={type}>
                          <div>
                            <span className="font-medium capitalize">{type}</span>
                            <span className="text-xs text-muted-foreground ml-2">{getChartTypeDescription(type)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Color Scheme */}
                <div className="space-y-2">
                  <Label>Esquema de Cores</Label>
                  <Select
                    value={chartConfig.colorScheme}
                    onValueChange={(value: "default" | "brand" | "monochrome" | "divergent" | "sequential") => {
                      setChartConfig({ ...chartConfig, colorScheme: value })
                      setIsDirty(true)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brand">Cores da Marca</SelectItem>
                      <SelectItem value="default">Padrão</SelectItem>
                      <SelectItem value="monochrome">Monocromático</SelectItem>
                      <SelectItem value="divergent">Divergente</SelectItem>
                      <SelectItem value="sequential">Sequencial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Toggles */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-legend">Mostrar Legenda</Label>
                    <Switch
                      id="show-legend"
                      checked={chartConfig.showLegend}
                      onCheckedChange={(checked) => {
                        setChartConfig({ ...chartConfig, showLegend: checked })
                        setIsDirty(true)
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-tooltip">Mostrar Tooltip</Label>
                    <Switch
                      id="show-tooltip"
                      checked={chartConfig.showTooltip}
                      onCheckedChange={(checked) => {
                        setChartConfig({ ...chartConfig, showTooltip: checked })
                        setIsDirty(true)
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-grid">Mostrar Grid</Label>
                    <Switch
                      id="show-grid"
                      checked={chartConfig.showGrid}
                      onCheckedChange={(checked) => {
                        setChartConfig({ ...chartConfig, showGrid: checked })
                        setIsDirty(true)
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="animate-chart">Animar</Label>
                    <Switch
                      id="animate-chart"
                      checked={chartConfig.animate}
                      onCheckedChange={(checked) => {
                        setChartConfig({ ...chartConfig, animate: checked })
                        setIsDirty(true)
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Preview do Gráfico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ConfigurableChart
                  config={chartConfig}
                  data={
                    chartConfig.type === "pie" || chartConfig.type === "donut" ? SAMPLE_PIE_DATA : SAMPLE_CHART_DATA
                  }
                  colors={colors}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
