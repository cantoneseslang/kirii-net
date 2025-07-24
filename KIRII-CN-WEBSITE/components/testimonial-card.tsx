import { Star } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

interface TestimonialCardProps {
  quote: string
  author: string
  position: string
  rating: number
}

export function TestimonialCard({ quote, author, position, rating }: TestimonialCardProps) {
  return (
    <Card className="bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10 h-full">
      <CardContent className="p-6">
        <div className="flex items-center gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-5 w-5 ${i < rating ? "text-gold-500 fill-gold-500" : "text-slate-300"}`} />
          ))}
        </div>
        <p className="text-slate-600 dark:text-slate-300 mb-6 italic">"{quote}"</p>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center">
            <span className="text-gold-500 font-semibold">
              {author
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white">{author}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">{position}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
