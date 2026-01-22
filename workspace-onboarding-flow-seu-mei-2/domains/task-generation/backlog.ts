// ============================================
// DOMAIN: Task Generation - Backlog Operations
// Read-oriented operations with CRUD support
// Consumes task-generation output, no external mutations
// ============================================

import type {
  BacklogTask,
  BacklogQueryOptions,
  BacklogSummary,
  Sprint,
  SprintSummary,
  Team,
  CreateTaskInput,
  UpdateTaskInput,
  MoveTaskInput,
  KanbanBoard,
  KanbanColumn,
  BacklogTaskStatus,
} from "./backlog.types"
import type { TaskGenerationResult } from "./task-generation.types"

// ============================================
// CONSTANTS
// ============================================

const KANBAN_COLUMNS: { id: BacklogTaskStatus; title: string }[] = [
  { id: "proposed", title: "Proposed" },
  { id: "approved", title: "Approved" },
  { id: "in_progress", title: "In Progress" },
  { id: "blocked", title: "Blocked" },
  { id: "done", title: "Done" },
]

const STATUS_ORDER: Record<BacklogTaskStatus, number> = {
  proposed: 0,
  approved: 1,
  in_progress: 2,
  blocked: 3,
  rejected: 4,
  done: 5,
}

// ============================================
// MOCK DATA STORE (In-memory for demo)
// Replace with actual database queries
// ============================================

let mockTasks: BacklogTask[] = []
let mockSprints: Sprint[] = []
let mockTeams: Team[] = []

// ============================================
// CONSUMER: Task Generation Results
// ============================================

/**
 * Converts proposed tasks from task-generation domain to backlog tasks
 * This is the ONLY way tasks from task-generation enter the backlog
 */
export function importProposedTasks(result: TaskGenerationResult, workspaceId: string): BacklogTask[] {
  return result.tasks.map((task, index) => ({
    id: task.id,
    workspaceId,
    title: task.title,
    description: task.description,
    domain: task.domain,
    status: task.status,
    priority: task.priority,
    effort: task.effort,
    valueRationale: task.valueRationale,
    backlogOrder: mockTasks.length + index,
    sprintOrder: 0,
    labels: [],
    metadata: task.metadata || {},
    createdAt: task.createdAt,
    updatedAt: task.createdAt,
    generatedBy: "task-generation-domain",
    generationContextHash: result.metadata.inputContextHash,
    dependencies: task.dependencies,
  }))
}

/**
 * Adds proposed tasks to the backlog
 * Does NOT mutate task-generation domain state
 */
export function addProposedTasksToBacklog(
  result: TaskGenerationResult,
  workspaceId: string,
): { added: number; duplicates: number } {
  const newTasks = importProposedTasks(result, workspaceId)
  const existingIds = new Set(mockTasks.map((t) => t.id))

  let added = 0
  let duplicates = 0

  for (const task of newTasks) {
    if (existingIds.has(task.id)) {
      duplicates++
    } else {
      mockTasks.push(task)
      added++
    }
  }

  return { added, duplicates }
}

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Get backlog tasks with filtering and sorting
 */
