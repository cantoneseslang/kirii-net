"use client"

import { useState, useEffect } from "react"
import { TourGuide } from "@/components/tour-guide"

export function AppTourGuide() {
  const [showTour, setShowTour] = useState(false)
  const [hasSeenTour, setHasSeenTour] = useState(false)

  useEffect(() => {
    // Check if user has already seen the tour or opted to never show it again
    const tourSeen = localStorage.getItem("gantt-tour-seen")
    const neverShowAgain = localStorage.getItem("gantt-tour-never-show")

    if (!tourSeen && !neverShowAgain) {
      // Delay showing the tour to allow page to load
      const timer = setTimeout(() => {
        setShowTour(true)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      setHasSeenTour(true)
    }
  }, [])

  const handleTourComplete = () => {
    setShowTour(false)
    // Record that the tour has been seen
    localStorage.setItem("gantt-tour-seen", "true")
    setHasSeenTour(true)
  }

  const handleNeverShowAgain = () => {
    localStorage.setItem("gantt-tour-never-show", "true")
  }

  const handleRestartTour = () => {
    setShowTour(true)
  }

  const tourSteps = [
    {
      target: ".tabs-container",
      title: "Main Navigation",
      content:
        "Use these tabs to switch between Gantt Chart, WBS, and Finance views. Each view provides different insights into your project data.",
      position: "bottom",
    },
    {
      target: ".filter-section",
      title: "Filters and Grouping",
      content:
        "Group tasks by Salesman, Client, or Project. You can also select the start date for the displayed period.",
      position: "bottom",
    },
    {
      target: ".view-mode-toggle",
      title: "View Mode Toggle (Mobile)",
      content:
        "On mobile devices, switch between List view and Calendar view. Calendar view allows horizontal scrolling to see the Gantt chart.",
      position: "bottom",
    },
    {
      target: ".gantt-chart",
      title: "Gantt Chart",
      content:
        "The Gantt Chart visualizes task schedules on a timeline. Color-coded bars represent task types and progress. Orange bars are pre-deal tasks, blue bars are contract dates, and green bars are post-deal tasks.",
      position: "top",
    },
    {
      target: ".group-header",
      title: "Group Expansion/Collapse",
      content:
        "Click on a group header to expand or collapse tasks within that group. This helps you focus on specific projects, clients, or salesmen.",
      position: "right",
    },
    {
      target: ".task-item",
      title: "Task Information",
      content:
        "Hover over a task name to see detailed information in a popup. The colored bars show the task duration and progress percentage.",
      position: "right",
    },
    {
      target: ".wbs-tab",
      title: "WBS (Work Breakdown Structure) View",
      content:
        "The WBS view organizes tasks in a hierarchical structure by Project, Client, and Task Type. This helps you understand the project structure and relationships between tasks.",
      position: "bottom",
    },
    {
      target: ".finance-tab",
      title: "Finance View",
      content:
        "The Finance view shows planned vs. actual amounts by month, cumulative financial progress, and project financial summaries. Use this to track financial performance of your projects.",
      position: "bottom",
    },
    {
      target: ".add-project-btn",
      title: "Add Project",
      content:
        "Click this button to add a new project. You'll need to enter Project Name, Client, Total Amount, Start Date, and End Date. All fields marked with * are required.",
      position: "left",
    },
    {
      target: ".add-task-button",
      title: "Add Task",
      content:
        "Click this button to add a new task. You'll need to enter Task Title, Task Type, Start/End Dates, Salesman, Project, Client, Status, and Progress. You can also add optional Amount and Details.",
      position: "left",
    },
    {
      target: ".project-management",
      title: "Project Management",
      content:
        "This section shows an overview of all projects. You can edit projects by clicking the pencil icon, or add new tasks to specific projects using the 'Add Task' button within each project card.",
      position: "top",
    },
    {
      target: ".task-management",
      title: "Task Management",
      content:
        "This table lists all tasks with their key information. You can edit or delete tasks by clicking the pencil icon in the Actions column.",
      position: "top",
    },
    {
      target: ".legend",
      title: "Legend",
      content:
        "The color coding helps identify task types: Orange for pre-deal tasks, Blue for contract date tasks, and Green for post-deal tasks.",
      position: "top",
    },
    {
      target: ".tabs-container",
      title: "Contact Support",
      content:
        "If you encounter any issues or have feature requests, please email: hiroki.sakon@kirii.com.hk Thank you for using our Gantt Chart & WBS application!",
      position: "bottom",
    },
  ]

  return (
    <>
      <TourGuide
        steps={tourSteps}
        onComplete={handleTourComplete}
        isOpen={showTour}
        onNeverShowAgain={handleNeverShowAgain}
      />
      {hasSeenTour && !showTour && (
        <button
          onClick={handleRestartTour}
          className="fixed bottom-4 right-4 bg-primary text-white rounded-full p-2 shadow-lg z-30"
          title="Show Guide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>
      )}
    </>
  )
}
