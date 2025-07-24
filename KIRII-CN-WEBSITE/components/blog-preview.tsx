import Image from "next/image"
import { Calendar } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface BlogPreviewProps {
  slug: string
  image: string
  title: string
  excerpt: string
  date: string
  author: string
  category: string
}

export function BlogPreview({ slug, image, title, excerpt, date, author, category }: BlogPreviewProps) {
  return (
    <Card className="overflow-hidden border-0 bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10 h-full">
      <div className="relative h-[200px]">
        <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover" />
        <Badge className="absolute top-4 right-4 bg-gold-500 text-slate-900 hover:bg-gold-600">{category}</Badge>
      </div>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-3">
          <Calendar className="h-4 w-4" />
          <span>{date}</span>
        </div>
        <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{title}</h3>
        <p className="text-slate-600 dark:text-slate-300 mb-4">{excerpt}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500 dark:text-slate-400">By {author}</span>
          <Button asChild variant="link" className="p-0 h-auto text-gold-500 hover:text-gold-600">
            <Link href={`/blog/${slug}`}>Read More</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
