// ============================================
// DOMAIN: Task Generation
// Tipos para geração de tarefas (proposal only, não execução)
// ============================================

import type { CompanyType, BillingPlan, WorkspaceSettings } from "@/types/workspace"

// Domínios permitidos para tarefas (conforme regras do projeto)
export type AllowedTaskDomain =
  | "company"
  | "workspace"
  | "page"
  | "theme"
  | "template"
  | "rbac"
  | "onboarding"
  | "dashboard"
  | "financeiro"
  | "infrastructure"

export type TaskEffort = "small" | "medium" | "large"

export type TaskStatus = "proposed" | "approved" | "rejected" | "blocked"

export type TaskPriority = "low" | "medium" | "high" | "critical"

/**
 * Representa uma tarefa proposta (não executada)
 */
export interface ProposedTask {
  id: string
  title: string
  description: string
  domain: AllowedTaskDomain
  effort: TaskEffort
  priority: TaskPriority
  valueRationale: string
  dependencies: string[]
  status: TaskStatus
  blockedBy?: string[]
  blockedReason?: string
  metadata?: Record<string, unknown>
  createdAt: string
}

/**
 * Contexto do workspace para geração de tarefas
 * (somente leitura, não muta estado)
 */
export interface TaskGenerationWorkspaceContext {
  workspaceId: string
  companyType: CompanyType
  employeeCount: number
  billingPlan: BillingPlan
  enabledApps: string[]
  settings: WorkspaceSettings
}

/**
 * Contexto do onboarding para geração de tarefas
 * (somente leitura, snapshot do estado atual)
 */
export interface TaskGenerationOnboardingContext {
  currentStep: number
  completedSteps: number[]
  selectedFeatures: string[]
  buildChoice: "template" | "custom" | null
  selectedTemplate: string | null
  hasCompatibilityWarnings: boolean
}

/**
 * Input completo para geração de tarefas
 */
export interface TaskGenerationInput {
  workspace: TaskGenerationWorkspaceContext
  onboarding?: TaskGenerationOnboardingContext
  scope: AllowedTaskDomain | "all"
  maxTasks?: number
}

/**
 * Resultado da geração de tarefas
 */
export interface TaskGenerationResult {
  tasks: ProposedTask[]
  totalEstimatedEffort: TaskEffort
  warnings: string[]
  metadata: {
    generatedAt: string
    inputContextHash: string
    rulesVersion: string
  }
}

/**
 * Regra de validação de tarefa
 */
export interface TaskValidationRule {
  id: string
  description: string
  validate: (task: ProposedTask, context: TaskGenerationInput) => ValidationRuleResult
}

export interface ValidationRuleResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Filtros para consulta de tarefas
 */
export interface TaskQueryFilters {
  domain?: AllowedTaskDomain
  status?: TaskStatus
  priority?: TaskPriority
  effort?: TaskEffort
  hasNoDependencies?: boolean
}