export function getBacklogTasks(workspaceId: string, options: BacklogQueryOptions = {}): BacklogTask[] {
  let tasks = mockTasks.filter((t) => t.workspaceId === workspaceId)

  // Apply filters
  if (options.filters) {
    const f = options.filters

    if (f.domain) {
      tasks = tasks.filter((t) => t.domain === f.domain)
    }
    if (f.status) {
      tasks = tasks.filter((t) => t.status === f.status)
    }
    if (f.priority) {
      tasks = tasks.filter((t) => t.priority === f.priority)
    }
    if (f.effort) {
      tasks = tasks.filter((t) => t.effort === f.effort)
    }
    if (f.teamId) {
      tasks = tasks.filter((t) => t.teamId === f.teamId)
    }
    if (f.assigneeId) {
      tasks = tasks.filter((t) => t.assigneeId === f.assigneeId)
    }
    if (f.sprintId !== undefined) {
      tasks = tasks.filter((t) => t.sprintId === f.sprintId)
    }
    if (f.labels && f.labels.length > 0) {
      tasks = tasks.filter((t) => f.labels!.some((label) => t.labels.includes(label)))
    }
    if (f.search) {
      const searchLower = f.search.toLowerCase()
      tasks = tasks.filter(
        (t) => t.title.toLowerCase().includes(searchLower) || t.description.toLowerCase().includes(searchLower),
      )
    }
  }

  // Apply sorting
  const sort = options.sort || { field: "backlogOrder", direction: "asc" }
  tasks.sort((a, b) => {
    let comparison = 0
    switch (sort.field) {
      case "backlogOrder":
        comparison = a.backlogOrder - b.backlogOrder
        break
      case "priority":
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
        break
      case "createdAt":
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case "updatedAt":
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        break
      case "effort":
        const effortOrder = { small: 0, medium: 1, large: 2 }
        comparison = effortOrder[a.effort] - effortOrder[b.effort]
        break
    }
    return sort.direction === "asc" ? comparison : -comparison
  })

  // Apply pagination
  if (options.offset) {
    tasks = tasks.slice(options.offset)
  }
  if (options.limit) {
    tasks = tasks.slice(0, options.limit)
  }

  return tasks
}

/**
 * Get a single task by ID
 */
export function getTaskById(taskId: string): BacklogTask | null {
  return mockTasks.find((t) => t.id === taskId) || null
}

/**
 * Get backlog summary statistics
 */
export function getBacklogSummary(workspaceId: string): BacklogSummary {
  const tasks = mockTasks.filter((t) => t.workspaceId === workspaceId && !t.sprintId)

  return {
    workspaceId,
    proposedCount: tasks.filter((t) => t.status === "proposed").length,
    approvedCount: tasks.filter((t) => t.status === "approved").length,
    inProgressCount: tasks.filter((t) => t.status === "in_progress").length,
    doneCount: tasks.filter((t) => t.status === "done").length,
    blockedCount: tasks.filter((t) => t.status === "blocked").length,
    totalCount: tasks.length,
  }
}

/**
 * Get tasks organized as kanban board
 */
export function getKanbanBoard(workspaceId: string, sprintId?: string): KanbanBoard {
  const tasks = mockTasks.filter((t) => t.workspaceId === workspaceId && t.sprintId === sprintId)

  const columns: KanbanColumn[] = KANBAN_COLUMNS.map((col) => ({
    id: col.id,
    title: col.title,
    tasks: tasks.filter((t) => t.status === col.id).sort((a, b) => a.sprintOrder - b.sprintOrder),
  }))

  return { columns, sprintId }
}

// ============================================
// SPRINT OPERATIONS
// ============================================

/**
 * Get all sprints for a workspace
 */
export function getSprints(workspaceId: string): Sprint[] {
  return mockSprints.filter((s) => s.workspaceId === workspaceId)
}

/**
 * Get sprint with task summary
 */
export function getSprintSummary(sprintId: string): SprintSummary | null {
  const sprint = mockSprints.find((s) => s.id === sprintId)
  if (!sprint) return null

  const tasks = mockTasks.filter((t) => t.sprintId === sprintId)
  const effortPoints = { small: 1, medium: 2, large: 3 }

  return {
    ...sprint,
    taskCount: tasks.length,
    completedCount: tasks.filter((t) => t.status === "done").length,
    totalEffortPoints: tasks.reduce((sum, t) => sum + effortPoints[t.effort], 0),
  }
}

// ============================================
// TEAM OPERATIONS
// ============================================

/**
 * Get all teams for a workspace
 */
export function getTeams(workspaceId: string): Team[] {
  return mockTeams.filter((t) => t.workspaceId === workspaceId)
}

// ============================================
// WRITE OPERATIONS (CRUD)
// ============================================

/**
 * Create a new task manually
 */
