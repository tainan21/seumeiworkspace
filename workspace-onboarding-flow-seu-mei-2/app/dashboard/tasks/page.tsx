"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ListTodo,
  Kanban,
  Calendar,
  Search,
  Plus,
  ChevronDown,
  MoreHorizontal,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  ArrowRight,
  Trash2,
  Edit,
  MoveRight,
  Layers,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion"
import { useWorkspace } from "@/lib/hooks/use-workspace"
import {
  getBacklogTasks,
  getBacklogSummary,
  getSprints,
  getTeams,
  getKanbanBoard,
  createTask,
  updateTask,
  deleteTask,
  bulkApprove,
  bulkMoveToSprint,
  initializeMockData,
} from "@/domains/task-generation/backlog"
import type {
  BacklogTask,
  BacklogFilters,
  BacklogTaskStatus,
  Sprint,
  Team,
} from "@/domains/task-generation/backlog.types"
import type { AllowedTaskDomain, TaskPriority, TaskEffort } from "@/domains/task-generation/task-generation.types"

// ============================================
// CONSTANTS
// ============================================

const STATUS_CONFIG: Record<BacklogTaskStatus, { label: string; color: string; icon: typeof Circle }> = {
  proposed: { label: "Proposed", color: "#6B7280", icon: Circle },
  approved: { label: "Approved", color: "#6366F1", icon: CheckCircle2 },
  in_progress: { label: "In Progress", color: "#F59E0B", icon: Clock },
  blocked: { label: "Blocked", color: "#EF4444", icon: AlertCircle },
  rejected: { label: "Rejected", color: "#9CA3AF", icon: Circle },
  done: { label: "Done", color: "#10B981", icon: CheckCircle2 },
}

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  critical: { label: "Critical", color: "#DC2626" },
  high: { label: "High", color: "#F59E0B" },
  medium: { label: "Medium", color: "#6366F1" },
  low: { label: "Low", color: "#6B7280" },
}

const EFFORT_CONFIG: Record<TaskEffort, { label: string; points: number }> = {
  small: { label: "Small", points: 1 },
  medium: { label: "Medium", points: 2 },
  large: { label: "Large", points: 3 },
}

