// ============================================
// DOMAIN: Task Generation - Backlog Types
// Types for task backlog and sprint management
// ============================================

import type { AllowedTaskDomain, TaskEffort, TaskPriority, TaskStatus } from "./task-generation.types"

// Extended status for backlog items
export type BacklogTaskStatus = TaskStatus | "in_progress" | "done"

export type SprintStatus = "planning" | "active" | "completed" | "cancelled"

export type TeamRole = "member" | "lead" | "observer"

// ============================================
// TEAM TYPES
// ============================================

export interface Team {
  id: string
  workspaceId: string
  name: string
  description?: string
  color: string
  createdAt: string
  updatedAt: string
}

export interface TeamMember {
  id: string
  teamId: string
  userId: string
  role: TeamRole
  joinedAt: string
  // Denormalized user info for display
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

// ============================================
// SPRINT TYPES
// ============================================

export interface Sprint {
  id: string
  workspaceId: string
  name: string
  goal?: string
  status: SprintStatus
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

export interface SprintSummary extends Sprint {
  taskCount: number
  completedCount: number
  totalEffortPoints: number
}

// ============================================
// BACKLOG TASK TYPES
// ============================================

export interface BacklogTask {
  id: string
  workspaceId: string
  sprintId?: string
  teamId?: string

  // Core fields
  title: string
  description: string
  domain: AllowedTaskDomain

  // Classification
  status: BacklogTaskStatus
  priority: TaskPriority
  effort: TaskEffort

  // Rationale
  valueRationale: string

  // Assignment
  assigneeId?: string
  reporterId?: string

  // Ordering
  backlogOrder: number
  sprintOrder: number

  // Blocking
  blockedReason?: string

  // Metadata
  labels: string[]
  metadata: Record<string, unknown>

  // Timestamps
  createdAt: string
  updatedAt: string
  startedAt?: string
  completedAt?: string

  // Generation tracking
  generatedBy?: "manual" | "task-generation-domain"
  generationContextHash?: string

  // Denormalized relations for display
  team?: Team
  assignee?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  dependencies?: string[]
  dependents?: string[]
}

export interface TaskDependency {
  id: string
  taskId: string
  dependsOnId: string
  createdAt: string
}

export interface TaskComment {
  id: string
  taskId: string
  userId: string
  content: string
  createdAt: string
  updatedAt: string
  user?: {
    name: string
    avatar?: string
  }
}

export interface TaskHistoryEntry {
  id: string
  taskId: string
  userId?: string
  action: string
  fieldName?: string
  oldValue?: string
  newValue?: string
  createdAt: string
}

// ============================================
// BACKLOG VIEWS
// ============================================

export interface BacklogSummary {
  workspaceId: string
  proposedCount: number
  approvedCount: number
  inProgressCount: number
  doneCount: number
  blockedCount: number
  totalCount: number
}

export interface SprintBoard {
  sprintId: string
  sprintName: string
  sprintStatus: SprintStatus
  workspaceId: string
  taskCount: number
  completedCount: number
  totalEffortPoints: number
}

// ============================================
// FILTER & QUERY TYPES
// ============================================

export interface BacklogFilters {
  domain?: AllowedTaskDomain
  status?: BacklogTaskStatus
  priority?: TaskPriority
  effort?: TaskEffort
  teamId?: string
  assigneeId?: string
  sprintId?: string | null // null means backlog only
  labels?: string[]
  search?: string
}

export interface BacklogSortOptions {
  field: "backlogOrder" | "priority" | "createdAt" | "updatedAt" | "effort"
  direction: "asc" | "desc"
}

export interface BacklogQueryOptions {
  filters?: BacklogFilters
  sort?: BacklogSortOptions
  limit?: number
  offset?: number
}

// ============================================
// MUTATION TYPES (For CRUD operations)
// ============================================

export interface CreateTaskInput {
  title: string
  description: string
  domain: AllowedTaskDomain
  priority?: TaskPriority
  effort?: TaskEffort
  valueRationale: string
  teamId?: string
  assigneeId?: string
  sprintId?: string
  labels?: string[]
  dependencies?: string[]
}

export interface UpdateTaskInput {
  id: string
  title?: string
  description?: string
  domain?: AllowedTaskDomain
  status?: BacklogTaskStatus
  priority?: TaskPriority
  effort?: TaskEffort
  valueRationale?: string
  teamId?: string | null
  assigneeId?: string | null
  sprintId?: string | null
  blockedReason?: string
  labels?: string[]
}

export interface MoveTaskInput {
  taskId: string
  targetSprintId?: string | null // null = move to backlog
  targetOrder?: number
}

export interface ReorderBacklogInput {
  taskId: string
  newOrder: number
}

// ============================================
// KANBAN VIEW TYPES
// ============================================

export type KanbanColumn = {
  id: BacklogTaskStatus
  title: string
  tasks: BacklogTask[]
}

export interface KanbanBoard {
  columns: KanbanColumn[]
  sprintId?: string
}
