"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { ArrowRight, Lightbulb, Shield, Zap, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function SpecialtyGrid() {
  const specialties = [
    {
      icon: Lightbulb,
      title: "Aluminum Mirrors",
      subtitle: "Premium Reflections",
      description:
        "Custom aluminum-framed mirrors with LED integration, anti-fog technology, and modern aesthetics for luxury bathrooms and living spaces.",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_5552.jpg-e9OZPdzTjrlEnzvlPjwrJuPBcC68eo.jpeg",
      features: ["LED Backlighting", "Anti-Fog Coating", "Custom Shapes", "Smart Controls"],
      color: "from-blue-500 to-purple-600",
    },
    {
      icon: Shield,
      title: "French Doors",
      subtitle: "European Elegance",
      description:
        "Authentic French door designs with modern aluminum construction, bringing timeless European style to your home with superior performance.",
      image: "/images/frosted-glass-door.jpeg",
      features: ["Classic Design", "Weather Sealing", "Security Features", "Custom Finishes"],
      color: "from-emerald-500 to-teal-600",
    },
    {
      icon: Zap,
      title: "Skylights",
      subtitle: "Natural Illumination",
      description:
        "Energy-efficient skylights that transform spaces with natural light while maintaining thermal performance and weather protection.",
      image: "/placeholder.svg?height=400&width=600",
      features: ["UV Protection", "Remote Control", "Energy Efficient", "Weather Resistant"],
      color: "from-amber-500 to-orange-600",
    },
    {
      icon: Award,
      title: "Glass Works",
      subtitle: "Transparent Excellence",
      description:
        "Comprehensive glass solutions including shower enclosures, partitions, balustrades, and decorative installations for any space.",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_5545.jpg-WeFPa8FBY424HmmYvlP3sFgkx1vZwk.jpeg",
      features: ["Safety Glass", "Custom Designs", "Professional Install", "Maintenance Support"],
      color: "from-rose-500 to-pink-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {specialties.map((specialty, index) => (
        <motion.div
          key={specialty.title}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          viewport={{ once: true }}
        >
          <Card className="glass-card hover-lift h-full overflow-hidden group">
            <div className="relative h-48">
              <Image
                src={specialty.image || "/placeholder.svg"}
                alt={specialty.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className={`absolute inset-0 bg-gradient-to-br ${specialty.color} opacity-80`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <div className="absolute top-4 left-4">
                <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <specialty.icon className="h-6 w-6 text-white" />
                </div>
              </div>

              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold">{specialty.title}</h3>
                <p className="text-sm opacity-90">{specialty.subtitle}</p>
              </div>
            </div>

            <CardContent className="p-6">
              <p className="text-muted-foreground mb-6 leading-relaxed">{specialty.description}</p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {specialty.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-gradient-primary" />
                      <span className="text-xs text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button variant="ghost" className="w-full justify-between group hover:bg-white/5">
                  Learn More
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
