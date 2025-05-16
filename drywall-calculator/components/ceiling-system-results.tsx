"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"

interface CeilingSystemResultsProps {
  results: {
    runnerBending: {
      value: number
      capacity: number
      ratio: number
      pass: boolean
    }
    runnerShear: {
      value: number
      capacity: number
      ratio: number
      pass: boolean
    }
    runnerDeflection: {
      value: number
      limit: number
      ratio: number
      pass: boolean
    }
    hangerTension: {
      value: number
      capacity: number
      ratio: number
      pass: boolean
    }
    anchorTension: {
      value: number
      capacity: number
      ratio: number
      pass: boolean
    }
    overallResult: boolean
  }
  dict: any
}

export default function CeilingSystemResults({ results, dict }: CeilingSystemResultsProps) {
  const generatePdf = () => {
    // PDF report generation logic (in actual implementation, a PDF generation library would be used)
    console.log("Generating PDF report")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict.ceiling.results.title}</CardTitle>
        <CardDescription>{dict.ceiling.results.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border p-4">
          <h3 className="font-medium mb-2">{dict.ceiling.results.overallJudgment}</h3>
          <div
            className={`text-center p-2 rounded-md ${results.overallResult ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          >
            {results.overallResult ? dict.ceiling.results.suitable : dict.ceiling.results.unsuitable}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-sm font-medium">
            <div>{dict.ceiling.results.verificationItem}</div>
            <div>{dict.ceiling.results.calculatedValueCapacity}</div>
            <div>{dict.ceiling.results.judgment}</div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm border-t pt-2">
            <div>{dict.ceiling.results.runnerBending}</div>
            <div>
              {results.runnerBending.value.toFixed(2)} / {results.runnerBending.capacity.toFixed(2)} kN·m
            </div>
            <div
              className={`px-2 py-1 rounded text-center ${results.runnerBending.pass ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {results.runnerBending.pass ? dict.ceiling.results.pass : dict.ceiling.results.fail}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm border-t pt-2">
            <div>{dict.ceiling.results.runnerShear}</div>
            <div>
              {results.runnerShear.value.toFixed(2)} / {results.runnerShear.capacity.toFixed(2)} kN
            </div>
            <div
              className={`px-2 py-1 rounded text-center ${results.runnerShear.pass ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {results.runnerShear.pass ? dict.ceiling.results.pass : dict.ceiling.results.fail}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm border-t pt-2">
            <div>{dict.ceiling.results.runnerDeflection}</div>
            <div>
              {results.runnerDeflection.value.toFixed(2)} / {results.runnerDeflection.limit.toFixed(2)} mm
            </div>
            <div
              className={`px-2 py-1 rounded text-center ${results.runnerDeflection.pass ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {results.runnerDeflection.pass ? dict.ceiling.results.pass : dict.ceiling.results.fail}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm border-t pt-2">
            <div>{dict.ceiling.results.hangerTension}</div>
            <div>
              {results.hangerTension.value.toFixed(2)} / {results.hangerTension.capacity.toFixed(2)} kN
            </div>
            <div
              className={`px-2 py-1 rounded text-center ${results.hangerTension.pass ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {results.hangerTension.pass ? dict.ceiling.results.pass : dict.ceiling.results.fail}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm border-t pt-2">
            <div>{dict.ceiling.results.anchorTension}</div>
            <div>
              {results.anchorTension.value.toFixed(2)} / {results.anchorTension.capacity.toFixed(2)} kN
            </div>
            <div
              className={`px-2 py-1 rounded text-center ${results.anchorTension.pass ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {results.anchorTension.pass ? dict.ceiling.results.pass : dict.ceiling.results.fail}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={generatePdf}>
          <FileText className="mr-2 h-4 w-4" />
          {dict.common.generateReport}
        </Button>
      </CardFooter>
    </Card>
  )
}
