"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ShowcaseItem {
  id: string
  title: string
  category: string
  description: string
  features: string[]
  image: string
  price: string
}

export function InteractiveShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)

  const showcaseItems: ShowcaseItem[] = [
    {
      id: "aluminum-mirror",
      title: "Premium Aluminum Mirrors",
      category: "Mirrors",
      description:
        "Custom-crafted aluminum-framed mirrors with LED backlighting and anti-fog technology for modern bathrooms and living spaces.",
      features: ["LED Backlighting", "Anti-Fog Technology", "Custom Sizes", "Premium Aluminum Frame"],
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_5551.jpg-CcWD7nh2Li78b8mRmisTe8Ztq1tKjH.jpeg",
      price: "From TZS 250,000",
    },
    {
      id: "french-doors",
      title: "Elegant French Doors",
      category: "Doors",
      description:
        "Classic European-style French doors with modern aluminum frames, perfect for connecting indoor and outdoor spaces with elegance.",
      features: ["European Design", "Weather Resistant", "Custom Colors", "Premium Hardware"],
      image: "/images/frosted-glass-door.jpeg",
      price: "From TZS 800,000",
    },
    {
      id: "skylights",
      title: "Modern Skylights",
      category: "Skylights",
      description:
        "Energy-efficient skylights that bring natural light into your space while maintaining thermal performance and weather protection.",
      features: ["Energy Efficient", "UV Protection", "Remote Control", "Weather Sealed"],
      image: "/placeholder.svg?height=600&width=800",
      price: "From TZS 450,000",
    },
    {
      id: "glass-works",
      title: "Custom Glass Works",
      category: "Glass",
      description:
        "Comprehensive glass solutions including partitions, balustrades, and decorative glass installations for residential and commercial projects.",
      features: ["Tempered Safety Glass", "Custom Designs", "Professional Installation", "Maintenance Support"],
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_5549.jpg-8fCDDY84kB6sdgcjm8e0Tvfsm2YUOB.jpeg",
      price: "From TZS 180,000",
    },
  ]

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % showcaseItems.length)
  }

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + showcaseItems.length) % showcaseItems.length)
  }

  const currentItem = showcaseItems[activeIndex]

  return (
    <div className="relative">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Content */}
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div>
            <Badge className="gradient-primary text-white border-0 px-4 py-2 mb-4">{currentItem.category}</Badge>
            <h3 className="text-display-md mb-4">{currentItem.title}</h3>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">{currentItem.description}</p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Key Features:</h4>
            <div className="grid grid-cols-2 gap-3">
              {currentItem.features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <div className="h-2 w-2 rounded-full bg-gradient-primary" />
                  <span className="text-sm">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-white/10">
            <div>
              <p className="text-sm text-muted-foreground">Starting Price</p>
              <p className="text-2xl font-bold gradient-text">{currentItem.price}</p>
            </div>
            <Button className="btn-modern text-white border-0 group">
              Get Quote
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </motion.div>

        {/* Image Carousel */}
        <div className="relative">
          <div className="relative h-[500px] rounded-3xl overflow-hidden glass-card">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0"
              >
                <Image
                  src={currentItem.image || "/placeholder.svg"}
                  alt={currentItem.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
              <div className="flex gap-2">
                {showcaseItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === activeIndex ? "w-8 bg-white" : "w-2 bg-white/50"
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevSlide}
                  className="h-10 w-10 rounded-full bg-white/20 text-white hover:bg-white/30"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextSlide}
                  className="h-10 w-10 rounded-full bg-white/20 text-white hover:bg-white/30"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
