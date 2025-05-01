"use client"

import React from "react"

import { useState, useEffect, useMemo, useRef } from "react"
import { ProgressBar } from "@/components/progress-bar"
import {
  format,
  isWithinInterval,
  addWeeks,
  startOfWeek,
  addDays,
  isSameDay,
  isWeekend,
  parseISO,
  isBefore,
  getMonth,
  getYear,
} from "date-fns"
import { ChevronRight, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Task, TaskType } from "@/lib/types"
import { taskTypeLabels, taskStatusLabels } from "@/lib/data"
import { cn } from "@/lib/utils"

interface GanttChartProps {
  tasks: Task[]
  filterType: "salesman" | "client" | "project"
  startDate: Date
  showAmounts: boolean
  isMobile?: boolean
  mobileViewMode?: "list" | "calendar"
}

// 商談前のタスクタイプ
const PRE_DEAL_TASK_TYPES: TaskType[] = ["meeting_designer", "meeting_developer", "proposal", "quotation"]

// 契約関連の重要な日付タスクタイプ
const CONTRACT_DATE_TASK_TYPES: TaskType[] = ["deal_date", "bid_date", "contract_date"]

// 商談後のタスクタイプ
const POST_DEAL_TASK_TYPES: TaskType[] = [
  "deal_closed",
  "bid_won",
  "deal_scale",
  "site_support",
  "delivery",
  "complaint",
  "change",
]

// プロジェクトごとの契約日を取得する関数
function getProjectContractDates(tasks: Task[]): Record<string, Date> {
  const projectContractDates: Record<string, Date> = {}

  // 各プロジェクトの契約関連日付を見つける
  tasks.forEach((task) => {
    if (CONTRACT_DATE_TASK_TYPES.includes(task.taskType as TaskType)) {
      const projectName = task.project
      const taskDate = new Date(task.startDate)

      // まだ記録されていないか、より早い日付の場合に更新
      if (!projectContractDates[projectName] || taskDate < projectContractDates[projectName]) {
        projectContractDates[projectName] = taskDate
      }
    }
  })

  return projectContractDates
}

// タスクタイプに基づいて色を取得する関数
function getTaskTypeColor(task: Task, projectContractDates: Record<string, Date>): string {
  if (!task.taskType) return "bg-gray-200 border-gray-400"

  // 契約関連の重要な日付は青色
  if (CONTRACT_DATE_TASK_TYPES.includes(task.taskType)) {
    return "bg-blue-200 border-blue-400"
  }

  const taskStartDate = new Date(task.startDate)
  const contractDate = projectContractDates[task.project]

  // 契約日が設定されていて、タスクが契約日以降の場合はグリーン
  if (contractDate && !isBefore(taskStartDate, contractDate)) {
    return "bg-green-200 border-green-400"
  }

  // 商談前のタスクはオレンジ
  if (PRE_DEAL_TASK_TYPES.includes(task.taskType)) {
    return "bg-orange-200 border-orange-400"
  }

  // その他のタスク
  return "bg-gray-200 border-gray-400"
}

// タスクタイプに基づいて進捗バーの色を取得する関数
function getTaskProgressColor(task: Task, projectContractDates: Record<string, Date>): string {
  if (!task.taskType) return "bg-gray-400"

  // 契約関連の重要な日付は青色
  if (CONTRACT_DATE_TASK_TYPES.includes(task.taskType)) {
    return "bg-blue-400"
  }

  const taskStartDate = new Date(task.startDate)
  const contractDate = projectContractDates[task.project]

  // 契約日が設定されていて、タスクが契約日以降の場合はグリーン
  if (contractDate && !isBefore(taskStartDate, contractDate)) {
    return "bg-green-400"
  }

  // 商談前のタスクはオレンジ
  if (PRE_DEAL_TASK_TYPES.includes(task.taskType)) {
    return "bg-orange-400"
  }

  // その他のタスク
  return "bg-gray-400"
}

