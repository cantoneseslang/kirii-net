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
              <div className="font-medium">{results.runnerBending.value.toFixed(2)} / {results.runnerBending.capacity.toFixed(2)} kN·m</div>
              <div className="bg-gray-50 p-2 mt-1 rounded-sm border border-gray-200">
                <p className="font-medium text-sm text-gray-800 mb-1">計算式と代入値:</p>
                <div className="text-sm">
                  <p><span className="font-medium">計算式:</span> M = (w × L²) / 8</p>
                  <p><span className="font-medium">代入:</span> M = (totalDistributedLoad × hangerSpacing²) / 8</p>
                  <p><span className="font-medium">結果:</span> M = {results.runnerBending.value.toFixed(2)} kN·m</p>
                </div>
              </div>
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
              <div className="font-medium">{results.runnerShear.value.toFixed(2)} / {results.runnerShear.capacity.toFixed(2)} kN</div>
              <div className="bg-gray-50 p-2 mt-1 rounded-sm border border-gray-200">
                <p className="font-medium text-sm text-gray-800 mb-1">計算式と代入値:</p>
                <div className="text-sm">
                  <p><span className="font-medium">計算式:</span> V = (w × L) / 2</p>
                  <p><span className="font-medium">代入:</span> V = (totalDistributedLoad × hangerSpacing) / 2</p>
                  <p><span className="font-medium">結果:</span> V = {results.runnerShear.value.toFixed(2)} kN</p>
                </div>
              </div>
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
              <div className="font-medium">{results.runnerDeflection.value.toFixed(2)} / {results.runnerDeflection.limit.toFixed(2)} mm</div>
              <div className="bg-gray-50 p-2 mt-1 rounded-sm border border-gray-200">
                <p className="font-medium text-sm text-gray-800 mb-1">計算式と代入値:</p>
                <div className="text-sm">
                  <p><span className="font-medium">計算式:</span> δ = (5 × w × L⁴) / (384 × E × I)</p>
                  <p><span className="font-medium">代入:</span> δ = (5 × totalDistributedLoad × hangerSpacing⁴ × 10¹¹) / (384 × E × I × 10⁴)</p>
                  <p><span className="font-medium">結果:</span> δ = {results.runnerDeflection.value.toFixed(2)} mm</p>
                </div>
              </div>
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
              <div className="font-medium">{results.hangerTension.value.toFixed(2)} / {results.hangerTension.capacity.toFixed(2)} kN</div>
              <div className="bg-gray-50 p-2 mt-1 rounded-sm border border-gray-200">
                <p className="font-medium text-sm text-gray-800 mb-1">計算式と代入値:</p>
                <div className="text-sm">
                  <p><span className="font-medium">計算式:</span> T = w × L</p>
                  <p><span className="font-medium">代入:</span> T = totalDistributedLoad × hangerSpacing / 1000</p>
                  <p><span className="font-medium">結果:</span> T = {results.hangerTension.value.toFixed(2)} kN</p>
                </div>
              </div>
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
              <div className="font-medium">{results.anchorTension.value.toFixed(2)} / {results.anchorTension.capacity.toFixed(2)} kN</div>
              <div className="bg-gray-50 p-2 mt-1 rounded-sm border border-gray-200">
                <p className="font-medium text-sm text-gray-800 mb-1">計算式と代入値:</p>
                <div className="text-sm">
                  <p><span className="font-medium">計算式:</span> T = ハンガー引張力</p>
                  <p><span className="font-medium">代入:</span> T = {results.hangerTension.value.toFixed(2)} kN</p>
                  <p><span className="font-medium">結果:</span> T = {results.anchorTension.value.toFixed(2)} kN</p>
                </div>
              </div>
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
