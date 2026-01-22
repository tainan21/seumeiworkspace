"use client"

import { motion } from "framer-motion"
import { FolderKanban, CheckCircle2, Users, Clock, ChevronRight, Plus, FileText, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion"
import { useWorkspace } from "@/lib/hooks/use-workspace"

export default function DashboardPage() {
  const reducedMotion = useReducedMotion()
  const { workspace, theme, colors } = useWorkspace()

  if (!workspace) return null

  return (
    <div className="p-6">
      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className={cn("text-2xl font-bold mb-1", theme.text)}>Bem-vindo ao {workspace.name}</h1>
          <p className={theme.muted}>Seu workspace está configurado e pronto para uso.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Projetos Ativos", value: "12", icon: FolderKanban, trend: "+3" },
            { label: "Tarefas Pendentes", value: "48", icon: CheckCircle2, trend: "-5" },
            { label: "Membros", value: "8", icon: Users, trend: "+1" },
            { label: "Tempo Registrado", value: "142h", icon: Clock, trend: "+12h" },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.1 }}
              className={cn("p-5 rounded-xl border", theme.card, theme.border)}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: colors.primary + "15" }}
                >
                  <stat.icon className="w-5 h-5" style={{ color: colors.primary }} />
                </div>
                <span
                  className="text-xs font-medium px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: stat.trend.startsWith("+") ? "#10B98115" : "#EF444415",
                    color: stat.trend.startsWith("+") ? "#10B981" : "#EF4444",
                  }}
                >
                  {stat.trend}
                </span>
              </div>
              <p className={cn("text-2xl font-bold", theme.text)}>{stat.value}</p>
              <p className={cn("text-sm", theme.muted)}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={cn("lg:col-span-2 p-6 rounded-xl border", theme.card, theme.border)}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className={cn("font-semibold", theme.text)}>Atividade Recente</h2>
              <Button variant="ghost" size="sm" className="text-xs">
                Ver tudo
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="space-y-4">
              {[
                { action: "Novo projeto criado", project: "Website Redesign", time: "2 min atrás" },
                { action: "Tarefa concluída", project: "Mobile App", time: "15 min atrás" },
                { action: "Documento atualizado", project: "API Docs", time: "1h atrás" },
                { action: "Membro adicionado", project: "Marketing", time: "3h atrás" },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colors.accent }} />
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm", theme.text)}>{activity.action}</p>
                    <p className={cn("text-xs truncate", theme.muted)}>{activity.project}</p>
                  </div>
                  <span className={cn("text-xs shrink-0", theme.muted)}>{activity.time}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={cn("p-6 rounded-xl border", theme.card, theme.border)}
          >
            <h2 className={cn("font-semibold mb-4", theme.text)}>Ações Rápidas</h2>
            <div className="space-y-2">
              {[
                { label: "Novo Projeto", icon: FolderKanban },
                { label: "Novo Documento", icon: FileText },
                { label: "Convidar Membro", icon: Users },
                { label: "Agendar Reunião", icon: Calendar },
              ].map((action) => (
                <button
                  key={action.label}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
                    "hover:bg-black/5 dark:hover:bg-white/5",
                  )}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: colors.primary + "10" }}
                  >
                    <action.icon className="w-4 h-4" style={{ color: colors.primary }} />
                  </div>
                  <span className={cn("text-sm", theme.text)}>{action.label}</span>
                  <Plus className={cn("w-4 h-4 ml-auto", theme.muted)} />
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Enabled Apps */}
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className={cn("mt-6 p-6 rounded-xl border", theme.card, theme.border)}
        >
          <h2 className={cn("font-semibold mb-4", theme.text)}>Apps Habilitados</h2>
          <div className="flex flex-wrap gap-2">
            {workspace.apps.map((app) => (
              <span
                key={app}
                className="px-3 py-1.5 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: colors.primary + "15",
                  color: colors.primary,
                }}
              >
                {app.charAt(0).toUpperCase() + app.slice(1)}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
