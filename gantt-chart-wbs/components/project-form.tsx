"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Project } from "@/lib/types"

interface ProjectFormProps {
  project?: Project
  onSubmit: (project: Project) => void
  onCancel: () => void
  onDelete?: () => void
}

export function ProjectForm({ project, onSubmit, onCancel, onDelete }: ProjectFormProps) {
  const [name, setName] = useState(project?.name || "")
  const [client, setClient] = useState(project?.client || "")
  const [totalAmount, setTotalAmount] = useState(project?.totalAmount?.toString() || "")
  const [startDate, setStartDate] = useState<Date | undefined>(
    project?.startDate ? new Date(project.startDate) : undefined,
  )
  const [endDate, setEndDate] = useState<Date | undefined>(project?.endDate ? new Date(project.endDate) : undefined)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !client || !startDate || !endDate) {
      alert("Please fill in all required fields")
      return
    }

    const updatedProject: Project = {
      id: project?.id || `project-${Date.now()}`,
      name,
      client,
      totalAmount: totalAmount ? Number.parseInt(totalAmount, 10) : 0,
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
      tasks: project?.tasks || [],
      amountProgress: project?.amountProgress || 0,
    }

    onSubmit(updatedProject)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Project Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter project name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="client">Client *</Label>
          <Input
            id="client"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            placeholder="Enter client name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalAmount">Total Amount</Label>
          <Input
            id="totalAmount"
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            placeholder="Enter total project amount"
          />
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
      </div>

      <div className="flex justify-between">
        <div>
          {onDelete && (
            <Button type="button" variant="destructive" onClick={onDelete} className="gap-1">
              <Trash2 className="h-4 w-4" />
              Delete Project
            </Button>
          )}
        </div>
        <div className="flex space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{project ? "Update Project" : "Create Project"}</Button>
        </div>
      </div>
    </form>
  )
}
