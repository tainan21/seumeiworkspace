// ============================================
// WORKSPACE ONBOARDING TYPES
// Tipos específicos para criação de workspace via onboarding
// ============================================

export type IdentifierType = "CNPJ" | "CPF";

export type CompanyType = "MEI" | "Simples" | "EIRELI" | "Ltda" | "SA" | "Startup";

export type ThemeStyle = "minimal" | "corporate" | "playful";

export type TopBarVariant = "barTop-A" | "barTop-B" | "barTop-C";

export type BillingPlan = "free" | "pro" | "enterprise";

export type PermissionAction = "create" | "read" | "update" | "delete" | "manage";

export type AppPriority = "essential" | "recommended" | "optional";

// ============================================
// COMPANY
// ============================================

export interface CompanyIdentifier {
  type: IdentifierType;
  value: string;
}

export interface Company {
  name: string;
  identifier?: CompanyIdentifier;
}

// ============================================
// BRAND
// ============================================

export interface BrandColors {
  primary: string;
  accent: string;
}

export interface Brand {
  logo?: string;
  colors: BrandColors;
}

// ============================================
// MENU
// ============================================

export interface MenuComponent {
  id: string;
  type: "item" | "group" | "divider";
  label?: string;
  icon?: string;
  children?: MenuComponent[];
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  order: number;
  parentId?: string;
  route: string;
}

// ============================================
// RBAC
// ============================================

export interface Permission {
  resource: string;
  actions: PermissionAction[];
  scope: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isDefault?: boolean;
  isSystem?: boolean;
}

export interface RBACConfig {
  roles: Role[];
  defaultRole: string;
}

// ============================================
// WORKSPACE SETTINGS
// ============================================

export interface WorkspaceAnalyticsSettings {
  enabled: boolean;
  trackPageViews: boolean;
  trackFeatureUsage: boolean;
  trackNavigation: boolean;
  trackSearches: boolean;
  trackErrors: boolean;
  retentionDays: number;
  anonymizeIp: boolean;
  respectDnt: boolean;
}

export interface WorkspaceSettings {
  billingPlan: BillingPlan;
  locale: string;
  timezone: string;
  analytics?: WorkspaceAnalyticsSettings;
}

// ============================================
// WORKSPACE (entidade principal)
// ============================================

export interface Workspace {
  workspaceId: string;
  slug: string;
  name: string;
  brand: Brand;
  company: Company;
  apps: string[];
  menuItems: MenuItem[];
  topBarVariant: TopBarVariant;
  theme: ThemeStyle;
  ownerId: string;
  createdBy?: string;
  settings: WorkspaceSettings;
  rbac: RBACConfig;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// WORKSPACE LAYOUT CONTRACT
// Contrato que o sistema de layout exige para renderizar corretamente.
// Campos fora deste contrato são dados de domínio (company, settings, rbac, etc.)
// e não devem ser usados pelo layout system.
// ============================================

export interface WorkspaceLayoutContract {
  workspaceId: string;
  slug: string;
  name: string;
  theme: ThemeStyle;
  brand: {
    colors: BrandColors;
    logo?: string;
  };
  menuItems: MenuItem[];
  topBarVariant: TopBarVariant;
  apps: string[];
}

// ============================================
// TEMPLATE
// ============================================

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  supportedFeatures: string[];
  requiredFeatures?: string[];
  targetCompanyTypes?: CompanyType[];
  topBarVariant: TopBarVariant;
  theme: ThemeStyle;
  colors: BrandColors;
  menuPreset: MenuComponent[];
}

// ============================================
// API CONTRACTS
// ============================================

export interface ValidationResult {
  status: "valid" | "invalid" | "optional";
  formatted?: string;
  errors?: string[];
  message?: string;
}

export interface WorkspaceError {
  code: string;
  message: string;
  suggestion?: string;
  field?: string;
}

export interface CreateWorkspaceInput {
  userId: string;
  name: string;
  slug?: string;
  brand: Brand;
  company: Company;
  theme: ThemeStyle;
  companyType: CompanyType;
  employeeCount?: number;
  revenueRange?: string;
  template?: string;
  selectedFeatures: string[];
  menuComponents: MenuComponent[];
  topBarVariant: TopBarVariant;
}

export interface CreateWorkspaceContext {
  existingWorkspaces: Workspace[];
  userPlan: BillingPlan;
}

export type CreateWorkspaceResult =
  | { success: true; workspace: Workspace }
  | { success: false; errors: WorkspaceError[] };

export type WorkspaceLimitResult =
  | { allowed: true }
  | { allowed: false; reason: string; suggestion?: string };

export interface CompatibilityResult {
  compatible: boolean;
  warnings: string[];
  suggestions: string[];
  adjustedFeatures?: string[];
  requiresConsent: boolean;
}
