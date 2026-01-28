// ============================================
// DOMAIN: Task Generation
// Lógica de proposta de tarefas (somente leitura)
// NÃO executa tarefas, apenas propõe
// ============================================

import type {
  AllowedTaskDomain,
  ProposedTask,
  TaskGenerationInput,
  TaskGenerationResult,
  TaskGenerationWorkspaceContext,
  TaskGenerationOnboardingContext,
  TaskValidationRule,
  TaskQueryFilters,
  TaskEffort,
  TaskPriority,
} from "./task-generation.types"

// ============================================
// CONSTANTS
// ============================================

const ALLOWED_DOMAINS: AllowedTaskDomain[] = [
  "company",
  "workspace",
  "page",
  "theme",
  "template",
  "rbac",
  "onboarding",
  "dashboard",
  "financeiro",
  "infrastructure",
]

const RULES_VERSION = "1.0.0"

// ============================================
// VALIDATION RULES
// ============================================

const VALIDATION_RULES: TaskValidationRule[] = [
  {
    id: "valid-domain",
    description: "Task domain must be in allowed list",
    validate: (task) => ({
      valid: ALLOWED_DOMAINS.includes(task.domain),
      errors: ALLOWED_DOMAINS.includes(task.domain)
        ? []
        : [`Domain '${task.domain}' is not allowed. Allowed: ${ALLOWED_DOMAINS.join(", ")}`],
      warnings: [],
    }),
  },
  {
    id: "non-empty-title",
    description: "Task must have a non-empty title",
    validate: (task) => ({
      valid: task.title.trim().length > 0,
      errors: task.title.trim().length > 0 ? [] : ["Task title cannot be empty"],
      warnings: [],
    }),
  },
  {
    id: "non-empty-description",
    description: "Task must have a non-empty description",
    validate: (task) => ({
      valid: task.description.trim().length > 0,
      errors: task.description.trim().length > 0 ? [] : ["Task description cannot be empty"],
      warnings: [],
    }),
  },
  {
    id: "non-empty-value-rationale",
    description: "Task must have a value rationale",
    validate: (task) => ({
      valid: task.valueRationale.trim().length > 0,
      errors: task.valueRationale.trim().length > 0 ? [] : ["Task must have a value rationale"],
      warnings: [],
    }),
  },
  {
    id: "valid-dependencies",
    description: "Task dependencies must reference existing tasks",
    validate: (task, context) => {
      // Dependencies will be validated against the full task list later
      // Here we just check format
      const invalidDeps = task.dependencies.filter((dep) => !dep.match(/^[a-z0-9-]+$/))
      return {
        valid: invalidDeps.length === 0,
        errors: invalidDeps.length > 0 ? [`Invalid dependency format: ${invalidDeps.join(", ")}`] : [],
        warnings: [],
      }
    },
  },
  {
    id: "no-vague-tasks",
    description: "Task title must not be vague (Polish, Test, Finalize, etc.)",
    validate: (task) => {
      const vagueTerms = ["polish", "test", "finalize", "cleanup", "misc", "various", "other"]
      const titleLower = task.title.toLowerCase()
      const hasVagueTerm = vagueTerms.some((term) => titleLower.includes(term))
      return {
        valid: !hasVagueTerm,
        errors: hasVagueTerm ? [`Task title contains vague terms. Be more specific.`] : [],
        warnings: [],
      }
    },
  },
]

// ============================================
// HELPER FUNCTIONS (Pure, no side effects)
// ============================================

/**
 * Gera ID único para tarefa
 */
function generateTaskId(domain: AllowedTaskDomain, index: number): string {
  const timestamp = Date.now().toString(36)
  return `task-${domain}-${index}-${timestamp}`
}

/**
 * Gera hash do contexto de input (para rastreabilidade)
 */
function hashInputContext(input: TaskGenerationInput): string {
  const contextString = JSON.stringify({
    workspaceId: input.workspace.workspaceId,
    scope: input.scope,
    timestamp: Date.now(),
  })
  // Simple hash for demo purposes
  let hash = 0
  for (let i = 0; i < contextString.length; i++) {
    const char = contextString.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16)
}

/**
 * Calcula esforço total estimado
 */
function calculateTotalEffort(tasks: ProposedTask[]): TaskEffort {
  const effortValues: Record<TaskEffort, number> = { small: 1, medium: 2, large: 3 }
  const total = tasks.reduce((sum, task) => sum + effortValues[task.effort], 0)

  if (total <= 3) return "small"
  if (total <= 7) return "medium"
  return "large"
}

