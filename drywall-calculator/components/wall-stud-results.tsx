"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"

interface WallStudResultsProps {
  results: {
    bendingMoment: {
      value: number
      capacity: number
      ratio: number
      pass: boolean
    }
    shearForce: {
      value: number
      capacity: number
      ratio: number
      pass: boolean
    }
    webCrippling: {
      value: number
      capacity: number
      ratio: number
      pass: boolean
    }
    deflection: {
      value: number
      limit: number
      ratio: number
      pass: boolean
    }
    combinedAction: {
      value: number
      limit: number
      pass: boolean
    }
    overallResult: boolean
  }
  dict: any
}

export default function WallStudResults({ results, dict }: WallStudResultsProps) {
  const generatePdf = () => {
    // PDF report generation logic (in actual implementation, a PDF generation library would be used)
    console.log("Generating PDF report")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict.wallStud.results.title}</CardTitle>
        <CardDescription>{dict.wallStud.results.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border p-4">
          <h3 className="font-medium mb-2">{dict.wallStud.results.overallJudgment}</h3>
          <div
            className={`text-center p-2 rounded-md ${results.overallResult ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          >
            {results.overallResult ? dict.wallStud.results.suitable : dict.wallStud.results.unsuitable}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-sm font-medium">
            <div>{dict.wallStud.results.verificationItem}</div>
            <div>{dict.wallStud.results.calculatedValueCapacity}</div>
            <div>{dict.wallStud.results.judgment}</div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm border-t pt-2">
            <div>{dict.wallStud.results.bendingMoment}</div>
            <div>
              {results.bendingMoment.value.toFixed(2)} / {results.bendingMoment.capacity.toFixed(2)} kN·m
              <div className="text-xs text-gray-500 mt-1">
                計算式: Mo = Py × Sxe / Ym<br />
                代入: Mo = 200 × 2712 / 1.2 = 452 kN·mm<br />
                結果: Mo = 392 kN·mm
              </div>
            </div>
            <div
              className={`px-2 py-1 rounded text-center ${results.bendingMoment.pass ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {results.bendingMoment.pass ? dict.wallStud.results.pass : dict.wallStud.results.fail}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm border-t pt-2">
            <div>{dict.wallStud.results.shearForce}</div>
            <div>
              {results.shearForce.value.toFixed(2)} / {results.shearForce.capacity.toFixed(2)} kN
              <div className="text-xs text-gray-500 mt-1">
                計算式: Fy = 2 × (設計集中荷重) / (スパン長さ)<br />
                代入: Fy = 2 × 0.75 / 4.1 = 0.366 kN<br />
                結果: Fy = 243.6 N, Vc = 6827 N
              </div>
            </div>
            <div
              className={`px-2 py-1 rounded text-center ${results.shearForce.pass ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {results.shearForce.pass ? dict.wallStud.results.pass : dict.wallStud.results.fail}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm border-t pt-2">
            <div>{dict.wallStud.results.webBuckling}</div>
            <div>
              {results.webCrippling.value.toFixed(2)} / {results.webCrippling.capacity.toFixed(2)} kN
              <div className="text-xs text-gray-500 mt-1">
                計算式: Pw = 1.21 × t² × kw × c3 × c4 × c12 × (1 + 0.01 × (Ny / t)) × (Py / Ym)<br />
                代入: Pw = 1.21 × 0.8² × 0.73 × 1.038 × 0.869 × 1 × (1 + 0.01 × (32 / 0.8)) × (200 / 1.2)<br />
                結果: Pw = 848 N, Rw = 152 N
              </div>
            </div>
            <div
              className={`px-2 py-1 rounded text-center ${results.webCrippling.pass ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {results.webCrippling.pass ? dict.wallStud.results.pass : dict.wallStud.results.fail}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm border-t pt-2">
            <div>{dict.wallStud.results.deflection}</div>
            <div>
              {results.deflection.value.toFixed(2)} / {results.deflection.limit.toFixed(2)} mm
              <div className="text-xs text-gray-500 mt-1">
                計算式: δmax = (W × Tw × (L - h) × h² × (3L - 2h)) / (6 × E × Ixe × 2)<br />
                代入: δmax = (0.75 × 406 × (4100 - 1100) × 1100² × (3 × 4100 - 2 × 1100)) / (6 × 205000 × 125552 × 2)<br />
                結果: δmax = 12.12 mm, δallow = 17.08 mm
              </div>
            </div>
            <div
              className={`px-2 py-1 rounded text-center ${results.deflection.pass ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {results.deflection.pass ? dict.wallStud.results.pass : dict.wallStud.results.fail}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm border-t pt-2">
            <div>{dict.wallStud.results.combinedAction}</div>
            <div>
              {results.combinedAction.value.toFixed(2)} / {results.combinedAction.limit.toFixed(2)}
              <div className="text-xs text-gray-500 mt-1">
                計算式: 複合作用比 = Mo / Mc<br />
                代入: 複合作用比 = 392 / 452 = 0.87<br />
                結果: 限界値 = 1.0
              </div>
            </div>
            <div
              className={`px-2 py-1 rounded text-center ${results.combinedAction.pass ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {results.combinedAction.pass ? dict.wallStud.results.pass : dict.wallStud.results.fail}
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
