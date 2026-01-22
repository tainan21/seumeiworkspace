"use client"

import { motion } from "framer-motion"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Plus,
  Filter,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion"
import { useWorkspace } from "@/lib/hooks/use-workspace"

export default function FinanceiroPage() {
  const reducedMotion = useReducedMotion()
  const { workspace, theme, colors } = useWorkspace()

  if (!workspace) return null

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={cn("text-3xl font-bold flex items-center gap-3", theme.text)}>
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: colors.primary + "15" }}
                >
                  <DollarSign className="w-6 h-6" style={{ color: colors.primary }} />
                </div>
                Financeiro
              </h1>
              <p className={cn("mt-1", theme.muted)}>Visão geral das finanças do workspace</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Este mês
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button size="sm" style={{ backgroundColor: colors.primary, color: "white" }}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Transação
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Receita Total",
              value: "R$ 142.500",
              change: "+12,5%",
              trend: "up",
              icon: TrendingUp,
            },
            {
              label: "Despesas",
              value: "R$ 68.200",
              change: "-3,2%",
              trend: "down",
              icon: TrendingDown,
            },
            {
              label: "Lucro Líquido",
              value: "R$ 74.300",
              change: "+18,7%",
              trend: "up",
              icon: DollarSign,
            },
            {
              label: "Margem",
              value: "52,1%",
              change: "+2,4%",
              trend: "up",
              icon: TrendingUp,
            },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={cn("p-6", theme.card, theme.border)}>
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: colors.primary + "10" }}
                  >
                    <stat.icon className="w-5 h-5" style={{ color: colors.primary }} />
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                      stat.trend === "up" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600",
                    )}
                  >
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <p className={cn("text-2xl font-bold mb-1", theme.text)}>{stat.value}</p>
                <p className={cn("text-sm", theme.muted)}>{stat.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className={cn("p-6", theme.card, theme.border)}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={cn("font-semibold text-lg", theme.text)}>Transações Recentes</h2>
                <Button variant="ghost" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtrar
                </Button>
              </div>
              <div className="space-y-4">
                {[
                  {
                    name: "Projeto Website Redesign",
                    category: "Receita",
                    amount: "+ R$ 15.000",
                    date: "23 Jan 2026",
                    positive: true,
                  },
                  {
                    name: "Salários - Janeiro",
                    category: "Despesa",
                    amount: "- R$ 42.500",
                    date: "20 Jan 2026",
                    positive: false,
                  },
                  {
                    name: "Consultoria Mobile App",
                    category: "Receita",
                    amount: "+ R$ 8.500",
                    date: "18 Jan 2026",
                    positive: true,
                  },
                  {
                    name: "Servidor AWS",
                    category: "Despesa",
                    amount: "- R$ 1.250",
                    date: "15 Jan 2026",
                    positive: false,
                  },
                  {
                    name: "Licenças Software",
                    category: "Despesa",
                    amount: "- R$ 980",
                    date: "12 Jan 2026",
                    positive: false,
                  },
                ].map((transaction, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border transition-colors",
                      "hover:bg-accent/50",
                      theme.border,
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          transaction.positive ? "bg-green-500/10" : "bg-red-500/10",
                        )}
                      >
                        <DollarSign
                          className="w-5 h-5"
                          style={{ color: transaction.positive ? "#10B981" : "#EF4444" }}
                        />
                      </div>
                      <div>
                        <p className={cn("font-medium", theme.text)}>{transaction.name}</p>
                        <p className={cn("text-sm", theme.muted)}>{transaction.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn("font-semibold", transaction.positive ? "text-green-600" : "text-red-600")}>
                        {transaction.amount}
                      </p>
                      <p className={cn("text-sm", theme.muted)}>{transaction.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Categories Breakdown */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className={cn("p-6", theme.card, theme.border)}>
              <h2 className={cn("font-semibold text-lg mb-6", theme.text)}>Despesas por Categoria</h2>
              <div className="space-y-4">
                {[
                  { category: "Salários", percent: 62, amount: "R$ 42.500", color: colors.primary },
                  { category: "Infraestrutura", percent: 18, amount: "R$ 12.300", color: colors.accent },
                  { category: "Software", percent: 12, amount: "R$ 8.200", color: "#10B981" },
                  { category: "Marketing", percent: 8, amount: "R$ 5.200", color: "#F59E0B" },
                ].map((item) => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn("text-sm font-medium", theme.text)}>{item.category}</span>
                      <span className={cn("text-sm", theme.muted)}>{item.amount}</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percent}%` }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                    <p className={cn("text-xs mt-1", theme.muted)}>{item.percent}% do total</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