export function createTask(workspaceId: string, input: CreateTaskInput): BacklogTask {
  const maxOrder = Math.max(0, ...mockTasks.map((t) => t.backlogOrder))
  const timestamp = new Date().toISOString()

  const task: BacklogTask = {
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    workspaceId,
    title: input.title,
    description: input.description,
    domain: input.domain,
    status: "proposed",
    priority: input.priority || "medium",
    effort: input.effort || "medium",
    valueRationale: input.valueRationale,
    teamId: input.teamId,
    assigneeId: input.assigneeId,
    sprintId: input.sprintId,
    backlogOrder: maxOrder + 1,
    sprintOrder: 0,
    labels: input.labels || [],
    metadata: {},
    createdAt: timestamp,
    updatedAt: timestamp,
    generatedBy: "manual",
    dependencies: input.dependencies,
  }

  mockTasks.push(task)
  return task
}

/**
 * Update an existing task
 */
export function updateTask(input: UpdateTaskInput): BacklogTask | null {
  const index = mockTasks.findIndex((t) => t.id === input.id)
  if (index === -1) return null

  const task = mockTasks[index]
  const updated: BacklogTask = {
    ...task,
    ...Object.fromEntries(Object.entries(input).filter(([_, v]) => v !== undefined)),
    updatedAt: new Date().toISOString(),
  }

  // Handle status transitions
  if (input.status && input.status !== task.status) {
    if (input.status === "in_progress" && !task.startedAt) {
      updated.startedAt = new Date().toISOString()
    }
    if (input.status === "done" && !task.completedAt) {
      updated.completedAt = new Date().toISOString()
    }
  }

  mockTasks[index] = updated
  return updated
}

/**
 * Delete a task
 */
export function deleteTask(taskId: string): boolean {
  const index = mockTasks.findIndex((t) => t.id === taskId)
  if (index === -1) return false

  mockTasks.splice(index, 1)
  return true
}

/**
 * Move task to a sprint or back to backlog
 */
export function moveTask(input: MoveTaskInput): BacklogTask | null {
  const task = mockTasks.find((t) => t.id === input.taskId)
  if (!task) return null

  task.sprintId = input.targetSprintId || undefined
  task.updatedAt = new Date().toISOString()

  if (input.targetOrder !== undefined) {
    if (input.targetSprintId) {
      task.sprintOrder = input.targetOrder
    } else {
      task.backlogOrder = input.targetOrder
    }
  }

  return task
}

/**
 * Reorder tasks in backlog
 */
export function reorderBacklog(workspaceId: string, taskId: string, newOrder: number): void {
  const tasks = mockTasks
    .filter((t) => t.workspaceId === workspaceId && !t.sprintId)
    .sort((a, b) => a.backlogOrder - b.backlogOrder)

  const taskIndex = tasks.findIndex((t) => t.id === taskId)
  if (taskIndex === -1) return

  const [task] = tasks.splice(taskIndex, 1)
  tasks.splice(newOrder, 0, task)

  // Update orders
  tasks.forEach((t, i) => {
    t.backlogOrder = i
    t.updatedAt = new Date().toISOString()
  })
}

// ============================================
// BULK OPERATIONS
// ============================================

/**
 * Approve multiple tasks
 */
export function bulkApprove(taskIds: string[]): number {
  let count = 0
  for (const id of taskIds) {
    const task = mockTasks.find((t) => t.id === id)
    if (task && task.status === "proposed") {
      task.status = "approved"
      task.updatedAt = new Date().toISOString()
      count++
    }
  }
  return count
}

/**
 * Assign multiple tasks to a team
 */
export function bulkAssignToTeam(taskIds: string[], teamId: string): number {
  let count = 0
  for (const id of taskIds) {
    const task = mockTasks.find((t) => t.id === id)
    if (task) {
      task.teamId = teamId
      task.updatedAt = new Date().toISOString()
      count++
    }
  }
  return count
}

/**
 * Move multiple tasks to sprint
 */
