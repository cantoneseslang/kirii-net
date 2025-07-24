import Image from "next/image"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ServiceCardProps {
  image: string
  title: string
  description: string
  features: string[]
}

export function ServiceCard({ image, title, description, features }: ServiceCardProps) {
  return (
    <Card className="overflow-hidden border-0 bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10 h-full transition-all duration-300 hover:shadow-xl hover:shadow-gold-500/5 group">
      <div className="relative h-[250px]">
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent opacity-60 group-hover:opacity-70 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 p-6">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{title}</h3>
        </div>
      </div>
      <CardContent className="p-6">
        <p className="text-slate-600 dark:text-slate-300 mb-6">{description}</p>
        <div className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-gold-500/20 flex items-center justify-center">
                <Check className="h-3 w-3 text-gold-500" />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">{feature}</span>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full border-gold-500/50 text-gold-500 hover:bg-gold-500/10">
          Learn More
        </Button>
      </CardContent>
    </Card>
  )
}
