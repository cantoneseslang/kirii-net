import Image from "next/image"
import { Badge } from "@/components/ui/badge"

interface PageHeaderProps {
  title: string
  highlightedText?: string
  description: string
  backgroundImage: string
  badge: string
}

export function PageHeader({ title, highlightedText, description, backgroundImage, badge }: PageHeaderProps) {
  return (
    <section className="relative py-20 px-4 md:px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-800/80 z-10"></div>
      <div className="absolute inset-0">
        <Image
          src={backgroundImage || "/placeholder.svg"}
          alt="Page Header Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="container mx-auto relative z-20 text-center text-white">
        <Badge className="mb-6 bg-orange-500 text-white border-orange-500" style={{ fontFamily: "Arial, sans-serif" }}>
          {badge}
        </Badge>

        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight" style={{ fontFamily: "Arial, sans-serif" }}>
          {highlightedText ? (
            <>
              {title.replace(highlightedText, "")}
              <br />
              <span className="text-orange-400">{highlightedText}</span>
            </>
          ) : (
            title
          )}
        </h1>

        <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto" style={{ fontFamily: "Arial, sans-serif" }}>
          {description}
        </p>
      </div>
    </section>
  )
}
