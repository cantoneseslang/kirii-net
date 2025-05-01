"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface TaskFilterProps {
  filterType: "salesman" | "client" | "project"
  onFilterChange: (type: "salesman" | "client" | "project") => void
  startDate: Date
  onStartDateChange: (date: Date) => void
  hideGroupBy?: boolean
  isMobile?: boolean
  className?: string
}

export function TaskFilter({
  filterType,
  onFilterChange,
  startDate,
  onStartDateChange,
  hideGroupBy = false,
  isMobile = false,
  className,
}: TaskFilterProps) {
  const dateDisplay = format(startDate, "MMM d, yyyy")

  const filterContent = (
    <>
      {!hideGroupBy && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Group By</h3>
          <RadioGroup
            defaultValue={filterType}
            onValueChange={(value) => onFilterChange(value as "salesman" | "client" | "project")}
            className="flex flex-row space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="salesman" id="salesman" />
              <Label htmlFor="salesman">Salesman</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="client" id="client" />
              <Label htmlFor="client">Client</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="project" id="project" />
              <Label htmlFor="project">Project</Label>
            </div>
          </RadioGroup>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Start Date</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant={"outline"} className={cn("w-full sm:w-[240px] justify-start text-left font-normal")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateDisplay}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => date && onStartDateChange(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </>
  )

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className={cn("w-full flex justify-between", className)}>
            <span>Filters</span>
            <span className="text-xs text-muted-foreground">
              {!hideGroupBy && `${filterType} · `}
              {dateDisplay}
            </span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto pb-8">
          <div className="space-y-4 pt-4">{filterContent}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className={cn("flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-muted/30", className)}>
      {filterContent}
    </div>
  )
}
