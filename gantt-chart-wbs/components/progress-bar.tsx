interface ProgressBarProps {
  progress: number
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="flex items-center space-x-2">
      <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
      </div>
      <span className="text-xs text-muted-foreground">{progress}%</span>
    </div>
  )
}
