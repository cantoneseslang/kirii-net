"use client"

import { useMemo } from "react"
import { format, parse, isWithinInterval, eachMonthOfInterval, endOfMonth, startOfMonth } from "date-fns"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Task, Project } from "@/lib/types"

interface MonthlyFinanceViewProps {
  tasks: Task[]
  projects: Project[]
  startDate: Date
  endDate: Date
}

interface MonthlyData {
  month: string
  planned: number
  actual: number
  cumPlanned: number
  cumActual: number
}

export function MonthlyFinanceView({ tasks, projects, startDate, endDate }: MonthlyFinanceViewProps) {
  // Generate monthly data
  const monthlyData = useMemo(() => {
    // Get all months between start and end date
    const months = eachMonthOfInterval({
      start: startDate,
      end: endDate,
    })

    // Initialize monthly data
    const data: MonthlyData[] = months.map((month) => ({
      month: format(month, "yyyy-MM"),
      planned: 0,
      actual: 0,
      cumPlanned: 0,
      cumActual: 0,
    }))

    // Calculate planned and actual amounts for each month
    tasks.forEach((task) => {
      if (!task.amount) return

      const taskStartDate = new Date(task.startDate)
      const taskEndDate = new Date(task.endDate)

      // Skip tasks outside the date range
      if (taskEndDate < startDate || taskStartDate > endDate) return

      // Calculate task duration in days
      const taskDurationDays = Math.max(
        1,
        (taskEndDate.getTime() - taskStartDate.getTime()) / (1000 * 60 * 60 * 24) + 1,
      )

      // Calculate daily amount
      const dailyAmount = task.amount / taskDurationDays

      // Distribute amount across months
      months.forEach((month, index) => {
        const monthStart = startOfMonth(month)
        const monthEnd = endOfMonth(month)

        // Check if task overlaps with this month
        if (
          isWithinInterval(taskStartDate, { start: monthStart, end: monthEnd }) ||
          isWithinInterval(taskEndDate, { start: monthStart, end: monthEnd }) ||
          (taskStartDate <= monthStart && taskEndDate >= monthEnd)
        ) {
          // Calculate overlap start and end dates
          const overlapStart = taskStartDate > monthStart ? taskStartDate : monthStart
          const overlapEnd = taskEndDate < monthEnd ? taskEndDate : monthEnd

          // Calculate days in this month
          const daysInMonth = Math.min((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24) + 1, 31)

          // Add planned amount for this month
          data[index].planned += dailyAmount * daysInMonth

          // Add actual amount based on progress
          data[index].actual += (dailyAmount * daysInMonth * task.progress) / 100
        }
      })
    })

    // Round values and calculate cumulative amounts
    let cumPlanned = 0
    let cumActual = 0

    return data.map((item) => {
      const planned = Math.round(item.planned)
      const actual = Math.round(item.actual)

      cumPlanned += planned
      cumActual += actual

      return {
        ...item,
        planned,
        actual,
        cumPlanned,
        cumActual,
      }
    })
  }, [tasks, startDate, endDate])

  // Calculate project totals
  const projectTotals = useMemo(() => {
    return projects.map((project) => {
      const projectTasks = tasks.filter((task) => task.project === project.name)

      const totalPlanned = projectTasks.reduce((sum, task) => sum + (task.amount || 0), 0)
      const totalActual = projectTasks.reduce((sum, task) => sum + ((task.amount || 0) * task.progress) / 100, 0)

      return {
        id: project.id,
        name: project.name,
        client: project.client,
        totalPlanned,
        totalActual,
        progress: totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0,
      }
    })
  }, [tasks, projects])

  // Format month for display
  const formatMonth = (month: string) => {
    const date = parse(month, "yyyy-MM", new Date())
    return format(date, "MMM yyyy")
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="monthly">Monthly View</TabsTrigger>
          <TabsTrigger value="cumulative">Cumulative View</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Financial Progress</CardTitle>
              <CardDescription>Planned vs. Actual amounts by month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tickFormatter={formatMonth} />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value: number) => [formatCurrency(value), ""]} labelFormatter={formatMonth} />
                    <Legend />
                    <Bar dataKey="planned" name="Planned Amount" fill="#8884d8" />
                    <Bar dataKey="actual" name="Actual Amount" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/30">
                  <th className="p-2 text-left">Month</th>
                  <th className="p-2 text-right">Planned Amount</th>
                  <th className="p-2 text-right">Actual Amount</th>
                  <th className="p-2 text-right">Difference</th>
                  <th className="p-2 text-right">Progress</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((item) => (
                  <tr key={item.month} className="border-b hover:bg-muted/10">
                    <td className="p-2">{formatMonth(item.month)}</td>
                    <td className="p-2 text-right">{formatCurrency(item.planned)}</td>
                    <td className="p-2 text-right">{formatCurrency(item.actual)}</td>
                    <td className="p-2 text-right">
                      <span className={item.actual - item.planned >= 0 ? "text-green-600" : "text-red-600"}>
                        {formatCurrency(item.actual - item.planned)}
                      </span>
                    </td>
                    <td className="p-2 text-right">
                      {item.planned > 0 ? Math.round((item.actual / item.planned) * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="cumulative" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cumulative Financial Progress</CardTitle>
              <CardDescription>Cumulative planned vs. actual amounts over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tickFormatter={formatMonth} />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value: number) => [formatCurrency(value), ""]} labelFormatter={formatMonth} />
                    <Legend />
                    <Bar dataKey="cumPlanned" name="Cumulative Planned" fill="#8884d8" />
                    <Bar dataKey="cumActual" name="Cumulative Actual" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/30">
                  <th className="p-2 text-left">Month</th>
                  <th className="p-2 text-right">Cum. Planned</th>
                  <th className="p-2 text-right">Cum. Actual</th>
                  <th className="p-2 text-right">Difference</th>
                  <th className="p-2 text-right">Overall Progress</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((item) => (
                  <tr key={item.month} className="border-b hover:bg-muted/10">
                    <td className="p-2">{formatMonth(item.month)}</td>
                    <td className="p-2 text-right">{formatCurrency(item.cumPlanned)}</td>
                    <td className="p-2 text-right">{formatCurrency(item.cumActual)}</td>
                    <td className="p-2 text-right">
                      <span className={item.cumActual - item.cumPlanned >= 0 ? "text-green-600" : "text-red-600"}>
                        {formatCurrency(item.cumActual - item.cumPlanned)}
                      </span>
                    </td>
                    <td className="p-2 text-right">
                      {item.cumPlanned > 0 ? Math.round((item.cumActual / item.cumPlanned) * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Project Financial Summary</CardTitle>
          <CardDescription>Financial progress by project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/30">
                  <th className="p-2 text-left">Project</th>
                  <th className="p-2 text-left">Client</th>
                  <th className="p-2 text-right">Planned Amount</th>
                  <th className="p-2 text-right">Actual Amount</th>
                  <th className="p-2 text-right">Difference</th>
                  <th className="p-2 text-right">Progress</th>
                </tr>
              </thead>
              <tbody>
                {projectTotals.map((project) => (
                  <tr key={project.id} className="border-b hover:bg-muted/10">
                    <td className="p-2">{project.name}</td>
                    <td className="p-2">{project.client}</td>
                    <td className="p-2 text-right">{formatCurrency(project.totalPlanned)}</td>
                    <td className="p-2 text-right">{formatCurrency(project.totalActual)}</td>
                    <td className="p-2 text-right">
                      <span
                        className={project.totalActual - project.totalPlanned >= 0 ? "text-green-600" : "text-red-600"}
                      >
                        {formatCurrency(project.totalActual - project.totalPlanned)}
                      </span>
                    </td>
                    <td className="p-2 text-right">{project.progress}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
