"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GalleryImage {
  src: string
  alt: string
  category: string
}

export function GalleryShowcase() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)

  const galleryImages: GalleryImage[] = [
    {
      src: "/images/frosted-glass-door.jpeg",
      alt: "Elegant frosted glass door with chrome hardware",
      category: "Glass Doors",
    },
    {
      src: "/images/wooden-frame-mirror.jpeg",
      alt: "Stylish wooden frame full-length mirror in bedroom setting",
      category: "Designer Mirrors",
    },
    {
      src: "/images/frameless-shower.jpeg",
      alt: "Modern frameless glass shower enclosure with black fixtures",
      category: "Shower Enclosures",
    },
    {
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_5551.jpg-CcWD7nh2Li78b8mRmisTe8Ztq1tKjH.jpeg",
      alt: "Luxury bathroom with designer mirror",
      category: "Bathroom Solutions",
    },
    {
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_5552.jpg-e9OZPdzTjrlEnzvlPjwrJuPBcC68eo.jpeg",
      alt: "Designer mirror with LED lighting",
      category: "Designer Mirrors",
    },
    {
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_5549.jpg-8fCDDY84kB6sdgcjm8e0Tvfsm2YUOB.jpeg",
      alt: "Glass shower enclosure",
      category: "Shower Enclosures",
    },
  ]

  const openLightbox = (image: GalleryImage) => {
    setSelectedImage(image)
    document.body.style.overflow = "hidden"
  }

  const closeLightbox = () => {
    setSelectedImage(null)
    document.body.style.overflow = "auto"
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {galleryImages.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="relative group cursor-pointer overflow-hidden rounded-lg"
            onClick={() => openLightbox(image)}
          >
            <div className="relative h-[300px] w-full">
              <Image
                src={image.src || "/placeholder.svg"}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent opacity-60 group-hover:opacity-70 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 p-4">
                <span className="inline-block bg-gold-500 text-slate-900 text-xs font-semibold px-2 py-1 rounded mb-2">
                  {image.category}
                </span>
                <p className="text-white text-sm">{image.alt}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={closeLightbox}>
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
              onClick={closeLightbox}
            >
              <X className="h-6 w-6" />
            </Button>
            <div className="relative h-full w-full">
              <Image
                src={selectedImage.src || "/placeholder.svg"}
                alt={selectedImage.alt}
                fill
                className="object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <div className="inline-block bg-black/70 text-white px-4 py-2 rounded">
                <span className="block text-gold-500 font-semibold">{selectedImage.category}</span>
                <p className="text-sm">{selectedImage.alt}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
