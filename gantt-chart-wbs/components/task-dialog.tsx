"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TaskForm } from "@/components/task-form"
import { Plus } from "lucide-react"
import type { Task } from "@/lib/types"

interface TaskDialogProps {
  task?: Task
  onSave: (task: Task) => void
  onDelete?: (taskId: string) => void
  trigger?: React.ReactNode
  title?: string
}

export function TaskDialog({ task, onSave, onDelete, trigger, title }: TaskDialogProps) {
  const [open, setOpen] = useState(false)

  const handleSave = (updatedTask: Task) => {
    onSave(updatedTask)
    setOpen(false)
  }

  const handleDelete = () => {
    if (task && onDelete) {
      onDelete(task.id)
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            {task ? "Edit Task" : "Add Task"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title || (task ? "Edit Task" : "Add New Task")}</DialogTitle>
        </DialogHeader>
        <TaskForm
          task={task}
          onSubmit={handleSave}
          onCancel={() => setOpen(false)}
          onDelete={task && onDelete ? handleDelete : undefined}
        />
      </DialogContent>
    </Dialog>
  )
}