const DOMAINS: AllowedTaskDomain[] = [
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

type ViewMode = "list" | "kanban" | "sprints"

// ============================================
// MAIN COMPONENT
// ============================================

export default function TasksPage() {
  const reducedMotion = useReducedMotion()
  const { workspace, theme, colors } = useWorkspace()

  // State
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<BacklogFilters>({})
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null)

  // Dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<BacklogTask | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<BacklogTask | null>(null)
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false)

  // Initialize mock data
  useEffect(() => {
    if (workspace?.workspaceId) {
      initializeMockData(workspace.workspaceId)
    }
  }, [workspace?.workspaceId])

  // Data
  const tasks = useMemo(() => {
    if (!workspace?.workspaceId) return []
    return getBacklogTasks(workspace.workspaceId, {
      filters: {
        ...filters,
        search: searchQuery || undefined,
        sprintId: selectedSprintId,
      },
    })
  }, [workspace?.workspaceId, filters, searchQuery, selectedSprintId])

  const summary = useMemo(() => {
    if (!workspace?.workspaceId) return null
    return getBacklogSummary(workspace.workspaceId)
  }, [workspace?.workspaceId, tasks])

  const sprints = useMemo(() => {
    if (!workspace?.workspaceId) return []
    return getSprints(workspace.workspaceId)
  }, [workspace?.workspaceId])

  const teams = useMemo(() => {
    if (!workspace?.workspaceId) return []
    return getTeams(workspace.workspaceId)
  }, [workspace?.workspaceId])

  const kanbanBoard = useMemo(() => {
    if (!workspace?.workspaceId) return null
    return getKanbanBoard(workspace.workspaceId, selectedSprintId || undefined)
  }, [workspace?.workspaceId, selectedSprintId, tasks])

  if (!workspace) return null

  // Handlers
  const handleSelectTask = (taskId: string, selected: boolean) => {
    const newSelected = new Set(selectedTasks)
    if (selected) {
      newSelected.add(taskId)
    } else {
      newSelected.delete(taskId)
    }
    setSelectedTasks(newSelected)
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedTasks(new Set(tasks.map((t) => t.id)))
    } else {
      setSelectedTasks(new Set())
    }
  }

  const handleBulkApprove = () => {
    bulkApprove(Array.from(selectedTasks))
    setSelectedTasks(new Set())
  }

  const handleBulkMove = (sprintId: string | null) => {
    bulkMoveToSprint(Array.from(selectedTasks), sprintId)
    setSelectedTasks(new Set())
    setIsMoveDialogOpen(false)
  }

  const handleDeleteTask = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id)
      setTaskToDelete(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleStatusChange = (task: BacklogTask, newStatus: BacklogTaskStatus) => {
    updateTask({ id: task.id, status: newStatus })
  }

  return (
    <div className="p-6">
      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className={cn("text-2xl font-bold mb-1", theme.text)}>Task Backlog</h1>
            <p className={theme.muted}>Manage and track tasks generated from the task-generation domain</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              style={{ backgroundColor: colors.primary }}
              className="text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {[
              { label: "Proposed", value: summary.proposedCount, color: STATUS_CONFIG.proposed.color },
              { label: "Approved", value: summary.approvedCount, color: STATUS_CONFIG.approved.color },
              { label: "In Progress", value: summary.inProgressCount, color: STATUS_CONFIG.in_progress.color },
              { label: "Blocked", value: summary.blockedCount, color: STATUS_CONFIG.blocked.color },
              { label: "Done", value: summary.doneCount, color: STATUS_CONFIG.done.color },
              { label: "Total", value: summary.totalCount, color: colors.primary },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card
                  className={cn(
                    "cursor-pointer hover:border-foreground/20 transition-colors",
                    theme.card,
                    theme.border,
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }} />
                      <span className={cn("text-xs", theme.muted)}>{stat.label}</span>
                    </div>
                    <p className={cn("text-xl font-bold", theme.text)}>{stat.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className={cn("flex flex-col lg:flex-row gap-3 mb-4 p-4 rounded-lg border", theme.card, theme.border)}>
          {/* View Mode */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="w-auto">
            <TabsList>
              <TabsTrigger value="list" className="gap-2">
                <ListTodo className="w-4 h-4" />
                <span className="hidden sm:inline">List</span>
              </TabsTrigger>
              <TabsTrigger value="kanban" className="gap-2">
                <Kanban className="w-4 h-4" />
                <span className="hidden sm:inline">Kanban</span>
              </TabsTrigger>
              <TabsTrigger value="sprints" className="gap-2">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Sprints</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4", theme.muted)} />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Select
              value={filters.status || "all"}
              onValueChange={(v) =>
                setFilters({ ...filters, status: v === "all" ? undefined : (v as BacklogTaskStatus) })
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.priority || "all"}
              onValueChange={(v) => setFilters({ ...filters, priority: v === "all" ? undefined : (v as TaskPriority) })}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.domain || "all"}
              onValueChange={(v) =>
                setFilters({ ...filters, domain: v === "all" ? undefined : (v as AllowedTaskDomain) })
              }
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                {DOMAINS.map((domain) => (
                  <SelectItem key={domain} value={domain}>
                    {domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.teamId || "all"}
              onValueChange={(v) => setFilters({ ...filters, teamId: v === "all" ? undefined : v })}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedSprintId !== null && (
              <Button variant="outline" size="sm" onClick={() => setSelectedSprintId(null)}>
                Backlog Only
              </Button>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        <AnimatePresence>
          {selectedTasks.size > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={cn("mb-4 p-3 rounded-lg border flex items-center gap-3", theme.card, theme.border)}
            >
              <span className={cn("text-sm", theme.muted)}>
                {selectedTasks.size} task{selectedTasks.size > 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={handleBulkApprove}>
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsMoveDialogOpen(true)}>
                  <MoveRight className="w-4 h-4 mr-1" />
                  Move to Sprint
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedTasks(new Set())}>
                  Clear
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        {viewMode === "list" && (
          <TaskListView
            tasks={tasks}
            teams={teams}
            sprints={sprints}
            selectedTasks={selectedTasks}
            theme={theme}
            colors={colors}
            reducedMotion={reducedMotion}
            onSelectTask={handleSelectTask}
            onSelectAll={handleSelectAll}
            onEdit={(task) => {
              setEditingTask(task)
              setIsEditDialogOpen(true)
            }}
            onDelete={(task) => {
              setTaskToDelete(task)
              setIsDeleteDialogOpen(true)
            }}
            onStatusChange={handleStatusChange}
          />
        )}

        {viewMode === "kanban" && kanbanBoard && (
          <KanbanView
            board={kanbanBoard}
            teams={teams}
            theme={theme}
            colors={colors}
            reducedMotion={reducedMotion}
            onStatusChange={handleStatusChange}
            onEdit={(task) => {
              setEditingTask(task)
              setIsEditDialogOpen(true)
            }}
          />
        )}

        {viewMode === "sprints" && (
          <SprintsView
            sprints={sprints}
            tasks={tasks}
            theme={theme}
            colors={colors}
            reducedMotion={reducedMotion}
            onSelectSprint={(sprintId) => {
              setSelectedSprintId(sprintId)
              setViewMode("kanban")
            }}
          />
        )}

        {/* Create Task Dialog */}
        <CreateTaskDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          teams={teams}
          sprints={sprints}
          workspaceId={workspace.workspaceId}
          theme={theme}
          colors={colors}
        />

        {/* Edit Task Dialog */}
        <EditTaskDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          task={editingTask}
          teams={teams}
          sprints={sprints}
          theme={theme}
          colors={colors}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Task</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{taskToDelete?.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteTask}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Move to Sprint Dialog */}
        <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Move to Sprint</DialogTitle>
              <DialogDescription>
                Select a sprint to move {selectedTasks.size} task{selectedTasks.size > 1 ? "s" : ""} to.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => handleBulkMove(null)}
              >
                <Layers className="w-4 h-4 mr-2" />
                Move to Backlog
              </Button>
              {sprints
                .filter((s) => s.status !== "completed")
                .map((sprint) => (
                  <Button
                    key={sprint.id}
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => handleBulkMove(sprint.id)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {sprint.name}
                    <Badge variant="outline" className="ml-auto">
                      {sprint.status}
                    </Badge>
                  </Button>
                ))}
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}

// ============================================
// LIST VIEW COMPONENT
// ============================================

function TaskListView({
  tasks,
  teams,
  sprints,
  selectedTasks,
  theme,
  colors,
  reducedMotion,
  onSelectTask,
  onSelectAll,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  tasks: BacklogTask[]
  teams: Team[]
  sprints: Sprint[]
  selectedTasks: Set<string>
  theme: any
  colors: any
  reducedMotion: boolean
  onSelectTask: (id: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
  onEdit: (task: BacklogTask) => void
  onDelete: (task: BacklogTask) => void
  onStatusChange: (task: BacklogTask, status: BacklogTaskStatus) => void
}) {
  const allSelected = tasks.length > 0 && tasks.every((t) => selectedTasks.has(t.id))

  return (
    <Card className={cn(theme.card, theme.border)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={cn("border-b", theme.border)}>
              <th className="p-3 text-left w-10">
                <Checkbox checked={allSelected} onCheckedChange={onSelectAll} />
              </th>
              <th className={cn("p-3 text-left text-sm font-medium", theme.muted)}>Task</th>
              <th className={cn("p-3 text-left text-sm font-medium w-28", theme.muted)}>Status</th>
              <th className={cn("p-3 text-left text-sm font-medium w-24", theme.muted)}>Priority</th>
              <th className={cn("p-3 text-left text-sm font-medium w-28", theme.muted)}>Domain</th>
              <th className={cn("p-3 text-left text-sm font-medium w-24", theme.muted)}>Effort</th>
              <th className={cn("p-3 text-left text-sm font-medium w-28", theme.muted)}>Team</th>
              <th className="p-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {tasks.map((task, idx) => {
                const statusConfig = STATUS_CONFIG[task.status]
                const priorityConfig = PRIORITY_CONFIG[task.priority]
                const team = teams.find((t) => t.id === task.teamId)
                const StatusIcon = statusConfig.icon

                return (
                  <motion.tr
                    key={task.id}
                    initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.02 }}
                    className={cn(
                      "border-b hover:bg-muted/50 transition-colors",
                      theme.border,
                      selectedTasks.has(task.id) && "bg-muted/30",
                    )}
                  >
                    <td className="p-3">
                      <Checkbox
                        checked={selectedTasks.has(task.id)}
                        onCheckedChange={(checked) => onSelectTask(task.id, !!checked)}
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        <span className={cn("font-medium", theme.text)}>{task.title}</span>
                        <span className={cn("text-xs line-clamp-1", theme.muted)}>{task.description}</span>
                        {task.labels.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {task.labels.slice(0, 3).map((label) => (
                              <Badge key={label} variant="outline" className="text-xs px-1.5 py-0">
                                {label}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-auto p-1.5 gap-1.5">
                            <StatusIcon className="w-3.5 h-3.5" style={{ color: statusConfig.color }} />
                            <span className="text-xs">{statusConfig.label}</span>
                            <ChevronDown className="w-3 h-3 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                            const Icon = config.icon
                            return (
                              <DropdownMenuItem
                                key={key}
                                onClick={() => onStatusChange(task, key as BacklogTaskStatus)}
                              >
                                <Icon className="w-4 h-4 mr-2" style={{ color: config.color }} />
                                {config.label}
                              </DropdownMenuItem>
                            )
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{ borderColor: priorityConfig.color, color: priorityConfig.color }}
                      >
                        {priorityConfig.label}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant="secondary" className="text-xs">
                        {task.domain}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <span className={cn("text-sm", theme.muted)}>{EFFORT_CONFIG[task.effort].label}</span>
                    </td>
                    <td className="p-3">
                      {team ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: team.color }} />
                          <span className={cn("text-sm", theme.muted)}>{team.name}</span>
                        </div>
                      ) : (
                        <span className={cn("text-sm", theme.muted)}>—</span>
                      )}
                    </td>
                    <td className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(task)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onDelete(task)} className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
          </tbody>
        </table>

        {tasks.length === 0 && (
          <div className="p-12 text-center">
            <ListTodo className={cn("w-12 h-12 mx-auto mb-4", theme.muted)} />
            <p className={cn("text-lg font-medium mb-1", theme.text)}>No tasks found</p>
            <p className={theme.muted}>Try adjusting your filters or create a new task</p>
          </div>
        )}
      </div>
    </Card>
  )
}

// ============================================
// KANBAN VIEW COMPONENT
// ============================================

function KanbanView({
  board,
  teams,
  theme,
  colors,
  reducedMotion,
  onStatusChange,
  onEdit,
}: {
  board: any
  teams: Team[]
  theme: any
  colors: any
  reducedMotion: boolean
  onStatusChange: (task: BacklogTask, status: BacklogTaskStatus) => void
  onEdit: (task: BacklogTask) => void
}) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {board.columns.map((column: any, colIdx: number) => {
        const statusConfig = STATUS_CONFIG[column.id as BacklogTaskStatus]

        return (
          <motion.div
            key={column.id}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: colIdx * 0.1 }}
            className="flex-shrink-0 w-72"
          >
            <div className={cn("p-3 rounded-t-lg border-t border-x", theme.card, theme.border)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusConfig.color }} />
                  <span className={cn("font-medium text-sm", theme.text)}>{column.title}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {column.tasks.length}
                </Badge>
              </div>
            </div>

            <div className={cn("p-2 rounded-b-lg border min-h-[500px] space-y-2", theme.card, theme.border)}>
              <AnimatePresence>
                {column.tasks.map((task: BacklogTask, taskIdx: number) => {
                  const priorityConfig = PRIORITY_CONFIG[task.priority]
                  const team = teams.find((t) => t.id === task.teamId)

                  return (
                    <motion.div
                      key={task.id}
                      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: taskIdx * 0.02 }}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer hover:border-foreground/20 transition-colors",
                        theme.card,
                        theme.border,
                      )}
                      onClick={() => onEdit(task)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={cn("font-medium text-sm line-clamp-2", theme.text)}>{task.title}</span>
                        <Badge
                          variant="outline"
                          className="text-xs shrink-0"
                          style={{ borderColor: priorityConfig.color, color: priorityConfig.color }}
                        >
                          {task.priority[0].toUpperCase()}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {task.domain}
                        </Badge>
                        {team && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: team.color }} />
                            <span className={cn("text-xs", theme.muted)}>{team.name}</span>
                          </div>
                        )}
                      </div>

                      {task.labels.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {task.labels.slice(0, 2).map((label) => (
                            <Badge key={label} variant="outline" className="text-xs px-1.5 py-0">
                              {label}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ============================================
// SPRINTS VIEW COMPONENT
// ============================================

function SprintsView({
  sprints,
  tasks,
  theme,
  colors,
  reducedMotion,
  onSelectSprint,
}: {
  sprints: Sprint[]
  tasks: BacklogTask[]
  theme: any
  colors: any
  reducedMotion: boolean
  onSelectSprint: (sprintId: string) => void
}) {
  const getSprintStats = (sprintId: string) => {
    const sprintTasks = tasks.filter((t) => t.sprintId === sprintId)
    return {
      total: sprintTasks.length,
      done: sprintTasks.filter((t) => t.status === "done").length,
      inProgress: sprintTasks.filter((t) => t.status === "in_progress").length,
    }
  }

  const STATUS_COLORS: Record<string, string> = {
    planning: "#6B7280",
    active: "#10B981",
    completed: "#6366F1",
    cancelled: "#EF4444",
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sprints.map((sprint, idx) => {
        const stats = getSprintStats(sprint.id)
        const progress = stats.total > 0 ? (stats.done / stats.total) * 100 : 0

        return (
          <motion.div
            key={sprint.id}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card
              className={cn("cursor-pointer hover:border-foreground/20 transition-colors", theme.card, theme.border)}
              onClick={() => onSelectSprint(sprint.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className={cn("text-lg", theme.text)}>{sprint.name}</CardTitle>
                    {sprint.goal && <CardDescription className="mt-1">{sprint.goal}</CardDescription>}
                  </div>
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: STATUS_COLORS[sprint.status],
                      color: STATUS_COLORS[sprint.status],
                    }}
                  >
                    {sprint.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className={theme.muted}>Progress</span>
                    <span className={theme.text}>{Math.round(progress)}%</span>
                  </div>
                  <div className={cn("h-2 rounded-full overflow-hidden", "bg-muted")}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: colors.primary,
                      }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className={cn("text-lg font-bold", theme.text)}>{stats.total}</p>
                    <p className={cn("text-xs", theme.muted)}>Total</p>
                  </div>
                  <div>
                    <p className={cn("text-lg font-bold", theme.text)}>{stats.inProgress}</p>
                    <p className={cn("text-xs", theme.muted)}>In Progress</p>
                  </div>
                  <div>
                    <p className={cn("text-lg font-bold", theme.text)}>{stats.done}</p>
                    <p className={cn("text-xs", theme.muted)}>Done</p>
                  </div>
                </div>

                {/* Dates */}
                {(sprint.startDate || sprint.endDate) && (
                  <div className={cn("mt-4 pt-4 border-t flex items-center gap-2 text-xs", theme.border, theme.muted)}>
                    <Calendar className="w-3.5 h-3.5" />
                    {sprint.startDate && <span>{sprint.startDate}</span>}
                    {sprint.startDate && sprint.endDate && <ArrowRight className="w-3 h-3" />}
                    {sprint.endDate && <span>{sprint.endDate}</span>}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

// ============================================
// CREATE TASK DIALOG
// ============================================

function CreateTaskDialog({
  open,
  onOpenChange,
  teams,
  sprints,
  workspaceId,
  theme,
  colors,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  teams: Team[]
  sprints: Sprint[]
  workspaceId: string
  theme: any
  colors: any
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [domain, setDomain] = useState<AllowedTaskDomain>("workspace")
  const [priority, setPriority] = useState<TaskPriority>("medium")
  const [effort, setEffort] = useState<TaskEffort>("medium")
  const [valueRationale, setValueRationale] = useState("")
  const [teamId, setTeamId] = useState<string>("none")
  const [sprintId, setSprintId] = useState<string>("backlog")
  const [labels, setLabels] = useState("")

  const handleSubmit = () => {
    if (!title || !description || !valueRationale) return

    createTask(workspaceId, {
      title,
      description,
      domain,
      priority,
      effort,
      valueRationale,
      teamId: teamId === "none" ? undefined : teamId,
      sprintId: sprintId === "backlog" ? undefined : sprintId,
      labels: labels ? labels.split(",").map((l) => l.trim()) : [],
    })

    // Reset form
    setTitle("")
    setDescription("")
    setDomain("workspace")
    setPriority("medium")
    setEffort("medium")
    setValueRationale("")
    setTeamId("none")
    setSprintId("backlog")
    setLabels("")

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>Add a new task to the backlog manually.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Domain</Label>
              <Select value={domain} onValueChange={(v) => setDomain(v as AllowedTaskDomain)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOMAINS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Effort</Label>
              <Select value={effort} onValueChange={(v) => setEffort(v as TaskEffort)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EFFORT_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="rationale">Value Rationale</Label>
            <Textarea
              id="rationale"
              value={valueRationale}
              onChange={(e) => setValueRationale(e.target.value)}
              placeholder="Why is this task valuable?"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Team</Label>
              <Select value={teamId} onValueChange={setTeamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No team</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Sprint</Label>
              <Select value={sprintId} onValueChange={setSprintId}>
                <SelectTrigger>
                  <SelectValue placeholder="Backlog" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  {sprints
                    .filter((s) => s.status !== "completed")
                    .map((sprint) => (
                      <SelectItem key={sprint.id} value={sprint.id}>
                        {sprint.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="labels">Labels (comma-separated)</Label>
            <Input
              id="labels"
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              placeholder="bug, feature, urgent"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title || !description || !valueRationale}
            style={{ backgroundColor: colors.primary }}
            className="text-white"
          >
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// EDIT TASK DIALOG
// ============================================

function EditTaskDialog({
  open,
  onOpenChange,
  task,
  teams,
  sprints,
  theme,
  colors,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: BacklogTask | null
  teams: Team[]
  sprints: Sprint[]
  theme: any
  colors: any
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [domain, setDomain] = useState<AllowedTaskDomain>("workspace")
  const [status, setStatus] = useState<BacklogTaskStatus>("proposed")
  const [priority, setPriority] = useState<TaskPriority>("medium")
  const [effort, setEffort] = useState<TaskEffort>("medium")
  const [valueRationale, setValueRationale] = useState("")
  const [teamId, setTeamId] = useState<string>("none")
  const [sprintId, setSprintId] = useState<string>("backlog")
  const [blockedReason, setBlockedReason] = useState("")
  const [labels, setLabels] = useState("")

  // Update form when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description)
      setDomain(task.domain)
      setStatus(task.status)
      setPriority(task.priority)
      setEffort(task.effort)
      setValueRationale(task.valueRationale)
      setTeamId(task.teamId || "none")
      setSprintId(task.sprintId || "backlog")
      setBlockedReason(task.blockedReason || "")
      setLabels(task.labels.join(", "))
    }
  }, [task])

  const handleSubmit = () => {
    if (!task || !title || !description || !valueRationale) return

    updateTask({
      id: task.id,
      title,
      description,
      domain,
      status,
      priority,
      effort,
      valueRationale,
      teamId: teamId === "none" ? null : teamId,
      sprintId: sprintId === "backlog" ? null : sprintId,
      blockedReason: status === "blocked" ? blockedReason : undefined,
      labels: labels ? labels.split(",").map((l) => l.trim()) : [],
    })

    onOpenChange(false)
  }

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>Update task details and status.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-title">Title</Label>
            <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as BacklogTaskStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Domain</Label>
              <Select value={domain} onValueChange={(v) => setDomain(v as AllowedTaskDomain)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOMAINS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {status === "blocked" && (
            <div>
              <Label htmlFor="blocked-reason">Blocked Reason</Label>
              <Textarea
                id="blocked-reason"
                value={blockedReason}
                onChange={(e) => setBlockedReason(e.target.value)}
                placeholder="Why is this task blocked?"
                rows={2}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Effort</Label>
              <Select value={effort} onValueChange={(v) => setEffort(v as TaskEffort)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EFFORT_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="edit-rationale">Value Rationale</Label>
            <Textarea
              id="edit-rationale"
              value={valueRationale}
              onChange={(e) => setValueRationale(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Team</Label>
              <Select value={teamId} onValueChange={setTeamId}>
                <SelectTrigger>
                  <SelectValue placeholder="No team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No team</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Sprint</Label>
              <Select value={sprintId} onValueChange={setSprintId}>
                <SelectTrigger>
                  <SelectValue placeholder="Backlog" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  {sprints.map((sprint) => (
                    <SelectItem key={sprint.id} value={sprint.id}>
                      {sprint.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="edit-labels">Labels (comma-separated)</Label>
            <Input id="edit-labels" value={labels} onChange={(e) => setLabels(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title || !description || !valueRationale}
            style={{ backgroundColor: colors.primary }}
            className="text-white"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
