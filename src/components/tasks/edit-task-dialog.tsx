"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { updateTask } from "@/domains/task-generation/backlog"
import type { BacklogTask, BacklogTaskStatus, Sprint, Team } from "@/domains/task-generation/backlog.types"
import type { AllowedTaskDomain, TaskPriority, TaskEffort } from "@/domains/task-generation/task-generation.types"

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

const STATUS_CONFIG: Record<BacklogTaskStatus, { label: string }> = {
  proposed: { label: "Proposed" },
  approved: { label: "Approved" },
  in_progress: { label: "In Progress" },
  blocked: { label: "Blocked" },
  rejected: { label: "Rejected" },
  done: { label: "Done" },
}

const PRIORITY_CONFIG: Record<TaskPriority, { label: string }> = {
  critical: { label: "Critical" },
  high: { label: "High" },
  medium: { label: "Medium" },
  low: { label: "Low" },
}

const EFFORT_CONFIG: Record<TaskEffort, { label: string }> = {
  small: { label: "Small" },
  medium: { label: "Medium" },
  large: { label: "Large" },
}

interface EditTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: BacklogTask | null
  teams: Team[]
  sprints: Sprint[]
  colors: { primary: string }
}

export function EditTaskDialog({ open, onOpenChange, task, teams, sprints, colors }: EditTaskDialogProps) {
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
