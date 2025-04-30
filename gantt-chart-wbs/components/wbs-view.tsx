"use client"

import { useState, useMemo } from "react"
import { ProgressBar } from "@/components/progress-bar"
import { ChevronRight, ChevronDown, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Task, TaskType } from "@/lib/types"
import { taskTypeLabels, taskStatusLabels } from "@/lib/data"
import { cn } from "@/lib/utils"
import { isBefore } from "date-fns"

interface WBSViewProps {
  tasks: Task[]
  showAmounts: boolean
  isMobile?: boolean
}

interface ProjectNode {
  name: string
  tasks: Task[]
  totalAmount: number
  progress: number
  clients: Map<string, ClientNode>
}

interface ClientNode {
  name: string
  tasks: Task[]
  totalAmount: number
  progress: number
  taskTypes: Map<string, TaskTypeNode>
}

interface TaskTypeNode {
  type: string
  tasks: Task[]
  totalAmount: number
  progress: number
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

// タスクタイプに基づいてバッジの色を取得する関数
function getTaskTypeBadgeColor(task: Task, projectContractDates: Record<string, Date>): string {
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

export function WBSView({ tasks, showAmounts, isMobile = false }: WBSViewProps) {
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({})
  const [expandedClients, setExpandedClients] = useState<Record<string, boolean>>({})
  const [expandedTaskTypes, setExpandedTaskTypes] = useState<Record<string, boolean>>({})

  // プロジェクトごとの契約日を取得
  const projectContractDates = useMemo(() => getProjectContractDates(tasks), [tasks])

  // Build WBS hierarchy
  const wbsData = useMemo(() => {
    // Step 1: Group by project
    const projectMap = new Map<string, ProjectNode>()

    tasks.forEach((task) => {
      // Initialize project if not exists
      if (!projectMap.has(task.project)) {
        projectMap.set(task.project, {
          name: task.project,
          tasks: [],
          totalAmount: 0,
          progress: 0,
          clients: new Map(),
        })
      }

      const projectNode = projectMap.get(task.project)!
      projectNode.tasks.push(task)

      // Calculate project total amount
      if (task.totalAmount && task.totalAmount > 0) {
        projectNode.totalAmount = task.totalAmount
      }

      // Initialize client if not exists
      if (!projectNode.clients.has(task.client)) {
        projectNode.clients.set(task.client, {
          name: task.client,
          tasks: [],
          totalAmount: 0,
          progress: 0,
          taskTypes: new Map(),
        })
      }

      const clientNode = projectNode.clients.get(task.client)!
      clientNode.tasks.push(task)

      // Initialize task type if not exists
      const taskType = task.taskType || "other"
      if (!clientNode.taskTypes.has(taskType)) {
        clientNode.taskTypes.set(taskType, {
          type: taskType,
          tasks: [],
          totalAmount: 0,
          progress: 0,
        })
      }

      const taskTypeNode = clientNode.taskTypes.get(taskType)!
      taskTypeNode.tasks.push(task)

      // Add amount to task type
      if (task.amount && task.amount > 0) {
        taskTypeNode.totalAmount += task.amount
        clientNode.totalAmount += task.amount
      }
    })

    // Calculate progress for each level
    projectMap.forEach((project) => {
      let projectCompletedAmount = 0
      let projectTotalAmount = 0

      project.clients.forEach((client) => {
        let clientCompletedAmount = 0
        let clientTotalAmount = 0

        client.taskTypes.forEach((taskType) => {
          let typeCompletedAmount = 0
          let typeTotalAmount = 0

          taskType.tasks.forEach((task) => {
            if (task.amount && task.amount > 0) {
              typeTotalAmount += task.amount
              typeCompletedAmount += task.amount * (task.progress / 100)
            }
          })

          taskType.progress = typeTotalAmount > 0 ? Math.round((typeCompletedAmount / typeTotalAmount) * 100) : 0

          clientTotalAmount += typeTotalAmount
          clientCompletedAmount += typeCompletedAmount
        })

        client.progress = clientTotalAmount > 0 ? Math.round((clientCompletedAmount / clientTotalAmount) * 100) : 0

        projectTotalAmount += clientTotalAmount
        projectCompletedAmount += clientCompletedAmount
      })

      project.progress = projectTotalAmount > 0 ? Math.round((projectCompletedAmount / projectTotalAmount) * 100) : 0
    })

    return Array.from(projectMap.values())
  }, [tasks])

  // Initialize expanded states
  useMemo(() => {
    const projectStates: Record<string, boolean> = {}
    const clientStates: Record<string, boolean> = {}
    const taskTypeStates: Record<string, boolean> = {}

    wbsData.forEach((project) => {
      projectStates[project.name] = true

      project.clients.forEach((client) => {
        const clientKey = `${project.name}:${client.name}`
        clientStates[clientKey] = true

        client.taskTypes.forEach((taskType) => {
          const taskTypeKey = `${clientKey}:${taskType.type}`
          taskTypeStates[taskTypeKey] = true
        })
      })
    })

    setExpandedProjects(projectStates)
    setExpandedClients(clientStates)
    setExpandedTaskTypes(taskTypeStates)
  }, [wbsData])

  // Toggle functions
  const toggleProject = (projectName: string) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [projectName]: !prev[projectName],
    }))
  }

  const toggleClient = (projectName: string, clientName: string) => {
    const key = `${projectName}:${clientName}`
    setExpandedClients((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const toggleTaskType = (projectName: string, clientName: string, taskType: string) => {
    const key = `${projectName}:${clientName}:${taskType}`
    setExpandedTaskTypes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

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

  // モバイル向けのシンプルなビュー
  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-12 gap-2 text-xs font-medium px-2">
          <div className="col-span-6">Item</div>
          {showAmounts && <div className="col-span-2">Amount</div>}
          <div className="col-span-2">Progress</div>
          <div className="col-span-4">Status</div>
        </div>

        {wbsData.map((project) => (
          <div key={project.name} className="space-y-1">
            {/* Project Level */}
            <div className="bg-muted p-2 rounded-md cursor-pointer" onClick={() => toggleProject(project.name)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {expandedProjects[project.name] ? (
                    <ChevronDown className="h-4 w-4 mr-1 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-1 flex-shrink-0" />
                  )}
                  <span className="truncate text-sm font-medium">Project: {project.name}</span>
                </div>
                {showAmounts && <span className="text-xs">${project.totalAmount.toLocaleString()}</span>}
              </div>
              <div className="mt-1">
                <ProgressBar progress={project.progress} />
              </div>
            </div>

            {/* Client Level */}
            {expandedProjects[project.name] &&
              Array.from(project.clients.values()).map((client) => (
                <div key={`${project.name}-${client.name}`} className="ml-4 space-y-1">
                  <div
                    className="bg-accent/20 p-2 rounded-md cursor-pointer"
                    onClick={() => toggleClient(project.name, client.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {expandedClients[`${project.name}:${client.name}`] ? (
                          <ChevronDown className="h-4 w-4 mr-1 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 mr-1 flex-shrink-0" />
                        )}
                        <span className="truncate text-sm">Client: {client.name}</span>
                      </div>
                      {showAmounts && <span className="text-xs">${client.totalAmount.toLocaleString()}</span>}
                    </div>
                    <div className="mt-1">
                      <ProgressBar progress={client.progress} />
                    </div>
                  </div>

                  {/* Task Type Level */}
                  {expandedClients[`${project.name}:${client.name}`] &&
                    Array.from(client.taskTypes.values()).map((taskType) => (
                      <div key={`${project.name}-${client.name}-${taskType.type}`} className="ml-4 space-y-1">
                        <div
                          className="bg-background border p-2 rounded-md cursor-pointer"
                          onClick={() => toggleTaskType(project.name, client.name, taskType.type)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {expandedTaskTypes[`${project.name}:${client.name}:${taskType.type}`] ? (
                                <ChevronDown className="h-4 w-4 mr-1 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="h-4 w-4 mr-1 flex-shrink-0" />
                              )}
                              <span className="truncate text-xs">
                                {taskTypeLabels[taskType.type as keyof typeof taskTypeLabels] || taskType.type}
                              </span>
                            </div>
                            {showAmounts && <span className="text-xs">${taskType.totalAmount.toLocaleString()}</span>}
                          </div>
                          <div className="mt-1">
                            <ProgressBar progress={taskType.progress} />
                          </div>
                          <div className="mt-1">
                            <Badge
                              className={cn(
                                "text-xs",
                                CONTRACT_DATE_TASK_TYPES.includes(taskType.type as TaskType)
                                  ? "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300"
                                  : getTaskTypeBadgeColor(
                                      { ...taskType.tasks[0], taskType: taskType.type as TaskType },
                                      projectContractDates,
                                    ),
                              )}
                            >
                              {taskTypeLabels[taskType.type as keyof typeof taskTypeLabels] || taskType.type}
                            </Badge>
                          </div>
                        </div>

                        {/* Individual Tasks */}
                        {expandedTaskTypes[`${project.name}:${client.name}:${taskType.type}`] &&
                          taskType.tasks.map((task) => (
                            <TooltipProvider key={task.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="ml-4 p-2 border-l-2 border-l-muted hover:bg-muted/5 rounded-md cursor-help">
                                    <div className="flex justify-between items-center">
                                      <div className="truncate text-xs">{task.title}</div>
                                      {showAmounts && task.amount ? (
                                        <span className="text-xs">${task.amount.toLocaleString()}</span>
                                      ) : null}
                                    </div>
                                    <div className="mt-1">
                                      <ProgressBar progress={task.progress} />
                                    </div>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      <Badge variant="outline" className={cn("text-xs", getStatusColor(task.status))}>
                                        {task.status ? taskStatusLabels[task.status] : "Status Unknown"}
                                      </Badge>
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <div className="space-y-1">
                                    <p className="font-medium">{task.title}</p>
                                    <p className="text-xs text-muted-foreground">{task.details}</p>
                                    <div className="flex justify-between text-xs">
                                      <span>From: {new Date(task.startDate).toLocaleDateString()}</span>
                                      <span>To: {new Date(task.endDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center space-x-1 text-xs">
                                      <span className="font-medium">Assignee:</span>
                                      <span>{task.assignee}</span>
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                      </div>
                    ))}
                </div>
              ))}
          </div>
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

  // デスクトップ向けの通常ビュー
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-sm font-medium px-4 py-2 bg-muted/30 rounded-md">
        <div className="md:col-span-4">Item</div>
        {showAmounts && <div className="md:col-span-2">Amount</div>}
        <div className="md:col-span-2">Progress</div>
        <div className="md:col-span-4">Status</div>
      </div>

      {/* WBS Hierarchy */}
      {wbsData.map((project) => (
        <div key={project.name} className="space-y-1">
          {/* Project Level */}
          <div
            className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-4 py-3 bg-muted rounded-md cursor-pointer hover:bg-muted/80"
            onClick={() => toggleProject(project.name)}
          >
            <div className="md:col-span-4 font-medium flex items-center">
              {expandedProjects[project.name] ? (
                <ChevronDown className="h-4 w-4 mr-2 flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2 flex-shrink-0" />
              )}
              <span className="truncate">Project: {project.name}</span>
            </div>

            {showAmounts && (
              <div className="md:col-span-2 flex items-center">
                <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>{project.totalAmount.toLocaleString()}</span>
              </div>
            )}

            <div className="md:col-span-2 flex items-center space-x-2">
              <ProgressBar progress={project.progress} />
            </div>

            <div className="md:col-span-4">
              <Badge variant="outline" className="bg-primary/10">
                Project
              </Badge>
            </div>
          </div>

          {/* Client Level */}
          {expandedProjects[project.name] &&
            Array.from(project.clients.values()).map((client) => (
              <div key={`${project.name}-${client.name}`} className="ml-6 space-y-1">
                <div
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-4 py-2 bg-accent/20 rounded-md cursor-pointer hover:bg-accent/30"
                  onClick={() => toggleClient(project.name, client.name)}
                >
                  <div className="md:col-span-4 flex items-center">
                    {expandedClients[`${project.name}:${client.name}`] ? (
                      <ChevronDown className="h-4 w-4 mr-2 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-2 flex-shrink-0" />
                    )}
                    <span className="truncate">Client: {client.name}</span>
                  </div>

                  {showAmounts && (
                    <div className="md:col-span-2 flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{client.totalAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="md:col-span-2 flex items-center space-x-2">
                    <ProgressBar progress={client.progress} />
                  </div>

                  <div className="md:col-span-4">
                    <Badge variant="outline" className="bg-secondary/10">
                      Client
                    </Badge>
                  </div>
                </div>

                {/* Task Type Level */}
                {expandedClients[`${project.name}:${client.name}`] &&
                  Array.from(client.taskTypes.values()).map((taskType) => (
                    <div key={`${project.name}-${client.name}-${taskType.type}`} className="ml-6 space-y-1">
                      <div
                        className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-4 py-2 bg-background border rounded-md cursor-pointer hover:bg-muted/10"
                        onClick={() => toggleTaskType(project.name, client.name, taskType.type)}
                      >
                        <div className="md:col-span-4 flex items-center">
                          {expandedTaskTypes[`${project.name}:${client.name}:${taskType.type}`] ? (
                            <ChevronDown className="h-4 w-4 mr-2 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 mr-2 flex-shrink-0" />
                          )}
                          <span className="truncate">
                            {taskTypeLabels[taskType.type as keyof typeof taskTypeLabels] || taskType.type}
                          </span>
                        </div>

                        {showAmounts && (
                          <div className="md:col-span-2 flex items-center">
                            <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>{taskType.totalAmount.toLocaleString()}</span>
                          </div>
                        )}

                        <div className="md:col-span-2 flex items-center space-x-2">
                          <ProgressBar progress={taskType.progress} />
                        </div>

                        <div className="md:col-span-4">
                          <Badge
                            className={cn(
                              CONTRACT_DATE_TASK_TYPES.includes(taskType.type as TaskType)
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300"
                                : getTaskTypeBadgeColor(
                                    { ...taskType.tasks[0], taskType: taskType.type as TaskType },
                                    projectContractDates,
                                  ),
                            )}
                          >
                            {taskTypeLabels[taskType.type as keyof typeof taskTypeLabels] || taskType.type}
                          </Badge>
                        </div>
                      </div>

                      {/* Individual Tasks */}
                      {expandedTaskTypes[`${project.name}:${client.name}:${taskType.type}`] &&
                        taskType.tasks.map((task) => (
                          <TooltipProvider key={task.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-4 py-2 ml-6 border-l-2 border-l-muted hover:bg-muted/5 rounded-md cursor-help">
                                  <div className="md:col-span-4 pl-6 truncate">{task.title}</div>

                                  {showAmounts && (
                                    <div className="md:col-span-2">
                                      {task.amount ? (
                                        <span className="text-sm">${task.amount.toLocaleString()}</span>
                                      ) : (
                                        <span className="text-sm text-muted-foreground">-</span>
                                      )}
                                    </div>
                                  )}

                                  <div className="md:col-span-2 flex items-center space-x-2">
                                    <ProgressBar progress={task.progress} />
                                  </div>

                                  <div className="md:col-span-4 flex items-center space-x-2">
                                    <Badge variant="outline" className={getStatusColor(task.status)}>
                                      {task.status ? taskStatusLabels[task.status] : "Status Unknown"}
                                    </Badge>
                                    {task.priority && (
                                      <Badge variant="outline">
                                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                <div className="space-y-2">
                                  <p className="font-medium">{task.title}</p>
                                  <p className="text-sm text-muted-foreground">{task.details}</p>
                                  <div className="flex justify-between">
                                    <span className="text-sm">
                                      From: {new Date(task.startDate).toLocaleDateString()}
                                    </span>
                                    <span className="text-sm">To: {new Date(task.endDate).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium">Assignee:</span>
                                    <span className="text-sm">{task.assignee}</span>
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                    </div>
                  ))}
              </div>
            ))}
        </div>
      ))}

      {/* 色の凡例 */}
      <div className="mt-4 p-2 border rounded-md">
        <h4 className="text-sm font-medium mb-2">Legend:</h4>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-200 border border-orange-400 rounded-sm mr-2"></div>
            <span className="text-sm">Pre-Deal Tasks</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-200 border border-blue-400 rounded-sm mr-2"></div>
            <span className="text-sm">Contract Date</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-200 border border-green-400 rounded-sm mr-2"></div>
            <span className="text-sm">Post-Deal Tasks</span>
          </div>
        </div>
      </div>
    </div>
  )
}