/**
 * Valida uma tarefa contra todas as regras
 */
export function validateTask(
  task: ProposedTask,
  context: TaskGenerationInput,
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  for (const rule of VALIDATION_RULES) {
    const result = rule.validate(task, context)
    errors.push(...result.errors)
    warnings.push(...result.warnings)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Valida dependências entre tarefas
 */
export function validateDependencies(tasks: ProposedTask[]): {
  valid: boolean
  circularDependencies: string[]
  missingDependencies: string[]
} {
  const taskIds = new Set(tasks.map((t) => t.id))
  const missingDependencies: string[] = []
  const circularDependencies: string[] = []

  // Check for missing dependencies
  for (const task of tasks) {
    for (const dep of task.dependencies) {
      if (!taskIds.has(dep)) {
        missingDependencies.push(`${task.id} -> ${dep}`)
      }
    }
  }

  // Check for circular dependencies (simple DFS)
  const visited = new Set<string>()
  const inStack = new Set<string>()

  function hasCycle(taskId: string): boolean {
    if (inStack.has(taskId)) return true
    if (visited.has(taskId)) return false

    visited.add(taskId)
    inStack.add(taskId)

    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      for (const dep of task.dependencies) {
        if (hasCycle(dep)) {
          circularDependencies.push(`${taskId} -> ${dep}`)
          return true
        }
      }
    }

    inStack.delete(taskId)
    return false
  }

  for (const task of tasks) {
    hasCycle(task.id)
  }

  return {
    valid: missingDependencies.length === 0 && circularDependencies.length === 0,
    missingDependencies,
    circularDependencies,
  }
}

// ============================================
// CONTEXT EXTRACTION (Read-only)
// ============================================

/**
 * Extrai contexto do workspace para geração de tarefas
 * (Somente leitura, não muta estado)
 */
export function extractWorkspaceContext(workspaceData: Record<string, unknown>): TaskGenerationWorkspaceContext | null {
  // Validate required fields
  if (!workspaceData.workspaceId || !workspaceData.company || !workspaceData.settings) {
    return null
  }

  const company = workspaceData.company as Record<string, unknown>
  const settings = workspaceData.settings as Record<string, unknown>

  return {
    workspaceId: workspaceData.workspaceId as string,
    companyType: (company.type as string) || "Simples",
    employeeCount: (company.employeeCount as number) || 1,
    billingPlan: (settings.billingPlan as "free" | "pro" | "enterprise") || "free",
    enabledApps: (workspaceData.apps as string[]) || [],
    settings: settings as TaskGenerationWorkspaceContext["settings"],
  }
}

/**
 * Extrai contexto do onboarding para geração de tarefas
 * (Somente leitura, snapshot do estado atual)
 */
export function extractOnboardingContext(
  onboardingState: Record<string, unknown>,
): TaskGenerationOnboardingContext | null {
  if (!onboardingState.currentStep) {
    return null
  }

  return {
    currentStep: onboardingState.currentStep as number,
    completedSteps: (onboardingState.completedSteps as number[]) || [],
    selectedFeatures: (onboardingState.selectedFeatures as string[]) || [],
    buildChoice: onboardingState.buildChoice as "template" | "custom" | null,
    selectedTemplate: onboardingState.selectedTemplate as string | null,
    hasCompatibilityWarnings: ((onboardingState.compatibilityWarnings as string[]) || []).length > 0,
  }
}

// ============================================
// TASK GENERATION (Pure functions)
// ============================================

/**
 * Cria uma tarefa proposta
 */
export function createProposedTask(params: {
  title: string
  description: string
  domain: AllowedTaskDomain
  effort: TaskEffort
  priority: TaskPriority
  valueRationale: string
  dependencies?: string[]
  metadata?: Record<string, unknown>
}): ProposedTask {
  const index = Math.floor(Math.random() * 1000)

  return {
    id: generateTaskId(params.domain, index),
    title: params.title,
    description: params.description,
    domain: params.domain,
    effort: params.effort,
    priority: params.priority,
    valueRationale: params.valueRationale,
    dependencies: params.dependencies || [],
    status: "proposed",
    metadata: params.metadata,
    createdAt: new Date().toISOString(),
  }
}

/**
 * Gera tarefas baseado no contexto
 * (Função pura, não executa tarefas)
 */
export function generateTasks(input: TaskGenerationInput): TaskGenerationResult {
  const tasks: ProposedTask[] = []
  const warnings: string[] = []

  const { workspace, onboarding, scope, maxTasks = 10 } = input

  // Generate infrastructure tasks if needed
  if (scope === "all" || scope === "infrastructure") {
    const infraTasks = generateInfrastructureTasks(workspace, onboarding)
    tasks.push(...infraTasks)
  }

  // Generate workspace tasks if needed
  if (scope === "all" || scope === "workspace") {
    const workspaceTasks = generateWorkspaceTasks(workspace, onboarding)
    tasks.push(...workspaceTasks)
  }

  // Generate page tasks if needed
  if (scope === "all" || scope === "page") {
    const pageTasks = generatePageTasks(workspace)
    tasks.push(...pageTasks)
  }

  // Generate RBAC tasks if needed
  if (scope === "all" || scope === "rbac") {
    const rbacTasks = generateRBACTasks(workspace)
    tasks.push(...rbacTasks)
  }

  // Generate dashboard tasks if needed
  if (scope === "all" || scope === "dashboard") {
    const dashboardTasks = generateDashboardTasks(workspace)
    tasks.push(...dashboardTasks)
  }

  // Generate template tasks if needed
  if (scope === "all" || scope === "template") {
    const templateTasks = generateTemplateTasks(workspace, onboarding)
    tasks.push(...templateTasks)
  }

  // Validate all tasks
  for (const task of tasks) {
    const validation = validateTask(task, input)
    if (!validation.valid) {
      warnings.push(`Task '${task.title}' validation failed: ${validation.errors.join(", ")}`)
    }
    warnings.push(...validation.warnings)
  }

  // Validate dependencies
  const depValidation = validateDependencies(tasks)
  if (!depValidation.valid) {
    warnings.push(...depValidation.missingDependencies.map((d) => `Missing dependency: ${d}`))
    warnings.push(...depValidation.circularDependencies.map((d) => `Circular dependency: ${d}`))
  }

  // Limit tasks if needed
  const limitedTasks = tasks.slice(0, maxTasks)
  if (tasks.length > maxTasks) {
    warnings.push(`Generated ${tasks.length} tasks, limited to ${maxTasks}`)
  }

  return {
    tasks: limitedTasks,
    totalEstimatedEffort: calculateTotalEffort(limitedTasks),
    warnings,
    metadata: {
      generatedAt: new Date().toISOString(),
      inputContextHash: hashInputContext(input),
      rulesVersion: RULES_VERSION,
    },
  }
}

// ============================================
// DOMAIN-SPECIFIC TASK GENERATORS
// ============================================

function generateInfrastructureTasks(
  workspace: TaskGenerationWorkspaceContext,
  onboarding?: TaskGenerationOnboardingContext,
): ProposedTask[] {
  const tasks: ProposedTask[] = []

  // Check if analytics is enabled
  if (workspace.settings.analytics?.enabled) {
    tasks.push(
      createProposedTask({
        title: "Apply analytics database schema",
        description: "Execute the analytics DDL script to create events, aggregations, and page view tables.",
        domain: "infrastructure",
        effort: "medium",
        priority: "high",
        valueRationale: "Analytics data layer must exist before any tracking or reporting can function.",
        dependencies: [],
      }),
    )
  }

  return tasks
}

function generateWorkspaceTasks(
  workspace: TaskGenerationWorkspaceContext,
  onboarding?: TaskGenerationOnboardingContext,
): ProposedTask[] {
  const tasks: ProposedTask[] = []

  // Check if analytics config needs initialization
  if (!workspace.settings.analytics) {
    tasks.push(
      createProposedTask({
        title: "Initialize workspace analytics configuration",
        description: "Set up default analytics settings based on billing plan and company size.",
        domain: "workspace",
        effort: "small",
        priority: "medium",
        valueRationale: "Analytics configuration must be defined before tracking can be enabled.",
        dependencies: [],
      }),
    )
  }

  return tasks
}

function generatePageTasks(workspace: TaskGenerationWorkspaceContext): ProposedTask[] {
  const tasks: ProposedTask[] = []

  if (workspace.settings.analytics?.trackPageViews) {
    tasks.push(
      createProposedTask({
        title: "Connect page view tracking to persistence layer",
        description: "Wire up the page view event emission to the analytics database tables.",
        domain: "page",
        effort: "small",
        priority: "medium",
        valueRationale: "Page view data needs to persist to the database for reporting.",
        dependencies: [],
      }),
    )
  }

  return tasks
}

function generateRBACTasks(workspace: TaskGenerationWorkspaceContext): ProposedTask[] {
  const tasks: ProposedTask[] = []

  if (workspace.settings.analytics?.enabled) {
    tasks.push(
      createProposedTask({
        title: "Configure analytics access permissions",
        description: "Set up role-based permissions for analytics view, export, and configure actions.",
        domain: "rbac",
        effort: "small",
        priority: "high",
        valueRationale: "Analytics data is sensitive; access must be controlled via existing RBAC system.",
        dependencies: [],
      }),
    )
  }

  return tasks
}

function generateDashboardTasks(workspace: TaskGenerationWorkspaceContext): ProposedTask[] {
  const tasks: ProposedTask[] = []

  if (workspace.enabledApps.includes("analytics") && workspace.settings.analytics?.enabled) {
    tasks.push(
      createProposedTask({
        title: "Build analytics dashboard page",
        description: "Create dashboard UI with charts, metrics, and filters for workspace analytics data.",
        domain: "dashboard",
        effort: "large",
        priority: "medium",
        valueRationale: "Users need visual access to analytics data; dashboard is the appropriate location.",
        dependencies: [],
        metadata: {
          blockedUntilDataLayerValidated: true,
        },
      }),
    )
  }

  return tasks
}

function generateTemplateTasks(
  workspace: TaskGenerationWorkspaceContext,
  onboarding?: TaskGenerationOnboardingContext,
): ProposedTask[] {
  const tasks: ProposedTask[] = []

  if (onboarding?.selectedTemplate && workspace.enabledApps.includes("analytics")) {
    tasks.push(
      createProposedTask({
        title: "Update template analytics bundling",
        description: "Refine template recommendations to properly include analytics based on company context.",
        domain: "template",
        effort: "small",
        priority: "low",
        valueRationale: "Analytics should be recommended contextually based on company type and size.",
        dependencies: [],
      }),
    )
  }

  return tasks
}

// ============================================
// QUERY FUNCTIONS (Read-only)
// ============================================

/**
 * Filtra tarefas baseado em critérios
 */
export function filterTasks(tasks: ProposedTask[], filters: TaskQueryFilters): ProposedTask[] {
  return tasks.filter((task) => {
    if (filters.domain && task.domain !== filters.domain) return false
    if (filters.status && task.status !== filters.status) return false
    if (filters.priority && task.priority !== filters.priority) return false
    if (filters.effort && task.effort !== filters.effort) return false
    if (filters.hasNoDependencies && task.dependencies.length > 0) return false
    return true
  })
}

/**
 * Ordena tarefas por prioridade e dependências
 */
export function sortTasksByPriority(tasks: ProposedTask[]): ProposedTask[] {
  const priorityOrder: Record<TaskPriority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  }

  return [...tasks].sort((a, b) => {
    // Tasks without dependencies come first
    if (a.dependencies.length === 0 && b.dependencies.length > 0) return -1
    if (a.dependencies.length > 0 && b.dependencies.length === 0) return 1

    // Then sort by priority
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
}

/**
 * Obtém tarefas prontas para execução (sem bloqueios)
 */
export function getReadyTasks(tasks: ProposedTask[]): ProposedTask[] {
  const completedIds = new Set(tasks.filter((t) => t.status === "approved").map((t) => t.id))

  return tasks.filter((task) => {
    if (task.status !== "proposed") return false
    if (task.blockedBy && task.blockedBy.length > 0) return false

    // Check if all dependencies are completed
    return task.dependencies.every((depId) => completedIds.has(depId))
  })
}

// ============================================
// TESTS
// ============================================
/*
TEST: validateTask - Valid task passes all rules
INPUT: (validTask, validContext)
EXPECTED: { valid: true, errors: [], warnings: [] }

TEST: validateTask - Invalid domain fails
INPUT: ({ domain: 'invalid' }, validContext)
EXPECTED: { valid: false, errors: ['Domain not allowed'] }

TEST: validateTask - Vague title fails
INPUT: ({ title: 'Polish the UI' }, validContext)
EXPECTED: { valid: false, errors: ['Task title contains vague terms'] }

TEST: validateDependencies - Circular dependency detected
INPUT: [{ id: 'a', dependencies: ['b'] }, { id: 'b', dependencies: ['a'] }]
EXPECTED: { valid: false, circularDependencies: ['a -> b', 'b -> a'] }

TEST: generateTasks - Respects maxTasks limit
INPUT: { maxTasks: 2, ... }
EXPECTED: tasks.length <= 2

TEST: filterTasks - Filters by domain
INPUT: (tasks, { domain: 'workspace' })
EXPECTED: All returned tasks have domain === 'workspace'

TEST: getReadyTasks - Returns only unblocked tasks
INPUT: (mixedTasks)
EXPECTED: All returned tasks have no pending dependencies
*/
