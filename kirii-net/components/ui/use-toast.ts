"use client"

// Simplified version of the use-toast hook
import { useState } from "react"

type ToastProps = {
  title?: string
  description?: string
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = (props: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prevToasts) => [...prevToasts, { ...props, id }])

    // In a real implementation, this would show a toast notification
    console.log("Toast:", props.title, props.description)

    // Auto dismiss after duration
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    }, props.duration || 3000)
  }

  return { toast, toasts }
}
