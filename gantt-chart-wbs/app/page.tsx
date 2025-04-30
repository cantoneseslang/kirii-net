"use client"

import { useState, useEffect } from "react"
import { GanttChart } from "@/components/gantt-chart"
import { WBSView } from "@/components/wbs-view"
import { MonthlyFinanceView } from "@/components/monthly-finance-view"
import { TaskFilter } from "@/components/task-filter"
import { TaskDialog } from "@/components/task-dialog"
import { ProjectDialog } from "@/components/project-dialog"
import { sampleTasks, sampleProjects } from "@/lib/data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, FileEdit, Menu, Calendar, List, Mail } from "lucide-react"
import { addMonths } from "date-fns"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useMediaQuery } from "@/hooks/use-media-query"
import { AppTourGuide } from "@/components/app-tour-guide"
import type { Task, Project } from "@/lib/types"
import Image from "next/image"

export default function Home() {
  const [filterType, setFilterType] = useState<"assignee" | "client" | "project">("assignee")
  const [startDate, setStartDate] = useState<Date>(new Date(2025, 0, 1))
  const [showAmounts, setShowAmounts] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [activeTab, setActiveTab] = useState("gantt")
  const [mobileViewMode, setMobileViewMode] = useState<"list" | "calendar">("list")

  // Check if the device is mobile
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Calculate end date (12 months from start date)
  const endDate = addMonths(startDate, 12)

  // Initialize with sample data
  useEffect(() => {
    setTasks(sampleTasks)
    setProjects(sampleProjects)
  }, [])

  // Handle task operations
  const handleAddTask = (newTask: Task) => {
    setTasks((prevTasks) => [...prevTasks, newTask])
  }

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))
  }

  // Handle project operations
  const handleAddProject = (newProject: Project) => {
    setProjects((prevProjects) => [...prevProjects, newProject])
  }

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects((prevProjects) =>
      prevProjects.map((project) => (project.id === updatedProject.id ? updatedProject : project)),
    )
  }

  const handleDeleteProject = (projectId: string) => {
    // Delete project
    setProjects((prevProjects) => prevProjects.filter((project) => project.id !== projectId))

    // Delete all tasks associated with this project
    const projectToDelete = projects.find((p) => p.id === projectId)
    if (projectToDelete) {
      setTasks((prevTasks) => prevTasks.filter((task) => task.project !== projectToDelete.name))
    }
  }

  // Toggle mobile view mode
  const toggleMobileViewMode = () => {
    setMobileViewMode((prev) => (prev === "list" ? "calendar" : "list"))
  }

  return (
    <main className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 space-y-4 sm:space-y-6">
      <AppTourGuide />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative h-[60px] w-[150px]">
            <Image src="/images/logo.png" alt="KIRII Logo" fill style={{ objectFit: "contain" }} priority />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-bold">Gantt Chart & WBS</h1>
            <p className="text-sm text-muted-foreground">Manage your projects, tasks, and resources efficiently</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-2 sm:mb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full tabs-container">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
            <TabsList className="grid w-full max-w-xs grid-cols-3">
              <TabsTrigger value="gantt">Gantt</TabsTrigger>
              <TabsTrigger value="wbs" className="wbs-tab">
                WBS
              </TabsTrigger>
              <TabsTrigger value="finance" className="finance-tab">
                Finance
              </TabsTrigger>
            </TabsList>

            <div className="flex space-x-2">
              {isMobile ? (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Menu className="h-4 w-4" />
                      Actions
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-auto pb-8">
                    <div className="flex flex-col space-y-2 pt-4">
                      <ProjectDialog
                        onSave={handleAddProject}
                        trigger={
                          <Button variant="outline" size="sm" className="w-full justify-start gap-1 add-project-btn">
                            <Plus className="h-4 w-4" />
                            Add Project
                          </Button>
                        }
                      />
                      <TaskDialog
                        onSave={handleAddTask}
                        trigger={
                          <Button size="sm" className="w-full justify-start gap-1 add-task-btn">
                            <Plus className="h-4 w-4" />
                            Add Task
                          </Button>
                        }
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              ) : (
                <>
                  <ProjectDialog
                    onSave={handleAddProject}
                    trigger={
                      <Button variant="outline" size="sm" className="gap-1 add-project-btn">
                        <Plus className="h-4 w-4" />
                        Add Project
                      </Button>
                    }
                  />
                  <TaskDialog
                    onSave={handleAddTask}
                    trigger={
                      <Button size="sm" className="gap-1 add-task-btn">
                        <Plus className="h-4 w-4" />
                        Add Task
                      </Button>
                    }
                  />
                </>
              )}
            </div>
          </div>

          <TabsContent value="gantt" className="space-y-4 mt-4">
            <div className="flex flex-col gap-4">
              <TaskFilter
                filterType={filterType}
                onFilterChange={setFilterType}
                startDate={startDate}
                onStartDateChange={setStartDate}
                isMobile={isMobile}
                className="gantt-filter"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 p-2 sm:p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center space-x-2">
                  <Switch id="show-amounts" checked={showAmounts} onCheckedChange={setShowAmounts} />
                  <Label htmlFor="show-amounts">Show Financial Data</Label>
                </div>

                {isMobile && (
                  <div className="flex items-center space-x-2 view-mode-toggle">
                    <Label htmlFor="view-mode" className="text-sm">
                      View Mode:
                    </Label>
                    <Button id="view-mode" variant="outline" size="sm" onClick={toggleMobileViewMode} className="gap-1">
                      {mobileViewMode === "list" ? (
                        <>
                          <List className="h-4 w-4" />
                          <span>List</span>
                        </>
                      ) : (
                        <>
                          <Calendar className="h-4 w-4" />
                          <span>Calendar</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="border rounded-lg p-2 sm:p-4 overflow-x-auto gantt-chart">
              <GanttChart
                tasks={tasks}
                filterType={filterType}
                startDate={startDate}
                showAmounts={showAmounts}
                isMobile={isMobile}
                mobileViewMode={mobileViewMode}
              />
            </div>
          </TabsContent>

          <TabsContent value="wbs" className="space-y-4 mt-4">
            <div className="flex justify-end">
              <div className="flex items-center space-x-2 p-2 sm:p-4 border rounded-lg bg-muted/30">
                <Switch id="show-amounts-wbs" checked={showAmounts} onCheckedChange={setShowAmounts} />
                <Label htmlFor="show-amounts-wbs">Show Financial Data</Label>
              </div>
            </div>

            <div className="border rounded-lg p-2 sm:p-4">
              <div className="flex justify-between items-center mb-2 sm:mb-4">
                <h2 className="text-lg font-semibold">Work Breakdown Structure</h2>
              </div>
              <WBSView tasks={tasks} showAmounts={showAmounts} isMobile={isMobile} />
            </div>
          </TabsContent>

          <TabsContent value="finance" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Monthly Financial View</h2>
              <TaskFilter
                filterType={filterType}
                onFilterChange={setFilterType}
                startDate={startDate}
                onStartDateChange={setStartDate}
                hideGroupBy
                isMobile={isMobile}
                className="gantt-filter"
              />
            </div>

            <div className="border rounded-lg p-2 sm:p-4">
              <MonthlyFinanceView tasks={tasks} projects={projects} startDate={startDate} endDate={endDate} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Project Management Section - Only show on desktop or when not in Gantt view on mobile */}
      {(!isMobile || activeTab !== "gantt") && (
        <div className="border rounded-lg p-2 sm:p-4 project-management">
          <h2 className="text-lg font-semibold mb-2 sm:mb-4">Project Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-sm">{project.name}</h3>
                  <ProjectDialog
                    project={project}
                    onSave={handleUpdateProject}
                    onDelete={() => handleDeleteProject(project.id)}
                    trigger={
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <FileEdit className="h-3 w-3" />
                      </Button>
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">Client: {project.client}</p>
                <div className="flex justify-between text-xs">
                  <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
                  <span>End: {new Date(project.endDate).toLocaleDateString()}</span>
                </div>
                {showAmounts && (
                  <div className="text-xs">
                    <span className="font-medium">Total: ${project.totalAmount.toLocaleString()}</span>
                    <span className="ml-2 text-muted-foreground">Progress: {project.amountProgress}%</span>
                  </div>
                )}
                <div className="flex justify-end">
                  <TaskDialog
                    onSave={handleAddTask}
                    trigger={
                      <Button variant="outline" size="sm" className="gap-1 text-xs h-7">
                        <Plus className="h-3 w-3" />
                        Add Task
                      </Button>
                    }
                    title={`Add Task to ${project.name}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Management Section - Only show on desktop or when not in Gantt view on mobile */}
      {(!isMobile || activeTab !== "gantt") && (
        <div className="border rounded-lg p-2 sm:p-4 task-management">
          <h2 className="text-lg font-semibold mb-2 sm:mb-4">Task Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-muted/30">
                  <th className="p-2 text-left">Task</th>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Progress</th>
                  {showAmounts && <th className="p-2 text-left">Amount</th>}
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b hover:bg-muted/10 task-item">
                    <td className="p-2">{task.title}</td>
                    <td className="p-2">{task.taskType}</td>
                    <td className="p-2">{task.status}</td>
                    <td className="p-2">{task.progress}%</td>
                    {showAmounts && <td className="p-2">{task.amount ? `$${task.amount.toLocaleString()}` : "-"}</td>}
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <TaskDialog
                          task={task}
                          onSave={handleUpdateTask}
                          onDelete={() => handleDeleteTask(task.id)}
                          trigger={
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <FileEdit className="h-3 w-3" />
                            </Button>
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 色の凡例 */}
      <div className="mt-4 p-2 border rounded-md legend">
        <h4 className="text-sm font-medium mb-2">Legend:</h4>
        <div className="flex flex-wrap gap-4">
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

      {/* Contact Information */}
      <div className="border rounded-lg p-4 bg-muted/10">
        <div className="flex items-center space-x-2">
          <Mail className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Contact Support</h2>
        </div>
        <p className="mt-2">
          If you encounter any issues or have feature requests, please email:{" "}
          <a href="mailto:hiroki.sakon@kirii.com.hk" className="text-primary font-medium hover:underline">
            hiroki.sakon@kirii.com.hk
          </a>
        </p>
      </div>
    </main>
  )
}