export function GanttChart({
  tasks,
  filterType,
  startDate,
  showAmounts = false,
  isMobile = false,
  mobileViewMode = "list",
}: GanttChartProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // 表示する週数（スクロールで全体を見られるようにするため、多めに設定）
  const visibleWeekCount = isMobile ? 4 : 52 // PCでは1年分表示
  const totalWeekCount = 156 // 3年分の週数を確保

  // プロジェクトごとの契約日を取得
  const projectContractDates = useMemo(() => getProjectContractDates(tasks), [tasks])

  // Group tasks by the selected filter type
  const groupedTasks = useMemo(() => {
    return tasks.reduce(
      (acc, task) => {
        const key = task[filterType]
        if (!acc[key]) {
          acc[key] = []
        }
        acc[key].push(task)
        return acc
      },
      {} as Record<string, Task[]>,
    )
  }, [tasks, filterType])

  // Calculate group totals and progress
  const groupTotals = useMemo(() => {
    const totals: Record<string, { total: number; progress: number }> = {}

    Object.entries(groupedTasks).forEach(([group, groupTasks]) => {
      // Find unique projects in this group
      const projectsInGroup = [...new Set(groupTasks.map((task) => task.project))]

      let groupTotal = 0
      let groupProgress = 0

      // If filtering by project, use the project's total amount
      if (filterType === "project") {
        const firstTask = groupTasks[0]
        if (firstTask && firstTask.totalAmount) {
          groupTotal = firstTask.totalAmount

          // Calculate progress based on completed amounts
          const completedAmount = groupTasks.reduce((sum, task) => {
            if (task.amount && task.progress) {
              return sum + task.amount * (task.progress / 100)
            }
            return sum
          }, 0)

          groupProgress = groupTotal > 0 ? (completedAmount / groupTotal) * 100 : 0
        }
      }
      // If filtering by client or salesman, sum up the unique project totals
      else {
        projectsInGroup.forEach((project) => {
          const projectTasks = groupTasks.filter((task) => task.project === project)
          const firstProjectTask = projectTasks[0]

          if (firstProjectTask && firstProjectTask.totalAmount) {
            groupTotal += firstProjectTask.totalAmount

            // Calculate progress based on completed amounts for this project
            const completedAmount = projectTasks.reduce((sum, task) => {
              if (task.amount && task.progress) {
                return sum + task.amount * (task.progress / 100)
              }
              return sum
            }, 0)

            groupProgress +=
              firstProjectTask.totalAmount > 0
                ? (completedAmount / firstProjectTask.totalAmount) * firstProjectTask.totalAmount
                : 0
          }
        })

        // Calculate weighted average progress
        groupProgress = groupTotal > 0 ? (groupProgress / groupTotal) * 100 : 0
      }

      totals[group] = {
        total: groupTotal,
        progress: Math.round(groupProgress),
      }
    })

    return totals
  }, [groupedTasks, filterType])

  // Generate all week headers and day cells for the entire year
  const allWeekData = useMemo(() => {
    return Array.from({ length: totalWeekCount }, (_, weekIndex) => {
      const weekStart = startOfWeek(addWeeks(startDate, weekIndex), { weekStartsOn: 1 }) // 月曜始まり

      // 各週の日付を生成
      const days = Array.from({ length: 7 }, (_, dayIndex) => {
        const day = addDays(weekStart, dayIndex)
        return {
          date: day,
          dayOfMonth: format(day, "d"),
          dayOfWeek: format(day, "EEE"),
          isWeekend: isWeekend(day),
        }
      })

      return {
        weekIndex,
        weekNumber: weekIndex + 1,
        weekLabel: `W${weekIndex + 1}`,
        weekStart,
        weekEnd: addDays(weekStart, 6),
        dateRange: `(${format(weekStart, "MM/dd")}-${format(addDays(weekStart, 6), "MM/dd")})`,
        days,
      }
    })
  }, [startDate, totalWeekCount])

  // 月ごとのヘッダー情報を生成
  const monthHeaders = useMemo(() => {
    const months: { month: string; year: number; colSpan: number; startWeekIndex: number }[] = []
    let currentMonth = -1
    let currentYear = -1
    let colSpan = 0
    let startWeekIndex = 0

    allWeekData.slice(0, visibleWeekCount).forEach((week, index) => {
      const month = getMonth(week.weekStart)
      const year = getYear(week.weekStart)

      if (month !== currentMonth || year !== currentYear) {
        if (currentMonth !== -1) {
          months.push({
            month: format(new Date(currentYear, currentMonth, 1), "MMMM"),
            year: currentYear,
            colSpan: colSpan * 7, // 週数 × 7日
            startWeekIndex,
          })
          startWeekIndex = index
          colSpan = 1
        } else {
          colSpan = 1
        }
        currentMonth = month
        currentYear = year
      } else {
        colSpan++
      }
    })

    // 最後の月を追加
    if (currentMonth !== -1) {
      months.push({
        month: format(new Date(currentYear, currentMonth, 1), "MMMM"),
        year: currentYear,
        colSpan: colSpan * 7,
        startWeekIndex,
      })
    }

    return months
  }, [allWeekData, visibleWeekCount])

  // Toggle group expansion
  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }))
  }

  // Initialize all groups as expanded
  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {}
    Object.keys(groupedTasks).forEach((group) => {
      initialExpanded[group] = true
    })
    setExpandedGroups(initialExpanded)
  }, [groupedTasks])

  // Filter tasks based on date range
  useEffect(() => {
    const endDate = addWeeks(startDate, totalWeekCount)
    const filtered = tasks.filter(
      (task) =>
        isWithinInterval(new Date(task.startDate), { start: startDate, end: endDate }) ||
        isWithinInterval(new Date(task.endDate), { start: startDate, end: endDate }) ||
        (new Date(task.startDate) <= startDate && new Date(task.endDate) >= endDate),
    )
    setFilteredTasks(filtered)
  }, [tasks, startDate, totalWeekCount])

  // Get status badge color
  const getStatusColor = (status?: string) => {
    if (!status) return "bg-gray-200"

    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "in_progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "delayed":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "on_hold":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "cancelled":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  // Check if a task is active on a specific day
  const isTaskActiveOnDay = (task: Task, date: Date): boolean => {
    const taskStart = parseISO(task.startDate)
    const taskEnd = parseISO(task.endDate)
    return (
      isWithinInterval(date, { start: taskStart, end: taskEnd }) ||
      isSameDay(date, taskStart) ||
      isSameDay(date, taskEnd)
    )
  }

  // タスクタイプに基づいたバッジの色を取得
  const getTaskTypeBadgeColor = (task: Task) => {
    if (!task.taskType) return ""

    // 契約関連の重要な日付は青色
    if (CONTRACT_DATE_TASK_TYPES.includes(task.taskType)) {
      return "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300"
    }

    const taskStartDate = new Date(task.startDate)
    const contractDate = projectContractDates[task.project]

    // 契約日が設定されていて、タスクが契約日以降の場合はグリーン
    if (contractDate && !isBefore(taskStartDate, contractDate)) {
      return "bg-green-100 text-green-800 hover:bg-green-200 border-green-300"
    }

    // 商談前のタスクはオレンジ
    if (PRE_DEAL_TASK_TYPES.includes(task.taskType)) {
      return "bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-300"
    }

    return ""
  }

  // モバイル向けのリストビュー
  const renderMobileListView = () => {
    return (
      <div className="w-full">
        <div className="grid grid-cols-12 gap-2 text-xs font-medium mb-2 px-2">
          <div className="col-span-5">Task</div>
          <div className="col-span-5">Type</div>
          <div className="col-span-2">Start</div>
        </div>

        {Object.entries(groupedTasks).map(([group, groupTasks]) => (
          <React.Fragment key={group}>
            {/* Group Header */}
            <div
              className="bg-muted/50 p-2 rounded-md cursor-pointer mb-1 flex items-center justify-between"
              onClick={() => toggleGroup(group)}
            >
              <div className="flex items-center">
                {expandedGroups[group] ? (
                  <ChevronDown className="h-3 w-3 mr-1" />
                ) : (
                  <ChevronRight className="h-3 w-3 mr-1" />
                )}
                <span className="font-medium text-xs truncate">
                  {filterType === "salesman" ? "Salesman: " : filterType === "client" ? "Client: " : "Project: "}
                  {group}
                </span>
              </div>
              {showAmounts && groupTotals[group] && (
                <span className="text-xs">${groupTotals[group].total.toLocaleString()}</span>
              )}
            </div>

            {/* Group Tasks */}
            {expandedGroups[group] && (
              <div className="mb-4">
                {groupTasks.map((task) => (
                  <div key={task.id} className="border-b py-2 px-1 hover:bg-muted/10">
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5 truncate">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="truncate text-xs">{task.title}</div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <div className="space-y-1">
                                <p className="font-medium">{task.title}</p>
                                <p className="text-xs text-muted-foreground">{task.details}</p>
                                <div className="flex flex-wrap gap-1">
                                  <Badge variant="outline" className="text-xs">
                                    Priority: {task.priority}
                                  </Badge>
                                  <Badge className={cn("text-xs", getStatusColor(task.status))}>
                                    {task.status ? taskStatusLabels[task.status] : "Status Unknown"}
                                  </Badge>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="col-span-5">
                        {task.taskType && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs font-normal inline-block px-2 py-0.5 w-full text-center max-w-[120px] truncate",
                              getTaskTypeBadgeColor(task),
                            )}
                          >
                            {taskTypeLabels[task.taskType]}
                          </Badge>
                        )}
                      </div>
                      <div className="col-span-2 text-xs">{format(new Date(task.startDate), "MM/dd")}</div>
                    </div>
                    <div className="mt-1">
                      <ProgressBar progress={task.progress} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </React.Fragment>
        ))}

        {/* 色の凡例 */}
        <div className="mt-4 p-2 border rounded-md">
          <h4 className="text-xs font-medium mb-2">Legend:</h4>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-orange-100 text-orange-800 border-orange-300">Pre-Deal</Badge>
            <Badge className="bg-blue-100 text-blue-800 border-blue-300">Contract Date</Badge>
            <Badge className="bg-green-100 text-green-800 border-green-300">Post-Deal</Badge>
          </div>
        </div>
      </div>
    )
  }

  // モバイル向けのカレンダービュー
  const renderMobileCalendarView = () => {
    // 日付範囲を計算
    const firstWeek = allWeekData[0]
    const lastWeek = allWeekData[visibleWeekCount - 1]
    const dateRangeText = `(${format(firstWeek.weekStart, "MM/dd")}-${format(lastWeek.weekEnd, "MM/dd")})`

    return (
      <div className="w-full">
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[800px]">
            <table className="w-full border-collapse">
              {/* Header Rows */}
              <thead>
                {/* Month Row */}
                <tr className="bg-muted/50">
                  <th className="p-2 text-left sticky left-0 z-10 bg-muted/50" rowSpan={3}>
                    <span className="text-xs font-medium">Task {dateRangeText}</span>
                  </th>
                  {monthHeaders.map((month, index) => (
                    <th key={`month-${index}`} className="p-1 text-center border-l bg-muted/50" colSpan={month.colSpan}>
                      <div className="text-sm font-medium">
                        {month.month} {month.year}
                      </div>
                    </th>
                  ))}
                </tr>
                {/* Week Row */}
                <tr className="bg-muted/30">
                  {allWeekData.slice(0, visibleWeekCount).map((week) => (
                    <th
                      key={week.weekIndex}
                      className="p-1 text-center border-l"
                      colSpan={7} // 7日分の列をスパン
                    >
                      <div className="text-xs">{week.weekLabel}</div>
                      <div className="text-xs text-muted-foreground">{week.dateRange}</div>
                    </th>
                  ))}
                </tr>
                {/* Day Row */}
                <tr className="bg-muted/20">
                  {allWeekData.slice(0, visibleWeekCount).map((week) =>
                    week.days.map((day, dayIndex) => (
                      <th
                        key={`${week.weekIndex}-${dayIndex}`}
                        className={cn("p-1 text-center border-l text-xs w-8", day.isWeekend && "bg-muted/30")}
                      >
                        <div>{day.dayOfMonth}</div>
                      </th>
                    )),
                  )}
                </tr>
              </thead>
              <tbody>
                {/* Groups and Tasks */}
                {Object.entries(groupedTasks).map(([group, groupTasks]) => (
                  <React.Fragment key={group}>
                    {/* Group Header */}
                    <tr className="bg-muted/50 cursor-pointer group-header" onClick={() => toggleGroup(group)}>
                      <td className="p-2 sticky left-0 z-10 bg-muted/50">
                        <div className="flex items-center">
                          {expandedGroups[group] ? (
                            <ChevronDown className="h-3 w-3 mr-1" />
                          ) : (
                            <ChevronRight className="h-3 w-3 mr-1" />
                          )}
                          <span className="font-medium text-xs truncate">
                            {filterType === "salesman" ? "Salesman: " : filterType === "client" ? "Client: " : "Project: "}
                            {group}
                          </span>
                        </div>
                      </td>
                      <td colSpan={visibleWeekCount * 7} className="p-1 text-xs">
                        {showAmounts && groupTotals[group] && <span>${groupTotals[group].total.toLocaleString()}</span>}
                      </td>
                    </tr>

                    {/* Group Tasks */}
                    {expandedGroups[group] &&
                      groupTasks.map((task) => (
                        <tr key={task.id} className="border-b hover:bg-muted/10 task-item">
                          <td className="p-1 pl-6 sticky left-0 z-10 bg-background">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="truncate hover:text-primary cursor-help text-xs">
                                    <div>{task.title}</div>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-xs font-normal mt-1 max-w-[120px] truncate",
                                        getTaskTypeBadgeColor(task),
                                      )}
                                    >
                                      {taskTypeLabels[task.taskType as keyof typeof taskTypeLabels]}
                                    </Badge>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <div className="space-y-1">
                                    <p className="font-medium">{task.title}</p>
                                    <p className="text-xs text-muted-foreground">{task.details}</p>
                                    <div className="flex flex-wrap gap-1">
                                      <Badge variant="outline" className="text-xs">
                                        Priority: {task.priority}
                                      </Badge>
                                      <Badge className={cn("text-xs", getStatusColor(task.status))}>
                                        {task.status ? taskStatusLabels[task.status] : "Status Unknown"}
                                      </Badge>
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </td>

                          {/* Task Timeline - Day by Day */}
                          {allWeekData.slice(0, visibleWeekCount).map((week) =>
                            week.days.map((day, dayIndex) => {
                              const isActive = isTaskActiveOnDay(task, day.date)
                              const taskStart = parseISO(task.startDate)
                              const taskEnd = parseISO(task.endDate)
                              const isStartDay = isSameDay(day.date, taskStart)
                              const isEndDay = isSameDay(day.date, taskEnd)

                              return (
                                <td
                                  key={`${week.weekIndex}-${dayIndex}`}
                                  className={cn("p-0 border-l h-8 relative", day.isWeekend && "bg-muted/10")}
                                >
                                  {isActive && (
                                    <div
                                      className={cn(
                                        "absolute inset-0 m-1 rounded-sm border",
                                        getTaskTypeColor(task, projectContractDates),
                                        isStartDay && "rounded-l-sm",
                                        isEndDay && "rounded-r-sm",
                                      )}
                                    >
                                      <div
                                        className={cn(
                                          "h-full rounded-sm",
                                          getTaskProgressColor(task, projectContractDates),
                                        )}
                                        style={{ width: `${task.progress}%` }}
                                      />
                                    </div>
                                  )}
                                </td>
                              )
                            }),
                          )}
                        </tr>
                      ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 色の凡例 */}
        <div className="mt-4 p-2 border rounded-md legend">
          <h4 className="text-xs font-medium mb-2">Legend:</h4>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-orange-100 text-orange-800 border-orange-300">Pre-Deal</Badge>
            <Badge className="bg-blue-100 text-blue-800 border-blue-300">Contract Date</Badge>
            <Badge className="bg-green-100 text-green-800 border-green-300">Post-Deal</Badge>
          </div>
        </div>
      </div>
    )
  }

  // モバイル向けのビュー選択
  if (isMobile) {
    return mobileViewMode === "list" ? renderMobileListView() : renderMobileCalendarView()
  }

  // PC向けのビュー（リストとカレンダーを横並びに表示）
  // 日付範囲を計算
  const firstWeek = allWeekData[0]
  const lastWeek = allWeekData[visibleWeekCount - 1]
  const dateRangeText = `(${format(firstWeek.weekStart, "MM/dd")}-${format(lastWeek.weekEnd, "MM/dd")})`

  return (
    <div className="w-full" ref={scrollContainerRef}>
      <div className="overflow-x-auto">
        <div className="min-w-[5000px]">
          <table className="w-full border-collapse">
            {/* Header Rows */}
            <thead>
              {/* Month Row */}
              <tr className="bg-muted/50">
                <th className="p-2 text-left w-40 sticky left-0 z-10 bg-background" rowSpan={3}>
                  <span className="text-xs font-medium">Task</span>
                </th>
                <th className="p-2 text-left w-40 sticky left-40 z-10 bg-background" rowSpan={3}>
                  <span className="text-xs font-medium">Type</span>
                </th>
                {monthHeaders.map((month, index) => (
                  <th key={`month-${index}`} className="p-1 text-center border-l bg-muted/50" colSpan={month.colSpan}>
                    <div className="text-sm font-medium">
                      {month.month} {month.year}
                    </div>
                  </th>
                ))}
              </tr>
              {/* Week Row */}
              <tr className="bg-muted/30">
                {allWeekData.slice(0, visibleWeekCount).map((week) => (
                  <th
                    key={week.weekIndex}
                    className="p-1 text-center border-l"
                    colSpan={7} // 7日分の列をスパン
                  >
                    <div className="text-xs">{week.weekLabel}</div>
                    <div className="text-xs text-muted-foreground">{week.dateRange}</div>
                  </th>
                ))}
              </tr>
              {/* Day Row */}
              <tr className="bg-muted/20">
                {allWeekData.slice(0, visibleWeekCount).map((week) =>
                  week.days.map((day, dayIndex) => (
                    <th
                      key={`${week.weekIndex}-${dayIndex}`}
                      className={cn("p-1 text-center border-l text-xs w-8", day.isWeekend && "bg-muted/30")}
                    >
                      <div>{day.dayOfMonth}</div>
                    </th>
                  )),
                )}
              </tr>
            </thead>
            <tbody>
              {/* Groups and Tasks */}
              {Object.entries(groupedTasks).map(([group, groupTasks]) => (
                <React.Fragment key={group}>
                  {/* Group Header */}
                  <tr className="bg-muted/50 cursor-pointer group-header" onClick={() => toggleGroup(group)}>
                    <td className="p-2 sticky left-0 z-10 bg-muted/50">
                      <div className="flex items-center">
                        {expandedGroups[group] ? (
                          <ChevronDown className="h-3 w-3 mr-1" />
                        ) : (
                          <ChevronRight className="h-3 w-3 mr-1" />
                        )}
                        <span className="font-medium text-xs truncate">
                          {filterType === "salesman" ? "Salesman: " : filterType === "client" ? "Client: " : "Project: "}
                          {group}
                        </span>
                      </div>
                    </td>
                    <td className="p-2 sticky left-40 z-10 bg-muted/50">
                      {showAmounts && groupTotals[group] && <span>${groupTotals[group].total.toLocaleString()}</span>}
                    </td>
                    <td colSpan={visibleWeekCount * 7}></td>
                  </tr>

                  {/* Group Tasks */}
                  {expandedGroups[group] &&
                    groupTasks.map((task) => (
                      <tr key={task.id} className="border-b hover:bg-muted/10 task-item">
                        <td className="p-1 pl-6 sticky left-0 z-10 bg-background">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="truncate hover:text-primary cursor-help text-xs">
                                  <div>{task.title}</div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <div className="space-y-1">
                                  <p className="font-medium">{task.title}</p>
                                  <p className="text-xs text-muted-foreground">{task.details}</p>
                                  <div className="flex flex-wrap gap-1">
                                    <Badge variant="outline" className="text-xs">
                                      Priority: {task.priority}
                                    </Badge>
                                    <Badge className={cn("text-xs", getStatusColor(task.status))}>
                                      {task.status ? taskStatusLabels[task.status] : "Status Unknown"}
                                    </Badge>
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                        <td className="p-1 sticky left-40 z-10 bg-background">
                          {task.taskType && (
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs font-normal inline-block px-2 py-0.5 w-full text-center max-w-[120px] truncate",
                                getTaskTypeBadgeColor(task),
                              )}
                            >
                              {taskTypeLabels[task.taskType]}
                            </Badge>
                          )}
                        </td>

                        {/* Task Timeline - Day by Day */}
                        {allWeekData.slice(0, visibleWeekCount).map((week) =>
                          week.days.map((day, dayIndex) => {
                            const isActive = isTaskActiveOnDay(task, day.date)
                            const taskStart = parseISO(task.startDate)
                            const taskEnd = parseISO(task.endDate)
                            const isStartDay = isSameDay(day.date, taskStart)
                            const isEndDay = isSameDay(day.date, taskEnd)

                            return (
                              <td
                                key={`${week.weekIndex}-${dayIndex}`}
                                className={cn("p-0 border-l h-8 relative", day.isWeekend && "bg-muted/10")}
                              >
                                {isActive && (
                                  <div
                                    className={cn(
                                      "absolute inset-0 m-1 rounded-sm border",
                                      getTaskTypeColor(task, projectContractDates),
                                      isStartDay && "rounded-l-sm",
                                      isEndDay && "rounded-r-sm",
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        "h-full rounded-sm",
                                        getTaskProgressColor(task, projectContractDates),
                                      )}
                                      style={{ width: `${task.progress}%` }}
                                    />
                                  </div>
                                )}
                              </td>
                            )
                          }),
                        )}
                      </tr>
                    ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 色の凡例 */}
      <div className="mt-4 p-2 border rounded-md legend">
        <h4 className="text-xs font-medium mb-2">Legend:</h4>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-orange-100 text-orange-800 border-orange-300">Pre-Deal</Badge>
          <Badge className="bg-blue-100 text-blue-800 border-blue-300">Contract Date</Badge>
          <Badge className="bg-green-100 text-green-800 border-green-300">Post-Deal</Badge>
        </div>
      </div>
    </div>
  )
}
