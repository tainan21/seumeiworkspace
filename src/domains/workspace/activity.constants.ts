/**
 * Constantes para Activity Log (Domain Layer)
 * Framework-agnostic, facilita extensibilidade
 */

/**
 * Ações que podem ser registradas no activity log
 * Organize por categoria para facilitar manutenção
 */
export const ACTIVITY_ACTIONS = {
  // Projects
  PROJECT_CREATED: 'PROJECT_CREATED',
  PROJECT_UPDATED: 'PROJECT_UPDATED',
  PROJECT_DELETED: 'PROJECT_DELETED',
  
  // Members
  MEMBER_INVITED: 'MEMBER_INVITED',
  MEMBER_JOINED: 'MEMBER_JOINED',
  MEMBER_REMOVED: 'MEMBER_REMOVED',
  MEMBER_ROLE_CHANGED: 'MEMBER_ROLE_CHANGED',
  
  // Settings
  SETTINGS_UPDATED: 'SETTINGS_UPDATED',
  WORKSPACE_UPDATED: 'WORKSPACE_UPDATED',
  
  // Billing
  SUBSCRIPTION_CREATED: 'SUBSCRIPTION_CREATED',
  SUBSCRIPTION_UPDATED: 'SUBSCRIPTION_UPDATED',
  SUBSCRIPTION_CANCELLED: 'SUBSCRIPTION_CANCELLED',
  
  // Wallet
  WALLET_CREDIT_ADDED: 'WALLET_CREDIT_ADDED',
  WALLET_CREDIT_USED: 'WALLET_CREDIT_USED',
  
  // TODO: Adicionar mais conforme necessário
  // - INVOICE_CREATED, INVOICE_PAID
  // - ORDER_CREATED, ORDER_COMPLETED
  // - PRODUCT_CREATED, PRODUCT_UPDATED
} as const;

/**
 * Tipos de entidade relacionados às ações
 */
export const ACTIVITY_ENTITY_TYPES = {
  PROJECT: 'PROJECT',
  MEMBER: 'MEMBER',
  WORKSPACE: 'WORKSPACE',
  SUBSCRIPTION: 'SUBSCRIPTION',
  WALLET: 'WALLET',
  SETTINGS: 'SETTINGS',
  
  // TODO: Adicionar mais conforme necessário
  // INVOICE: 'INVOICE',
  // ORDER: 'ORDER',
  // PRODUCT: 'PRODUCT',
} as const;

/**
 * Type helpers derivados das constantes
 */
export type ActivityActionType = typeof ACTIVITY_ACTIONS[keyof typeof ACTIVITY_ACTIONS];
export type ActivityEntityTypeConst = typeof ACTIVITY_ENTITY_TYPES[keyof typeof ACTIVITY_ENTITY_TYPES];

/**
 * Mapeamento de ações para labels em português
 */
export const ACTIVITY_ACTION_LABELS: Record<string, string> = {
  PROJECT_CREATED: 'Projeto Criado',
  PROJECT_UPDATED: 'Projeto Atualizado',
  PROJECT_DELETED: 'Projeto Deletado',
  
  MEMBER_INVITED: 'Membro Convidado',
  MEMBER_JOINED: 'Membro Entrou',
  MEMBER_REMOVED: 'Membro Removido',
  MEMBER_ROLE_CHANGED: 'Função Alterada',
  
  SETTINGS_UPDATED: 'Configurações Atualizadas',
  WORKSPACE_UPDATED: 'Workspace Atualizado',
  
  SUBSCRIPTION_CREATED: 'Assinatura Criada',
  SUBSCRIPTION_UPDATED: 'Assinatura Atualizada',
  SUBSCRIPTION_CANCELLED: 'Assinatura Cancelada',
  
  WALLET_CREDIT_ADDED: 'Crédito Adicionado',
  WALLET_CREDIT_USED: 'Crédito Utilizado',
};

/**
 * Categorias de ações para filtros
 */
export const ACTIVITY_CATEGORIES = {
  PROJECTS: 'projects',
  MEMBERS: 'members',
  SETTINGS: 'settings',
  BILLING: 'billing',
  WALLET: 'wallet',
} as const;

/**
 * Mapeamento de ações para categorias
 */
export const ACTION_TO_CATEGORY: Record<string, string> = {
  PROJECT_CREATED: ACTIVITY_CATEGORIES.PROJECTS,
  PROJECT_UPDATED: ACTIVITY_CATEGORIES.PROJECTS,
  PROJECT_DELETED: ACTIVITY_CATEGORIES.PROJECTS,
  
  MEMBER_INVITED: ACTIVITY_CATEGORIES.MEMBERS,
  MEMBER_JOINED: ACTIVITY_CATEGORIES.MEMBERS,
  MEMBER_REMOVED: ACTIVITY_CATEGORIES.MEMBERS,
  MEMBER_ROLE_CHANGED: ACTIVITY_CATEGORIES.MEMBERS,
  
  SETTINGS_UPDATED: ACTIVITY_CATEGORIES.SETTINGS,
  WORKSPACE_UPDATED: ACTIVITY_CATEGORIES.SETTINGS,
  
  SUBSCRIPTION_CREATED: ACTIVITY_CATEGORIES.BILLING,
  SUBSCRIPTION_UPDATED: ACTIVITY_CATEGORIES.BILLING,
  SUBSCRIPTION_CANCELLED: ACTIVITY_CATEGORIES.BILLING,
  
  WALLET_CREDIT_ADDED: ACTIVITY_CATEGORIES.WALLET,
  WALLET_CREDIT_USED: ACTIVITY_CATEGORIES.WALLET,
};

