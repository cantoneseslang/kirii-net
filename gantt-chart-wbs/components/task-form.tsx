"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { CalendarIcon, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { taskTypeLabels, taskStatusLabels, sampleProjects } from "@/lib/data"
import type { Task, TaskType, TaskStatus } from "@/lib/types"

interface TaskFormProps {
  task?: Task
  onSubmit: (task: Task) => void
  onCancel: () => void
  onDelete?: () => void
}

export function TaskForm({ task, onSubmit, onCancel, onDelete }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || "")
  const [description, setDescription] = useState(task?.details || "")
  const [startDate, setStartDate] = useState<Date | undefined>(task?.startDate ? new Date(task.startDate) : undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(task?.endDate ? new Date(task.endDate) : undefined)
  const [assignee, setAssignee] = useState(task?.assignee || "")
  const [client, setClient] = useState(task?.client || "")
  const [project, setProject] = useState(task?.project || "")
  const [taskType, setTaskType] = useState<TaskType | undefined>(task?.taskType)
  const [status, setStatus] = useState<TaskStatus | undefined>(task?.status)
  const [amount, setAmount] = useState(task?.amount?.toString() || "")
  const [progress, setProgress] = useState(task?.progress?.toString() || "0")

  // Get unique clients and projects from sample data
  const uniqueClients = [...new Set(sampleProjects.map((p) => p.client))]
  const uniqueProjects = [...new Set(sampleProjects.map((p) => p.name))]

  // Update client when project changes
  const handleProjectChange = (selectedProject: string) => {
    setProject(selectedProject)
    const projectData = sampleProjects.find((p) => p.name === selectedProject)
    if (projectData) {
      setClient(projectData.client)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !startDate || !endDate || !assignee || !client || !project || !taskType || !status) {
      alert("Please fill in all required fields")
      return
    }

    const updatedTask: Task = {
      id: task?.id || `task-${Date.now()}`,
      title,
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
      progress: Number.parseInt(progress, 10),
      assignee,
      client,
      project,
      taskType,
      status,
      details: description,
      amount: amount ? Number.parseInt(amount, 10) : undefined,
      priority: task?.priority || "medium",
      dependencies: task?.dependencies || [],
    }

    onSubmit(updatedTask)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Task Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-type">Task Type *</Label>
          <Select value={taskType} onValueChange={(value) => setTaskType(value as TaskType)} required>
            <SelectTrigger>
              <SelectValue placeholder="Select task type" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(taskTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Start Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>End Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="assignee">Assignee *</Label>
          <Input
            id="assignee"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            placeholder="Enter assignee name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="project">Project *</Label>
          <Select value={project} onValueChange={handleProjectChange} required>
            <SelectTrigger>
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {uniqueProjects.map((projectName) => (
                <SelectItem key={projectName} value={projectName}>
                  {projectName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="client">Client *</Label>
          <Select value={client} onValueChange={setClient} required>
            <SelectTrigger>
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              {uniqueClients.map((clientName) => (
                <SelectItem key={clientName} value={clientName}>
                  {clientName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)} required>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(taskStatusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount (if applicable)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="progress">Progress (%) *</Label>
          <Input
            id="progress"
            type="number"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(e.target.value)}
            placeholder="Enter progress percentage"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Details</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task details"
          rows={4}
        />
      </div>

      <div className="flex justify-between">
        <div>
          {onDelete && (
            <Button type="button" variant="destructive" onClick={onDelete} className="gap-1">
              <Trash2 className="h-4 w-4" />
              Delete Task
            </Button>
          )}
        </div>
        <div className="flex space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{task ? "Update Task" : "Create Task"}</Button>
        </div>
      </div>
    </form>
  )
}
