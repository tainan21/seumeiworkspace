"use client"

import { useState } from "react"
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
import { createTask } from "@/domains/task-generation/backlog"
import type { Sprint, Team } from "@/domains/task-generation/backlog.types"
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

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teams: Team[]
  sprints: Sprint[]
  workspaceId: string
  colors: { primary: string }
}

export function CreateTaskDialog({ open, onOpenChange, teams, sprints, workspaceId, colors }: CreateTaskDialogProps) {
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
