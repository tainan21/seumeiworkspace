import type { Feature } from "@/types/workspace"

export const MOCK_FEATURES: Feature[] = [
  {
    id: "projects",
    name: "Projetos",
    icon: "FolderKanban",
    description: "Kanban, listas e gestão de tarefas",
    category: "core",
  },
  {
    id: "docs",
    name: "Documentos",
    icon: "FileText",
    description: "Wiki e base de conhecimento",
    category: "core",
  },
  {
    id: "people",
    name: "Pessoas",
    icon: "Users",
    description: "RH e gestão de equipes",
    category: "core",
  },
  {
    id: "finances",
    name: "Financeiro",
    icon: "DollarSign",
    description: "Contas a pagar/receber, fluxo de caixa",
    category: "core",
  },
  {
    id: "clients",
    name: "Clientes",
    icon: "Building2",
    description: "CRM e relacionamento com clientes",
    category: "core",
  },
  {
    id: "calendar",
    name: "Agenda",
    icon: "Calendar",
    description: "Eventos e compromissos",
    category: "productivity",
  },
  {
    id: "analytics",
    name: "Analytics",
    icon: "BarChart3",
    description: "Dashboards e métricas em tempo real",
    category: "analytics",
  },
  {
    id: "reports",
    name: "Relatórios",
    icon: "FileBarChart",
    description: "Relatórios customizados e exportação",
    category: "analytics",
  },
  {
    id: "integrations",
    name: "Integrações",
    icon: "Puzzle",
    description: "Conecte apps externos (Slack, GitHub, etc.)",
    category: "advanced",
  },
  {
    id: "roadmap",
    name: "Roadmap",
    icon: "Map",
    description: "Planejamento de produto e OKRs",
    category: "advanced",
  },
]

export const FEATURE_CATEGORIES = {
  core: "Essenciais",
  productivity: "Produtividade",
  analytics: "Análise",
  advanced: "Avançado",
}
