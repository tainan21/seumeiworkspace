// ============================================
// DOMAIN: Workspace Creation
// Funções de criação de workspace via onboarding
// ============================================

import type {
  Workspace,
  CreateWorkspaceInput,
  CreateWorkspaceContext,
  CreateWorkspaceResult,
  WorkspaceError,
  WorkspaceLimitResult,
  MenuComponent,
  MenuItem,
  BillingPlan,
  WorkspaceAnalyticsSettings,
  Template,
} from "~/types/workspace-onboarding";
import { validateCompanyIdentifier } from "~/domains/company/validate-identifier";
import {
  applyTemplateCompatibility,
  chooseDefaultAppsByCompanyType,
} from "~/domains/template";
import { generateRBACDefaults } from "~/domains/rbac/generate-defaults";
import { getTemplateById } from "~/lib/mock-data/templates";

// ============================================
// ANALYTICS SETTINGS DEFAULTS
// ============================================

const DEFAULT_ANALYTICS_SETTINGS: Record<BillingPlan, WorkspaceAnalyticsSettings> = {
  free: {
    enabled: true,
    trackPageViews: true,
    trackFeatureUsage: true,
    trackNavigation: false,
    trackSearches: false,
    trackErrors: true,
    retentionDays: 30,
    anonymizeIp: true,
    respectDnt: true,
  },
  pro: {
    enabled: true,
    trackPageViews: true,
    trackFeatureUsage: true,
    trackNavigation: true,
    trackSearches: true,
    trackErrors: true,
    retentionDays: 90,
    anonymizeIp: true,
    respectDnt: true,
  },
  enterprise: {
    enabled: true,
    trackPageViews: true,
    trackFeatureUsage: true,
    trackNavigation: true,
    trackSearches: true,
    trackErrors: true,
    retentionDays: 365,
    anonymizeIp: true,
    respectDnt: true,
  },
};

// ============================================
// REGRA: enforceSingleFreeWorkspace
// ============================================

/**
 * Verifica se usuário pode criar novo workspace
 * - Free: 1 workspace como owner
 * - Pro: até 3 workspaces como owner
 * - Enterprise: ilimitado
 *
 * Verifica por ownerId E createdBy para cobrir colaboradores
 */
export function enforceSingleFreeWorkspace(
  userId: string,
  existingWorkspaces: Workspace[],
  userPlan: BillingPlan,
): WorkspaceLimitResult {
  if (userPlan === "enterprise") {
    return { allowed: true };
  }

  const userWorkspaces = existingWorkspaces.filter(
    (w) => w.ownerId === userId || w.createdBy === userId
  );

  if (userPlan === "pro") {
    if (userWorkspaces.length >= 3) {
      return {
        allowed: false,
        reason: "LIMIT_REACHED_PRO",
        suggestion: "Faça upgrade para Enterprise para workspaces ilimitados",
      };
    }
    return { allowed: true };
  }

  const hasFreeWorkspace = userWorkspaces.some(
    (w) => w.settings.billingPlan === "free"
  );

  if (hasFreeWorkspace) {
    return {
      allowed: false,
      reason: "FREE_LIMIT_REACHED",
      suggestion: "Faça upgrade para Pro para criar mais workspaces",
    };
  }

  return { allowed: true };
}

// ============================================
// ANALYTICS SETTINGS HELPERS
// ============================================

/**
 * Inicializa configurações de analytics baseado no plano de billing
 */
