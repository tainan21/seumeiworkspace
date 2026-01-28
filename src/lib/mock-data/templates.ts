import type { Template } from "~/types/workspace-onboarding";

/**
 * Templates disponíveis no onboarding
 */
export const MOCK_TEMPLATES: Template[] = [
  {
    id: "startup-saas",
    name: "Restaurante & Delivery",
    description: "Ideal para restaurantes e delivery",
    thumbnail: "/delivery-restaurant-dashboard-dark-theme.jpg",
    supportedFeatures: ["delivery", "restaurant", "pedidos", "produtos", "clientes", "financeiro", "integrations", ],
    requiredFeatures: ["delivery", "restaurant"],
    targetCompanyTypes: ["MEI","Simples", "EIRELI", "Ltda"],
    topBarVariant: "barTop-B",
    theme: "minimal",
    colors: { primary: "#6366F1", accent: "#22D3EE" },
    menuPreset: [
      { id: "dashboard", type: "item", label: "Dashboard", icon: "LayoutDashboard" },
      { id: "delivery", type: "item", label: "Delivery", icon: "Delivery" },
      { id: "restaurant", type: "item", label: "Restaurante", icon: "Restaurant" },
      { id: "pedidos", type: "item", label: "Pedidos", icon: "ShoppingCart" },
      { id: "produtos", type: "item", label: "Produtos", icon: "Box" },
      { id: "clientes", type: "item", label: "Clientes", icon: "Users" },
      { id: "financeiro", type: "item", label: "Financeiro", icon: "DollarSign" },
      { id: "integrations", type: "item", label: "Integrações", icon: "Puzzle" },
      { id: "roadmap", type: "item", label: "Roadmap", icon: "Map" },
      { id: "docs", type: "item", label: "Docs", icon: "FileText" },
      { id: "analytics", type: "item", label: "Analytics", icon: "BarChart3" },
    ],
  },
  {
    id: "agency",
    name: "Autônomo",
    description: "Ideal para autônomos",
    thumbnail: "/autonomo-dashboard-dark-theme.jpg",
    supportedFeatures: ["autonomo", "pedidos", "produtos", "clientes", "financeiro", "integrations", ],
    requiredFeatures: ["autonomo"],
    targetCompanyTypes: ["MEI"],
    topBarVariant: "barTop-A",
    theme: "playful",
    colors: { primary: "#EC4899", accent: "#F59E0B" },
    menuPreset: [
      { id: "dashboard", type: "item", label: "Dashboard", icon: "LayoutDashboard" },
      { id: "clients", type: "item", label: "Clientes", icon: "Building2" },
      { id: "projects", type: "item", label: "Projetos", icon: "FolderKanban" },
      { id: "calendar", type: "item", label: "Agenda", icon: "Calendar" },
      { id: "finances", type: "item", label: "Financeiro", icon: "DollarSign" },
    ],
  },
  {
    id: "Clínica Odontológica e Estética",
    name: "Corporativo",
    description: "Estrutura completa para médias e grandes empresas",
    thumbnail: "/corporate-enterprise-dashboard-professional.jpg",
    supportedFeatures: ["projects", "docs", "people", "finances", "reports", "compliance", "analytics"],
    requiredFeatures: ["docs", "people"],
    targetCompanyTypes: ["Ltda", "SA"],
    topBarVariant: "barTop-C",
    theme: "corporate",
    colors: { primary: "#1E40AF", accent: "#059669" },
    menuPreset: [
      { id: "dashboard", type: "item", label: "Dashboard", icon: "LayoutDashboard" },
      { id: "people", type: "item", label: "Pessoas", icon: "Users" },
      { id: "projects", type: "item", label: "Projetos", icon: "FolderKanban" },
      { id: "docs", type: "item", label: "Documentos", icon: "FileText" },
      { id: "reports", type: "item", label: "Relatórios", icon: "FileBarChart" },
      { id: "compliance", type: "item", label: "Compliance", icon: "Shield" },
    ],
  },
  {
    id: "freelancer",
    name: "Freelancer",
    description: "Simples e direto para profissionais autônomos",
    thumbnail: "/freelancer-simple-dashboard-minimal.jpg",
    supportedFeatures: ["projects", "clients", "finances", "calendar"],
    requiredFeatures: ["finances"],
    targetCompanyTypes: ["MEI"],
    topBarVariant: "barTop-A",
    theme: "minimal",
    colors: { primary: "#10B981", accent: "#8B5CF6" },
    menuPreset: [
      { id: "dashboard", type: "item", label: "Dashboard", icon: "LayoutDashboard" },
      { id: "projects", type: "item", label: "Projetos", icon: "FolderKanban" },
      { id: "clients", type: "item", label: "Clientes", icon: "Building2" },
      { id: "finances", type: "item", label: "Financeiro", icon: "DollarSign" },
      { id: "calendar", type: "item", label: "Agenda", icon: "Calendar" },
    ],
  },
];

export function getTemplateById(id: string): Template | undefined {
  return MOCK_TEMPLATES.find((t) => t.id === id);
}
