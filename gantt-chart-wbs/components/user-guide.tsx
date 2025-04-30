"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"

export function UserGuide() {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Gantt Chart & WBS Application User Guide</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p>
          This guide explains how to use the Gantt Chart & WBS application for new users. When you first open the
          application, a tour guide will automatically appear to introduce you to the main features.
        </p>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Basic Navigation</h2>
          <h3 className="text-lg font-medium">Main Navigation Tabs</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Gantt</strong>: Displays tasks in a timeline format, showing when tasks start and end
            </li>
            <li>
              <strong>WBS</strong>: Shows tasks in a Work Breakdown Structure hierarchy
            </li>
            <li>
              <strong>Finance</strong>: Displays financial information about projects on a monthly basis
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Understanding the Views</h2>
          <h3 className="text-lg font-medium">Gantt Chart View</h3>
          <p>The Gantt Chart visualizes tasks on a timeline, allowing you to see:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Task durations represented by horizontal bars</li>
            <li>Task progress shown as filled portions of the bars</li>
            <li>Color-coded tasks based on their type (pre-deal, contract dates, post-deal)</li>
            <li>Task dependencies and relationships</li>
            <li>Resource allocation across time</li>
          </ul>

          <h3 className="text-lg font-medium">WBS (Work Breakdown Structure) View</h3>
          <p>The WBS view organizes tasks in a hierarchical structure:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Projects at the top level</li>
            <li>Clients as the second level</li>
            <li>Task types as the third level</li>
            <li>Individual tasks at the bottom level</li>
          </ul>
          <p>This view helps you understand the project structure and how tasks are organized within projects.</p>

          <h3 className="text-lg font-medium">Finance View</h3>
          <p>The Finance view provides financial insights:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Monthly View</strong>: Shows planned vs. actual amounts by month
            </li>
            <li>
              <strong>Cumulative View</strong>: Displays cumulative financial progress over time
            </li>
            <li>
              <strong>Project Financial Summary</strong>: Lists financial metrics for each project
            </li>
          </ul>
        </section>

        {/* Additional sections omitted for brevity */}

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Contact Support</h2>
          <div className="flex items-center space-x-2 text-primary">
            <Mail className="h-5 w-5" />
            <p>
              If you encounter any issues or have feature requests, please email:{" "}
              <a href="mailto:hiroki.sakon@kirii.com.hk" className="font-medium underline">
                hiroki.sakon@kirii.com.hk
              </a>
            </p>
          </div>
        </section>
      </CardContent>
    </Card>
  )
}
