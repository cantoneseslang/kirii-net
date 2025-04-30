"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface TourStep {
  target: string
  title: string
  content: string
  position?: "top" | "right" | "bottom" | "left"
}

interface TourGuideProps {
  steps: TourStep[]
  onComplete: () => void
  isOpen: boolean
  onNeverShowAgain: () => void
}

export function TourGuide({ steps, onComplete, isOpen, onNeverShowAgain }: TourGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [arrowPosition, setArrowPosition] = useState({ top: 0, left: 0 })
  const [tooltipClass, setTooltipClass] = useState("")
  const [neverShowAgain, setNeverShowAgain] = useState(false)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      if (neverShowAgain) {
        onNeverShowAgain()
      }
      onComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    if (neverShowAgain) {
      onNeverShowAgain()
    }
    onComplete()
  }

  useEffect(() => {
    if (!isOpen) return

    const positionTooltip = () => {
      const step = steps[currentStep]
      const targetElement = document.querySelector(step.target)

      if (targetElement) {
        // Add highlight effect
        targetElement.classList.add("tour-highlight")

        const targetRect = targetElement.getBoundingClientRect()
        const tooltipWidth = 320
        const tooltipHeight = 240 // Increased height to accommodate content
        const margin = 20
        const viewportHeight = window.innerHeight
        const viewportWidth = window.innerWidth

        // Default position
        let preferredPosition = step.position || "bottom"

        // Check if there's enough space below for bottom position
        if (preferredPosition === "bottom" && targetRect.bottom + tooltipHeight + margin > viewportHeight) {
          // Not enough space below, try top
          if (targetRect.top - tooltipHeight - margin > 0) {
            preferredPosition = "top"
          }
          // If not enough space on top either, try right or left
          else if (targetRect.right + tooltipWidth + margin < viewportWidth) {
            preferredPosition = "right"
          } else if (targetRect.left - tooltipWidth - margin > 0) {
            preferredPosition = "left"
          }
          // If all positions are problematic, keep bottom but we'll adjust later
        }

        // Similar checks for other positions
        if (preferredPosition === "top" && targetRect.top - tooltipHeight - margin < 0) {
          if (targetRect.bottom + tooltipHeight + margin < viewportHeight) {
            preferredPosition = "bottom"
          } else if (targetRect.right + tooltipWidth + margin < viewportWidth) {
            preferredPosition = "right"
          } else if (targetRect.left - tooltipWidth - margin > 0) {
            preferredPosition = "left"
          }
        }

        if (preferredPosition === "right" && targetRect.right + tooltipWidth + margin > viewportWidth) {
          if (targetRect.left - tooltipWidth - margin > 0) {
            preferredPosition = "left"
          } else if (targetRect.bottom + tooltipHeight + margin < viewportHeight) {
            preferredPosition = "bottom"
          } else if (targetRect.top - tooltipHeight - margin > 0) {
            preferredPosition = "top"
          }
        }

        if (preferredPosition === "left" && targetRect.left - tooltipWidth - margin < 0) {
          if (targetRect.right + tooltipWidth + margin < viewportWidth) {
            preferredPosition = "right"
          } else if (targetRect.bottom + tooltipHeight + margin < viewportHeight) {
            preferredPosition = "bottom"
          } else if (targetRect.top - tooltipHeight - margin > 0) {
            preferredPosition = "top"
          }
        }

        let top = 0
        let left = 0
        let arrowTop = 0
        let arrowLeft = 0
        let tooltipPositionClass = ""

        switch (preferredPosition) {
          case "top":
            top = targetRect.top - tooltipHeight - margin
            left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2
            arrowTop = tooltipHeight
            arrowLeft = tooltipWidth / 2
            tooltipPositionClass = "tour-tooltip-top"
            break
          case "right":
            top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2
            left = targetRect.right + margin
            arrowTop = tooltipHeight / 2
            arrowLeft = -8
            tooltipPositionClass = "tour-tooltip-right"
            break
          case "left":
            top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2
            left = targetRect.left - tooltipWidth - margin
            arrowTop = tooltipHeight / 2
            arrowLeft = tooltipWidth
            tooltipPositionClass = "tour-tooltip-left"
            break
          default: // bottom
            top = targetRect.bottom + margin
            left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2
            arrowTop = -8
            arrowLeft = tooltipWidth / 2
            tooltipPositionClass = "tour-tooltip-bottom"
        }

        // Ensure tooltip stays within viewport bounds
        if (left < 10) left = 10
        if (left + tooltipWidth > viewportWidth - 10) left = viewportWidth - tooltipWidth - 10

        // Critical fix for bottom overflow
        if (top + tooltipHeight > viewportHeight - 10) {
          // If tooltip would go off bottom of screen, position it higher
          top = viewportHeight - tooltipHeight - 10

          // If this would place it over the target, adjust further
          if (preferredPosition === "bottom" && top < targetRect.bottom + margin) {
            // Try to position it above the target instead
            if (targetRect.top - tooltipHeight - margin > 0) {
              top = targetRect.top - tooltipHeight - margin
              arrowTop = tooltipHeight
              tooltipPositionClass = "tour-tooltip-top"
            }
          }
        }

        // Ensure tooltip doesn't go off top of screen
        if (top < 10) top = 10

        setPosition({ top, left })
        setArrowPosition({ top: arrowTop, left: arrowLeft })
        setTooltipClass(tooltipPositionClass)

        // Remove highlight from previous steps
        document.querySelectorAll(".tour-highlight").forEach((el) => {
          if (el !== targetElement) {
            el.classList.remove("tour-highlight")
          }
        })

        // Scroll to ensure element is visible
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
      }
    }

    positionTooltip()

    // Recalculate position on resize
    window.addEventListener("resize", positionTooltip)
    return () => {
      window.removeEventListener("resize", positionTooltip)
      // Remove highlights when tour ends
      document.querySelectorAll(".tour-highlight").forEach((el) => {
        el.classList.remove("tour-highlight")
      })
    }
  }, [currentStep, steps, isOpen])

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={handleSkip} />
      <Card
        className={cn("fixed z-50 w-80 shadow-lg tour-tooltip", tooltipClass)}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          maxHeight: "calc(100vh - 20px)",
          overflow: "auto",
        }}
      >
        <div
          className="tour-arrow"
          style={{
            top: `${arrowPosition.top}px`,
            left: `${arrowPosition.left}px`,
          }}
        />
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">{steps[currentStep].title}</CardTitle>
            <Button variant="ghost" size="icon" onClick={handleSkip} className="h-6 w-6">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-sm">
          <p>{steps[currentStep].content}</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 pt-2 sticky bottom-0 bg-card">
          <div className="flex items-center space-x-2 w-full">
            <Checkbox
              id="never-show-again"
              checked={neverShowAgain}
              onCheckedChange={(checked) => setNeverShowAgain(checked === true)}
            />
            <Label htmlFor="never-show-again" className="text-xs">
              Do not show again
            </Label>
          </div>
          <div className="flex justify-between w-full">
            <div className="text-sm text-muted-foreground">
              {currentStep + 1} / {steps.length}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrev} disabled={currentStep === 0}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Prev
              </Button>
              <Button size="sm" onClick={handleNext}>
                {currentStep < steps.length - 1 ? (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  "Finish"
                )}
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </>
  )
}
