import Image from "next/image"
import { ArrowRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ProjectCardProps {
  image: string
  title: string
  location: string
  category: string
  description: string
  featured?: boolean
}

export function ProjectCard({ image, title, location, category, description, featured = false }: ProjectCardProps) {
  return (
    <Card className="overflow-hidden border-0 bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10 h-full">
      <div className="relative">
        <div className={`relative ${featured ? "h-[400px]" : "h-[250px]"}`}>
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        <Badge className="absolute top-4 right-4 bg-gold-500 text-slate-900 hover:bg-gold-600">{category}</Badge>
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl md:text-2xl font-bold mb-2 text-slate-900 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{location}</p>
        <p className="text-slate-600 dark:text-slate-300 mb-6">{description}</p>
        <Button variant="outline" className="w-full border-gold-500/50 text-gold-500 hover:bg-gold-500/10">
          View Project <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
