"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeLivePreviewer } from "@/components/onboarding/primitives/theme-live-previewer"
import { useComponentConfigStore } from "@/lib/stores/component-config-store"
import {
  Palette,
  Layout,
  Sidebar as SidebarIcon,
  Menu,
  Save,
  RotateCcw,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  Zap,
  Sparkles,
  Monitor,
  Tablet,
  Smartphone,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function LayoutBuilderPage() {
  const [activeTab, setActiveTab] = useState("colors")
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop")

  const {
    composition,
    updateColors,
    updateTopbar,
    updateSidebar,
    updateDashboard,
    saveConfiguration,
    resetConfiguration,
    isDirty,
    isLoading,
    lastSavedAt,
  } = useComponentConfigStore()

  const handleSave = async () => {
    await saveConfiguration()
  }

  const handleReset = () => {
    if (confirm("Deseja resetar todas as configurações?")) {
      resetConfiguration()
    }
  }

  const handleExport = () => {
    const config = JSON.stringify(composition, null, 2)
    const blob = new Blob([config], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `layout-config-${Date.now()}.json`
    a.click()
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar de Configuração */}
      <div className="w-[420px] border-r flex flex-col bg-muted/20">
        {/* Header */}
        <div className="p-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Layout Builder</h1>
                <p className="text-sm text-muted-foreground">Configure seu workspace visualmente</p>
              </div>
              <Badge variant={isDirty ? "default" : "secondary"} className="gap-1.5">
                {isDirty ? (
                  <>
                    <AlertCircle className="w-3 h-3" />
                    Modificado
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    Salvo
                  </>
                )}
              </Badge>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!isDirty || isLoading} className="flex-1 gap-2">
                <Save className="w-4 h-4" />
                Salvar Mudanças
              </Button>
              <Button variant="outline" size="icon" onClick={handleReset} disabled={isLoading} title="Resetar">
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleExport} title="Exportar">
                <Download className="w-4 h-4" />
              </Button>
            </div>

            {lastSavedAt && (
              <p className="text-xs text-muted-foreground text-center">
                Última modificação: {new Date(lastSavedAt).toLocaleString("pt-BR")}
              </p>
            )}
          </div>
        </div>

        {/* Tabs de Configuração */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b px-6 h-auto py-0 bg-transparent">
            <TabsTrigger value="colors" className="gap-2 data-[state=active]:bg-muted rounded-t-lg">
              <Palette className="w-4 h-4" />
              Cores
            </TabsTrigger>
            <TabsTrigger value="layout" className="gap-2 data-[state=active]:bg-muted rounded-t-lg">
              <Layout className="w-4 h-4" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="topbar" className="gap-2 data-[state=active]:bg-muted rounded-t-lg">
              <Menu className="w-4 h-4" />
              TopBar
            </TabsTrigger>
            <TabsTrigger value="sidebar" className="gap-2 data-[state=active]:bg-muted rounded-t-lg">
              <SidebarIcon className="w-4 h-4" />
              Sidebar
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {/* Colors Tab */}
              <TabsContent value="colors" className="mt-0 space-y-6">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Paleta de Cores
                    </CardTitle>
                    <CardDescription>Configure as cores principais do tema</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Primary Color */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Cor Primária</Label>
                      <div className="flex gap-3">
                        <div className="relative">
                          <Input
                            type="color"
                            value={composition.colors.primary}
                            onChange={(e) => updateColors({ primary: e.target.value })}
                            className="w-16 h-11 p-1 cursor-pointer border-2"
                          />
                        </div>
                        <Input
                          value={composition.colors.primary}
                          onChange={(e) => updateColors({ primary: e.target.value })}
                          className="flex-1 font-mono text-sm h-11"
                          placeholder="#000000"
                        />
                      </div>
                    </div>

                    {/* Background Color */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Cor de Fundo</Label>
                      <div className="flex gap-3">
                        <Input
                          type="color"
                          value={composition.colors.background}
                          onChange={(e) => updateColors({ background: e.target.value })}
                          className="w-16 h-11 p-1 cursor-pointer border-2"
                        />
                        <Input
                          value={composition.colors.background}
                          onChange={(e) => updateColors({ background: e.target.value })}
                          className="flex-1 font-mono text-sm h-11"
                        />
                      </div>
                    </div>

                    {/* Foreground Color */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Cor de Texto</Label>
                      <div className="flex gap-3">
                        <Input
                          type="color"
                          value={composition.colors.foreground}
                          onChange={(e) => updateColors({ foreground: e.target.value })}
                          className="w-16 h-11 p-1 cursor-pointer border-2"
                        />
                        <Input
                          value={composition.colors.foreground}
                          onChange={(e) => updateColors({ foreground: e.target.value })}
                          className="flex-1 font-mono text-sm h-11"
                        />
                      </div>
                    </div>

                    {/* Accent Color */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Cor de Acento</Label>
                      <div className="flex gap-3">
                        <Input
                          type="color"
                          value={composition.colors.accent}
                          onChange={(e) => updateColors({ accent: e.target.value })}
                          className="w-16 h-11 p-1 cursor-pointer border-2"
                        />
                        <Input
                          value={composition.colors.accent}
                          onChange={(e) => updateColors({ accent: e.target.value })}
                          className="flex-1 font-mono text-sm h-11"
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Dark Mode Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <Label className="text-sm font-medium">Modo Escuro</Label>
                        <p className="text-xs text-muted-foreground">Ativar tema escuro</p>
                      </div>
                      <Switch
                        checked={composition.colors.mode === "dark"}
                        onCheckedChange={(checked) =>
                          updateColors({ mode: checked ? "dark" : "light" })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed">
                  <CardHeader>
                    <CardTitle className="text-base">Paletas Predefinidas</CardTitle>
                    <CardDescription>Aplique uma paleta rapidamente</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="h-auto flex-col gap-2 p-4 bg-transparent"
                        onClick={() =>
                          updateColors({
                            primary: "#6366f1",
                            accent: "#8b5cf6",
                            background: "#ffffff",
                            foreground: "#0f172a",
                          })
                        }
                      >
                        <div className="flex gap-1 w-full">
                          <div className="h-6 flex-1 rounded" style={{ backgroundColor: "#6366f1" }} />
                          <div className="h-6 flex-1 rounded" style={{ backgroundColor: "#8b5cf6" }} />
                        </div>
                        <span className="text-xs font-medium">Moderno</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto flex-col gap-2 p-4 bg-transparent"
                        onClick={() =>
                          updateColors({
                            primary: "#0ea5e9",
                            accent: "#06b6d4",
                            background: "#f8fafc",
                            foreground: "#0f172a",
                          })
                        }
                      >
                        <div className="flex gap-1 w-full">
                          <div className="h-6 flex-1 rounded" style={{ backgroundColor: "#0ea5e9" }} />
                          <div className="h-6 flex-1 rounded" style={{ backgroundColor: "#06b6d4" }} />
                        </div>
                        <span className="text-xs font-medium">Corporativo</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto flex-col gap-2 p-4 bg-transparent"
                        onClick={() =>
                          updateColors({
                            primary: "#ec4899",
                            accent: "#f43f5e",
                            background: "#fef2f2",
                            foreground: "#0f172a",
                          })
                        }
                      >
                        <div className="flex gap-1 w-full">
                          <div className="h-6 flex-1 rounded" style={{ backgroundColor: "#ec4899" }} />
                          <div className="h-6 flex-1 rounded" style={{ backgroundColor: "#f43f5e" }} />
                        </div>
                        <span className="text-xs font-medium">Criativo</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto flex-col gap-2 p-4 bg-transparent"
                        onClick={() =>
                          updateColors({
                            primary: "#10b981",
                            accent: "#14b8a6",
                            background: "#f0fdf4",
                            foreground: "#0f172a",
                          })
                        }
                      >
                        <div className="flex gap-1 w-full">
                          <div className="h-6 flex-1 rounded" style={{ backgroundColor: "#10b981" }} />
                          <div className="h-6 flex-1 rounded" style={{ backgroundColor: "#14b8a6" }} />
                        </div>
                        <span className="text-xs font-medium">Natureza</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Layout Tab */}
              <TabsContent value="layout" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Tipo de Dashboard</CardTitle>
                    <CardDescription>Escolha o layout principal</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { type: "grid", label: "Grid" },
                        { type: "masonry", label: "Masonry" },
                        { type: "list", label: "Lista" },
                        { type: "kanban", label: "Kanban" },
                        { type: "bento", label: "Bento" },
                        { type: "split", label: "Split" },
                      ].map((layout) => (
                        <Button
                          key={layout.type}
                          variant={composition.dashboard.layoutType === layout.type ? "default" : "outline"}
                          className="h-auto flex-col gap-2 p-4"
                          onClick={() => updateDashboard({ layoutType: layout.type as any })}
                        >
                          <div className="w-full h-12 border-2 rounded bg-muted/50 flex items-center justify-center">
                            <Layout className="w-6 h-6 opacity-50" />
                          </div>
                          <span className="text-sm font-medium">{layout.label}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Configurações de Layout</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Densidade</Label>
                      <div className="flex gap-2">
                        {["compact", "comfortable", "spacious"].map((density) => (
                          <Button
                            key={density}
                            variant={composition.dashboard.density === density ? "default" : "outline"}
                            size="sm"
                            className="flex-1 capitalize"
                            onClick={() => updateDashboard({ density: density as any })}
                          >
                            {density === "compact" ? "Compacto" : density === "comfortable" ? "Confortável" : "Espaçoso"}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Estilo de Borda</Label>
                      <div className="flex gap-2">
                        {["square", "rounded", "pill"].map((border) => (
                          <Button
                            key={border}
                            variant={composition.dashboard.borderStyle === border ? "default" : "outline"}
                            size="sm"
                            className="flex-1 capitalize"
                            onClick={() => updateDashboard({ borderStyle: border as any })}
                          >
                            {border === "square" ? "Quadrado" : border === "rounded" ? "Arredondado" : "Pill"}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TopBar Tab */}
              <TabsContent value="topbar" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Estilo da TopBar</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Variante</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {["barTop-A", "barTop-B", "barTop-C"].map((variant) => (
                          <Button
                            key={variant}
                            variant={composition.topbar.variant === variant ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateTopbar({ variant: variant as any })}
                          >
                            {variant.split("-")[1]}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Elementos Visíveis</Label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                          <Label htmlFor="topbar-sticky" className="text-sm cursor-pointer">Sticky</Label>
                          <Switch
                            id="topbar-sticky"
                            checked={composition.topbar.sticky}
                            onCheckedChange={(checked) => updateTopbar({ sticky: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                          <Label htmlFor="topbar-search" className="text-sm cursor-pointer">Busca</Label>
                          <Switch
                            id="topbar-search"
                            checked={composition.topbar.showSearch}
                            onCheckedChange={(checked) => updateTopbar({ showSearch: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                          <Label htmlFor="topbar-notif" className="text-sm cursor-pointer">Notificações</Label>
                          <Switch
                            id="topbar-notif"
                            checked={composition.topbar.showNotifications}
                            onCheckedChange={(checked) => updateTopbar({ showNotifications: checked })}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sidebar Tab */}
              <TabsContent value="sidebar" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Estilo da Sidebar</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Variante</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {["standard", "compact", "mini", "floating"].map((variant) => (
                          <Button
                            key={variant}
                            variant={composition.sidebar.variant === variant ? "default" : "outline"}
                            size="sm"
                            className="capitalize"
                            onClick={() => updateSidebar({ variant: variant as any })}
                          >
                            {variant}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Opções</Label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                          <Label htmlFor="sidebar-collapse" className="text-sm cursor-pointer">Colapsável</Label>
                          <Switch
                            id="sidebar-collapse"
                            checked={composition.sidebar.collapsible}
                            onCheckedChange={(checked) => updateSidebar({ collapsible: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                          <Label htmlFor="sidebar-icons" className="text-sm cursor-pointer">Mostrar Ícones</Label>
                          <Switch
                            id="sidebar-icons"
                            checked={composition.sidebar.showIcons}
                            onCheckedChange={(checked) => updateSidebar({ showIcons: checked })}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-muted/30 via-background to-muted/20">
        {/* Preview Header */}
        <div className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold">Preview em Tempo Real</span>
            </div>
            <Badge variant="outline" className="gap-1.5 bg-green-500/10 text-green-700 border-green-500/20">
              <Zap className="w-3 h-3" />
              Live
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-1 border rounded-lg p-1 bg-muted/50">
              <Button
                variant={previewMode === "desktop" ? "default" : "ghost"}
                size="sm"
                className="h-8 px-3 gap-2"
                onClick={() => setPreviewMode("desktop")}
              >
                <Monitor className="w-4 h-4" />
                Desktop
              </Button>
              <Button
                variant={previewMode === "tablet" ? "default" : "ghost"}
                size="sm"
                className="h-8 px-3 gap-2"
                onClick={() => setPreviewMode("tablet")}
              >
                <Tablet className="w-4 h-4" />
                Tablet
              </Button>
              <Button
                variant={previewMode === "mobile" ? "default" : "ghost"}
                size="sm"
                className="h-8 px-3 gap-2"
                onClick={() => setPreviewMode("mobile")}
              >
                <Smartphone className="w-4 h-4" />
                Mobile
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <ScrollArea className="flex-1">
          <div className="p-8 min-h-full flex items-center justify-center">
            <div
              className={cn(
                "w-full transition-all duration-300 ease-out",
                previewMode === "desktop" && "max-w-full",
                previewMode === "tablet" && "max-w-[768px]",
                previewMode === "mobile" && "max-w-[375px]"
              )}
            >
              <div className="rounded-xl border-2 bg-background shadow-2xl overflow-hidden ring-1 ring-black/5">
                <ThemeLivePreviewer
                  brandColors={{
                    primary: composition.colors.primary,
                    accent: composition.colors.accent,
                  }}
                  layoutConfig={{
                    sidebar: composition.sidebar,
                    topBar: composition.topbar,
                    dashboard: composition.dashboard,
                    footer: composition.footer || {
                      isVisible: true,
                      height: 48,
                      showCopyright: true,
                      showVersion: true,
                    },
                  }}
                  topBarVariant={composition.topbar.variant}
                />
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
