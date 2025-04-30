"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ProjectForm } from "@/components/project-form"
import { Plus } from "lucide-react"
import type { Project } from "@/lib/types"

interface ProjectDialogProps {
  project?: Project
  onSave: (project: Project) => void
  onDelete?: (projectId: string) => void
  trigger?: React.ReactNode
  title?: string
}

export function ProjectDialog({ project, onSave, onDelete, trigger, title }: ProjectDialogProps) {
  const [open, setOpen] = useState(false)

  const handleSave = (updatedProject: Project) => {
    onSave(updatedProject)
    setOpen(false)
  }

  const handleDelete = () => {
    if (project && onDelete) {
      onDelete(project.id)
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            {project ? "Edit Project" : "Add Project"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title || (project ? "Edit Project" : "Add New Project")}</DialogTitle>
        </DialogHeader>
        <ProjectForm
          project={project}
          onSubmit={handleSave}
          onCancel={() => setOpen(false)}
          onDelete={project && onDelete ? handleDelete : undefined}
        />
      </DialogContent>
    </Dialog>
  )
}
