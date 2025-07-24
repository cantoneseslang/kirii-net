"use client"

import { useState } from "react"
import { Calculator } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CostRange {
  min: number
  max: number
}

interface ServiceCost {
  service: string
  specification: string
  costRange: CostRange
}

export function CostEstimator() {
  const [selectedService, setSelectedService] = useState("")
  const [area, setArea] = useState("")
  const [estimatedCost, setEstimatedCost] = useState<CostRange | null>(null)

  const serviceCosts: ServiceCost[] = [
    {
      service: "Aluminium",
      specification: "Single Glass",
      costRange: { min: 350000, max: 370000 },
    },
    {
      service: "Aluminium",
      specification: "Double Glass",
      costRange: { min: 450000, max: 470000 },
    },
    {
      service: "Partition",
      specification: "Black Accessories",
      costRange: { min: 360000, max: 380000 },
    },
    {
      service: "Partition",
      specification: "Silver Accessories",
      costRange: { min: 320000, max: 350000 },
    },
    {
      service: "Balcony",
      specification: "-",
      costRange: { min: 350000, max: 380000 },
    },
    {
      service: "French Doors",
      specification: "-",
      costRange: { min: 400000, max: 420000 },
    },
  ]

  const calculateEstimate = () => {
    const selectedServiceData = serviceCosts.find(
      (service) => `${service.service} - ${service.specification}` === selectedService,
    )

    if (selectedServiceData && area) {
      const areaNum = Number.parseFloat(area)
      const minCost = (selectedServiceData.costRange.min * areaNum) / 1000000 // Convert to millions for readability
      const maxCost = (selectedServiceData.costRange.max * areaNum) / 1000000

      setEstimatedCost({ min: minCost, max: maxCost })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount * 1000000) // Convert back from millions
  }

  return (
    <div className="space-y-8">
      <Card className="bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
            <Calculator className="h-5 w-5 text-gold-500" />
            Cost Estimator (Per Square Meter)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="service-select">Select Service & Specification</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger id="service-select" className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Choose a service" />
                </SelectTrigger>
                <SelectContent>
                  {serviceCosts.map((service, index) => (
                    <SelectItem key={index} value={`${service.service} - ${service.specification}`}>
                      {service.service} - {service.specification}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="area-input">Area (Square Meters)</Label>
              <Input
                id="area-input"
                type="number"
                placeholder="Enter area in m²"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="bg-white/5 border-white/10"
              />
            </div>

            <Button
              onClick={calculateEstimate}
              className="w-full bg-gold-500 hover:bg-gold-600 text-slate-900"
              disabled={!selectedService || !area}
            >
              Calculate Estimate
            </Button>

            {estimatedCost && (
              <div className="bg-white/10 dark:bg-slate-700/30 p-6 rounded-xl text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Estimated Cost Range</p>
                <p className="text-2xl font-bold text-gold-500">
                  {formatCurrency(estimatedCost.min)} - {formatCurrency(estimatedCost.max)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  *Prices are estimates and may vary based on specific requirements
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cost Reference Table */}
      <Card className="bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Cost Reference Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-2 font-semibold text-slate-900 dark:text-white">Service</th>
                  <th className="text-left py-3 px-2 font-semibold text-slate-900 dark:text-white">Specification</th>
                  <th className="text-left py-3 px-2 font-semibold text-slate-900 dark:text-white">
                    Cost Range (TZS/m²)
                  </th>
                </tr>
              </thead>
              <tbody>
                {serviceCosts.map((service, index) => (
                  <tr key={index} className="border-b border-white/5">
                    <td className="py-3 px-2 text-slate-700 dark:text-slate-300">{service.service}</td>
                    <td className="py-3 px-2 text-slate-700 dark:text-slate-300">{service.specification}</td>
                    <td className="py-3 px-2">
                      <Badge variant="outline" className="border-gold-500/30 text-gold-500 bg-gold-500/5">
                        {service.costRange.min.toLocaleString()} - {service.costRange.max.toLocaleString()}
                      </Badge>
                    </td>
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