export function initializeAnalyticsSettings(
  billingPlan: BillingPlan
): WorkspaceAnalyticsSettings {
  return { ...DEFAULT_ANALYTICS_SETTINGS[billingPlan] };
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

const SYSTEM_MENU_ITEMS = ["dashboard", "settings"];

function isSystemItem(itemId: string): boolean {
  const baseId = itemId.split("-")[0];
  return SYSTEM_MENU_ITEMS.includes(baseId);
}

function generateLabel(id: string): string {
  const labels: Record<string, string> = {
    dashboard: "Dashboard",
    projects: "Projetos",
    docs: "Documentos",
    people: "Pessoas",
    finances: "Financeiro",
    clients: "Clientes",
    calendar: "Agenda",
    analytics: "Analytics",
    reports: "Relatórios",
    integrations: "Integrações",
    roadmap: "Roadmap",
    settings: "Configurações",
  };
  return labels[id] || id.charAt(0).toUpperCase() + id.slice(1);
}

function getDefaultIcon(id: string): string {
  const icons: Record<string, string> = {
    dashboard: "LayoutDashboard",
    projects: "FolderKanban",
    docs: "FileText",
    people: "Users",
    finances: "DollarSign",
    clients: "Building2",
    calendar: "Calendar",
    analytics: "BarChart3",
    reports: "FileBarChart",
    integrations: "Puzzle",
    roadmap: "Map",
    settings: "Settings",
  };
  return icons[id] || "Circle";
}

function generateRoute(id: string): string {
  return `/${id}`;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function generateUUID(): string {
  return "ws_" + Math.random().toString(36).substring(2, 15);
}

// ============================================
// FUNÇÃO: assembleMenu
// ============================================

export function assembleMenu(
  componentsSelected: MenuComponent[],
  appsEnabled: string[]
): MenuItem[] {
  const menuItems: MenuItem[] = [];
  let order = 0;

  function processComponent(component: MenuComponent, parentId?: string): void {
    if (component.type === "divider") {
      return;
    }

    if (component.type === "item") {
      const appId = component.id.split("-")[0];
      if (!appsEnabled.includes(appId) && !isSystemItem(component.id)) {
        return;
      }
    }

    const menuItem: MenuItem = {
      id: component.id,
      label: component.label || generateLabel(component.id),
      icon: component.icon || getDefaultIcon(component.id),
      order: order++,
      parentId,
      route: generateRoute(component.id),
    };

    menuItems.push(menuItem);

    if (component.children) {
      component.children.forEach((child) => processComponent(child, component.id));
    }
  }

  const dashboardComponent = componentsSelected.find((c) => c.id === "dashboard");
  if (dashboardComponent) {
    processComponent(dashboardComponent);
  }

  componentsSelected
    .filter((c) => c.id !== "dashboard" && c.id !== "settings")
    .forEach((c) => processComponent(c));

  const settingsComponent = componentsSelected.find((c) => c.id === "settings");
  if (settingsComponent) {
    processComponent(settingsComponent);
  } else {
    menuItems.push({
      id: "settings",
      label: "Configurações",
      icon: "Settings",
      order: 99,
      route: "/settings",
    });
  }

  return menuItems;
}

// ============================================
// FUNÇÃO: createWorkspace
// ============================================

/**
 * Cria um workspace com todas as regras de negócio aplicadas
 * Esta função NÃO persiste no banco - apenas valida e monta o objeto
 */
export async function createWorkspace(
  input: CreateWorkspaceInput,
  context: CreateWorkspaceContext,
): Promise<CreateWorkspaceResult> {
  const errors: WorkspaceError[] = [];

  // Validar limite de workspaces
  const limitCheck = enforceSingleFreeWorkspace(
    input.userId,
    context.existingWorkspaces,
    context.userPlan
  );
  if (!limitCheck.allowed) {
    errors.push({
      code: "WORKSPACE_LIMIT",
      message: limitCheck.reason,
      suggestion: limitCheck.suggestion,
    });
    return { success: false, errors };
  }

  // Validar identificador da empresa
  if (input.company.identifier?.value) {
    const idValidation = validateCompanyIdentifier(
      input.company.identifier.value,
      input.company.identifier.type
    );
    if (idValidation.status === "invalid") {
      errors.push({
        code: "INVALID_IDENTIFIER",
        message: idValidation.errors?.join("; ") || "Identificador inválido",
        field: "company.identifier",
      });
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  // Ajustar features baseado no template (se houver)
  let adjustedFeatures = input.selectedFeatures;
  if (input.template) {
    const template = getTemplateById(input.template);
    if (template) {
      const compat = applyTemplateCompatibility(
        template,
        input.selectedFeatures,
        input.companyType
      );
      if (!compat.compatible && compat.requiresConsent) {
        // Features não são ajustadas automaticamente
      } else if (compat.adjustedFeatures) {
        adjustedFeatures = compat.adjustedFeatures;
      }
    }
  }

  // Escolher apps padrão baseado no tipo de empresa
  const appRecommendations = chooseDefaultAppsByCompanyType(
    input.companyType,
    input.employeeCount
  );
  const essentialApps =
    appRecommendations.find((r) => r.priority === "essential")?.apps || [];
  const enabledApps = [...new Set([...essentialApps, ...adjustedFeatures])];

  // Montar menu
  const menuItems = assembleMenu(input.menuComponents, enabledApps);

  // Gerar IDs e configurações
  const workspaceId = generateUUID();
  const rbac = generateRBACDefaults({
    ownerId: input.userId,
    apps: enabledApps,
  });

  const slug = input.slug || generateSlug(input.name);
  const billingPlan = context.userPlan === "free" ? "free" : "pro";
  const analyticsSettings = initializeAnalyticsSettings(billingPlan);

  const now = new Date().toISOString();
  const workspace: Workspace = {
    workspaceId,
    slug,
    name: input.name,
    brand: input.brand,
    company: input.company,
    apps: enabledApps,
    menuItems,
    topBarVariant: input.topBarVariant,
    theme: input.theme,
    ownerId: input.userId,
    createdBy: input.userId,
    settings: {
      billingPlan,
      locale: "pt-BR",
      timezone: "America/Sao_Paulo",
      analytics: analyticsSettings,
    },
    rbac,
    createdAt: now,
    updatedAt: now,
  };

  return { success: true, workspace };
}
