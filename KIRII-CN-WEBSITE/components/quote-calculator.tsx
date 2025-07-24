"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

export function QuoteCalculator() {
  const [productType, setProductType] = useState("")
  const [dimensions, setDimensions] = useState({ width: 100, height: 100 })
  const [features, setFeatures] = useState({
    customShape: false,
    ledLighting: false,
    premiumHardware: false,
  })
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null)

  const calculateEstimate = () => {
    let basePrice = 0

    switch (productType) {
      case "mirror":
        basePrice = 150
        break
      case "shower":
        basePrice = 300
        break
      case "partition":
        basePrice = 250
        break
      case "window":
        basePrice = 200
        break
      default:
        basePrice = 0
    }

    // Calculate area in square meters
    const area = (dimensions.width / 100) * (dimensions.height / 100)

    // Calculate price based on area
    let price = basePrice * area

    // Add feature costs
    if (features.customShape) price += price * 0.2
    if (features.ledLighting) price += price * 0.15
    if (features.premiumHardware) price += price * 0.1

    setEstimatedPrice(Math.round(price))
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Quick Quote Calculator</h3>

      <div className="space-y-4">
        <div>
          <Label htmlFor="product-type">Product Type</Label>
          <Select value={productType} onValueChange={setProductType}>
            <SelectTrigger id="product-type" className="bg-white/5 border-white/10">
              <SelectValue placeholder="Select product type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mirror">Custom Mirror</SelectItem>
              <SelectItem value="shower">Shower Enclosure</SelectItem>
              <SelectItem value="partition">Glass Partition</SelectItem>
              <SelectItem value="window">Aluminium Window</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Dimensions (cm)</Label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <Label htmlFor="width" className="text-xs">
                Width
              </Label>
              <div className="flex items-center gap-2">
                <Slider
                  id="width"
                  min={50}
                  max={300}
                  step={10}
                  value={[dimensions.width]}
                  onValueChange={(value) => setDimensions({ ...dimensions, width: value[0] })}
                  className="flex-1"
                />
                <span className="w-12 text-center text-sm">{dimensions.width}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="height" className="text-xs">
                Height
              </Label>
              <div className="flex items-center gap-2">
                <Slider
                  id="height"
                  min={50}
                  max={300}
                  step={10}
                  value={[dimensions.height]}
                  onValueChange={(value) => setDimensions({ ...dimensions, height: value[0] })}
                  className="flex-1"
                />
                <span className="w-12 text-center text-sm">{dimensions.height}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Additional Features</Label>

          <div className="flex items-center justify-between">
            <Label htmlFor="custom-shape" className="text-sm cursor-pointer">
              Custom Shape
            </Label>
            <Switch
              id="custom-shape"
              checked={features.customShape}
              onCheckedChange={(checked) => setFeatures({ ...features, customShape: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="led-lighting" className="text-sm cursor-pointer">
              LED Lighting
            </Label>
            <Switch
              id="led-lighting"
              checked={features.ledLighting}
              onCheckedChange={(checked) => setFeatures({ ...features, ledLighting: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="premium-hardware" className="text-sm cursor-pointer">
              Premium Hardware
            </Label>
            <Switch
              id="premium-hardware"
              checked={features.premiumHardware}
              onCheckedChange={(checked) => setFeatures({ ...features, premiumHardware: checked })}
            />
          </div>
        </div>

        <Button onClick={calculateEstimate} className="w-full bg-gold-500 hover:bg-gold-600 text-slate-900">
          Calculate Estimate
        </Button>

        {estimatedPrice !== null && (
          <div className="bg-white/10 dark:bg-slate-700/30 p-4 rounded-xl text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">Estimated Price</p>
            <p className="text-2xl font-bold text-gold-500">${estimatedPrice}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              This is just an estimate. Contact us for an accurate quote.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