export function bulkMoveToSprint(taskIds: string[], sprintId: string | null): number {
  let count = 0
  const maxOrder = mockTasks.filter((t) => t.sprintId === sprintId).reduce((max, t) => Math.max(max, t.sprintOrder), 0)

  for (const id of taskIds) {
    const task = mockTasks.find((t) => t.id === id)
    if (task) {
      task.sprintId = sprintId || undefined
      task.sprintOrder = maxOrder + count + 1
      task.updatedAt = new Date().toISOString()
      count++
    }
  }
  return count
}

// ============================================
// INITIALIZATION (Demo data)
// ============================================

export function initializeMockData(workspaceId: string): void {
  // Teams
  mockTeams = [
    {
      id: "team-platform",
      workspaceId,
      name: "Platform",
      description: "Core platform and infrastructure team",
      color: "#6366F1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "team-frontend",
      workspaceId,
      name: "Frontend",
      description: "UI/UX and frontend development",
      color: "#10B981",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "team-backend",
      workspaceId,
      name: "Backend",
      description: "API and backend services",
      color: "#F59E0B",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  // Sprints
  mockSprints = [
    {
      id: "sprint-1",
      workspaceId,
      name: "Sprint 1 - Foundation",
      goal: "Establish core analytics infrastructure",
      status: "completed",
      startDate: "2025-12-01",
      endDate: "2025-12-14",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "sprint-2",
      workspaceId,
      name: "Sprint 2 - Data Layer",
      goal: "Implement data persistence and tracking",
      status: "active",
      startDate: "2025-12-15",
      endDate: "2025-12-28",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "sprint-3",
      workspaceId,
      name: "Sprint 3 - Dashboard",
      goal: "Build analytics dashboard UI",
      status: "planning",
      startDate: "2025-12-29",
      endDate: "2026-01-11",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  // Tasks
  const now = new Date().toISOString()
  mockTasks = [
    // Backlog tasks
    {
      id: "task-infra-001",
      workspaceId,
      title: "Apply analytics database schema",
      description:
        "Execute the analytics DDL script to create events, aggregations, and page view tables in production.",
      domain: "infrastructure",
      status: "proposed",
      priority: "high",
      effort: "medium",
      valueRationale: "Analytics data layer must exist before any tracking or reporting can function.",
      backlogOrder: 1,
      sprintOrder: 0,
      labels: ["database", "analytics"],
      metadata: {},
      createdAt: now,
      updatedAt: now,
      generatedBy: "task-generation-domain",
      teamId: "team-platform",
    },
    {
      id: "task-workspace-001",
      workspaceId,
      title: "Initialize workspace analytics configuration",
      description: "Set up default analytics settings based on billing plan and company size for all workspaces.",
      domain: "workspace",
      status: "approved",
      priority: "medium",
      effort: "small",
      valueRationale: "Analytics configuration must be defined before tracking can be enabled.",
      backlogOrder: 2,
      sprintOrder: 0,
      labels: ["configuration", "analytics"],
      metadata: {},
      createdAt: now,
      updatedAt: now,
      generatedBy: "task-generation-domain",
      teamId: "team-frontend",
    },
    {
      id: "task-page-001",
      workspaceId,
      title: "Connect page view tracking to persistence layer",
      description: "Wire up the page view event emission to the analytics database tables.",
      domain: "page",
      status: "proposed",
      priority: "medium",
      effort: "small",
      valueRationale: "Page view data needs to persist to the database for reporting.",
      backlogOrder: 3,
      sprintOrder: 0,
      labels: ["tracking", "analytics"],
      metadata: {},
      createdAt: now,
      updatedAt: now,
      generatedBy: "task-generation-domain",
      teamId: "team-frontend",
      dependencies: ["task-infra-001"],
    },
    {
      id: "task-rbac-001",
      workspaceId,
      title: "Configure analytics access permissions",
      description: "Set up role-based permissions for analytics view, export, and configure actions.",
      domain: "rbac",
      status: "approved",
      priority: "high",
      effort: "small",
      valueRationale: "Analytics data is sensitive; access must be controlled via existing RBAC system.",
      backlogOrder: 4,
      sprintOrder: 0,
      labels: ["security", "rbac"],
      metadata: {},
      createdAt: now,
      updatedAt: now,
      generatedBy: "task-generation-domain",
      teamId: "team-backend",
    },
    {
      id: "task-dashboard-001",
      workspaceId,
      title: "Build analytics dashboard page",
      description: "Create dashboard UI with charts, metrics, and filters for workspace analytics data.",
      domain: "dashboard",
      status: "blocked",
      priority: "medium",
      effort: "large",
      valueRationale: "Users need visual access to analytics data; dashboard is the appropriate location.",
      backlogOrder: 5,
      sprintOrder: 0,
      blockedReason: "Blocked until the analytics schema is applied to production",
      labels: ["ui", "analytics", "dashboard"],
      metadata: {},
      createdAt: now,
      updatedAt: now,
      generatedBy: "task-generation-domain",
      teamId: "team-frontend",
      dependencies: ["task-infra-001"],
    },
    {
      id: "task-template-001",
      workspaceId,
      title: "Update template analytics bundling",
      description: "Refine template recommendations to properly include analytics based on company context.",
      domain: "template",
      status: "proposed",
      priority: "low",
      effort: "small",
      valueRationale: "Analytics should be recommended contextually based on company type and size.",
      backlogOrder: 6,
      sprintOrder: 0,
      labels: ["templates"],
      metadata: {},
      createdAt: now,
      updatedAt: now,
      generatedBy: "task-generation-domain",
      teamId: "team-backend",
    },
    // Sprint 2 tasks (active)
    {
      id: "task-sprint2-001",
      workspaceId,
      sprintId: "sprint-2",
      title: "Create analytics event buffer",
      description: "Implement client-side buffer for collecting page view events before persistence.",
      domain: "page",
      status: "in_progress",
      priority: "high",
      effort: "medium",
      valueRationale: "Buffering prevents data loss and reduces database write frequency.",
      backlogOrder: 0,
      sprintOrder: 1,
      labels: ["tracking", "buffer"],
      metadata: {},
      createdAt: now,
      updatedAt: now,
      startedAt: now,
      generatedBy: "manual",
      teamId: "team-platform",
    },
    {
      id: "task-sprint2-002",
      workspaceId,
      sprintId: "sprint-2",
      title: "Implement event flush mechanism",
      description: "Create background process to periodically flush buffered events to database.",
      domain: "infrastructure",
      status: "approved",
      priority: "high",
      effort: "small",
      valueRationale: "Ensures events are persisted even if user closes browser.",
      backlogOrder: 0,
      sprintOrder: 2,
      labels: ["tracking", "persistence"],
      metadata: {},
      createdAt: now,
      updatedAt: now,
      generatedBy: "manual",
      teamId: "team-platform",
      dependencies: ["task-sprint2-001"],
    },
    {
      id: "task-sprint2-003",
      workspaceId,
      sprintId: "sprint-2",
      title: "Add tracking opt-out UI",
      description: "Create user interface for opting out of analytics tracking.",
      domain: "dashboard",
      status: "proposed",
      priority: "medium",
      effort: "small",
      valueRationale: "Privacy compliance requires user control over tracking.",
      backlogOrder: 0,
      sprintOrder: 3,
      labels: ["privacy", "ui"],
      metadata: {},
      createdAt: now,
      updatedAt: now,
      generatedBy: "manual",
      teamId: "team-frontend",
    },
    {
      id: "task-sprint2-004",
      workspaceId,
      sprintId: "sprint-2",
      title: "Create aggregation queries",
      description: "Build SQL queries for daily/weekly/monthly analytics aggregations.",
      domain: "infrastructure",
      status: "done",
      priority: "medium",
      effort: "medium",
      valueRationale: "Aggregations enable fast dashboard loading without scanning raw events.",
      backlogOrder: 0,
      sprintOrder: 4,
      labels: ["database", "performance"],
      metadata: {},
      createdAt: now,
      updatedAt: now,
      completedAt: now,
      generatedBy: "manual",
      teamId: "team-platform",
    },
  ]
}
