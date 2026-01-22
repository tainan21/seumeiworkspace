"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  BarChart3,
  TrendingUp,
  Eye,
  MousePointerClick,
  Clock,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion"
import { useWorkspace } from "@/lib/hooks/use-workspace"
import { hasAnalyticsPermission } from "@/domains/rbac/rbac"

// Mock data for demonstration
const MOCK_PAGE_VIEWS = [
  { page: "/dashboard", views: 1247, change: 12.5 },
  { page: "/projects", views: 892, change: -3.2 },
  { page: "/docs", views: 654, change: 8.7 },
  { page: "/settings", views: 321, change: 2.1 },
  { page: "/analytics", views: 198, change: 45.2 },
]

const MOCK_DAILY_STATS = [
  { date: "Seg", views: 245, users: 89 },
  { date: "Ter", views: 312, users: 102 },
  { date: "Qua", views: 287, users: 95 },
  { date: "Qui", views: 398, views: 398, users: 134 },
  { date: "Sex", views: 356, users: 118 },
  { date: "Sáb", views: 189, users: 67 },
  { date: "Dom", views: 145, users: 52 },
]

type TimeRange = "7d" | "30d" | "90d"

export default function AnalyticsPage() {
  const reducedMotion = useReducedMotion()
  const { workspace, theme, colors, userRole } = useWorkspace()
  const [timeRange, setTimeRange] = useState<TimeRange>("7d")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Check permissions
  const canView = useMemo(() => {
    if (!userRole || !workspace) return false
    return hasAnalyticsPermission(userRole, "view", workspace.workspaceId)
  }, [userRole, workspace])

  const canExport = useMemo(() => {
    if (!userRole || !workspace) return false
    return hasAnalyticsPermission(userRole, "export", workspace.workspaceId)
  }, [userRole, workspace])

  const canConfigure = useMemo(() => {
    if (!userRole || !workspace) return false
    return hasAnalyticsPermission(userRole, "configure", workspace.workspaceId)
  }, [userRole, workspace])

  if (!workspace) return null

  // Check if analytics is enabled
  const analyticsEnabled = workspace.settings?.analytics?.enabled ?? false

  if (!analyticsEnabled) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto text-center py-16">
          <BarChart3 className={cn("w-16 h-16 mx-auto mb-4", theme.muted)} />
          <h1 className={cn("text-2xl font-bold mb-2", theme.text)}>Analytics não habilitado</h1>
          <p className={cn("mb-6", theme.muted)}>
            Analytics não está habilitado para este workspace. Entre em contato com o administrador para ativar esta
            funcionalidade.
          </p>
          {canConfigure && <Button style={{ backgroundColor: colors.primary }}>Ativar Analytics</Button>}
        </div>
      </div>
    )
  }

  if (!canView) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto text-center py-16">
          <BarChart3 className={cn("w-16 h-16 mx-auto mb-4", theme.muted)} />
          <h1 className={cn("text-2xl font-bold mb-2", theme.text)}>Acesso negado</h1>
          <p className={theme.muted}>Você não tem permissão para visualizar os dados de analytics.</p>
        </div>
      </div>
    )
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const handleExport = () => {
    // Placeholder for export functionality
    console.log("Exporting analytics data...")
  }

  return (
    <div className="p-6">
      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className={cn("text-2xl font-bold mb-1", theme.text)}>Analytics</h1>
            <p className={theme.muted}>Acompanhe métricas e desempenho do seu workspace</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
              <SelectTrigger className="w-32">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
                <SelectItem value="90d">90 dias</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={handleRefresh}>
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            </Button>
            {canExport && (
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Visualizações",
              value: "3,312",
              change: 12.5,
              icon: Eye,
            },
            {
              label: "Usuários Ativos",
              value: "657",
              change: 8.3,
              icon: Users,
            },
            {
              label: "Cliques",
              value: "1,847",
              change: -2.1,
              icon: MousePointerClick,
            },
            {
              label: "Tempo Médio",
              value: "4m 32s",
              change: 15.7,
              icon: Clock,
            },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
            >
              <Card className={cn(theme.card, theme.border)}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: colors.primary + "15" }}
                    >
                      <stat.icon className="w-5 h-5" style={{ color: colors.primary }} />
                    </div>
                    <span
                      className={cn("text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1")}
                      style={{
                        backgroundColor: stat.change >= 0 ? "#10B98115" : "#EF444415",
                        color: stat.change >= 0 ? "#10B981" : "#EF4444",
                      }}
                    >
                      {stat.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(stat.change)}%
                    </span>
                  </div>
                  <p className={cn("text-2xl font-bold", theme.text)}>{stat.value}</p>
                  <p className={cn("text-sm", theme.muted)}>{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Daily Activity Chart */}
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className={cn(theme.card, theme.border)}>
              <CardHeader>
                <CardTitle className={theme.text}>Atividade Diária</CardTitle>
                <CardDescription className={theme.muted}>Visualizações e usuários únicos por dia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2">
                  {MOCK_DAILY_STATS.map((day, idx) => (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col gap-1">
                        <div
                          className="w-full rounded-t transition-all"
                          style={{
                            height: `${(day.views / 400) * 180}px`,
                            backgroundColor: colors.primary,
                          }}
                        />
                        <div
                          className="w-full rounded-b transition-all"
                          style={{
                            height: `${(day.users / 150) * 60}px`,
                            backgroundColor: colors.accent,
                          }}
                        />
                      </div>
                      <span className={cn("text-xs", theme.muted)}>{day.date}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.primary }} />
                    <span className={cn("text-sm", theme.muted)}>Visualizações</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.accent }} />
                    <span className={cn("text-sm", theme.muted)}>Usuários</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Pages */}
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className={cn("h-full", theme.card, theme.border)}>
              <CardHeader>
                <CardTitle className={theme.text}>Páginas Populares</CardTitle>
                <CardDescription className={theme.muted}>Top 5 páginas mais visitadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {MOCK_PAGE_VIEWS.map((page, idx) => (
                    <div key={page.page} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                          style={{
                            backgroundColor: colors.primary + "15",
                            color: colors.primary,
                          }}
                        >
                          {idx + 1}
                        </span>
                        <span className={cn("text-sm font-medium", theme.text)}>{page.page}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-sm", theme.muted)}>{page.views.toLocaleString()}</span>
                        <span
                          className="text-xs"
                          style={{
                            color: page.change >= 0 ? "#10B981" : "#EF4444",
                          }}
                        >
                          {page.change >= 0 ? "+" : ""}
                          {page.change}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Data Layer Notice */}
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className={cn("border-dashed", theme.border)}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: colors.accent + "15" }}
                >
                  <TrendingUp className="w-5 h-5" style={{ color: colors.accent }} />
                </div>
                <div>
                  <h3 className={cn("font-semibold mb-1", theme.text)}>Dados de Demonstração</h3>
                  <p className={cn("text-sm", theme.muted)}>
                    Os dados exibidos são para demonstração. Para dados reais, aguarde a validação da camada de dados e
                    execução do schema DDL de analytics.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
