"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Quote } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  content: string
  rating: number
  project: string
}

export function TestimonialsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)

  const testimonials: Testimonial[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      role: "Interior Designer",
      company: "Luxury Homes TZ",
      content:
        "CHEVAL MIRROR transformed our client's bathroom with their stunning aluminum mirrors and French doors. The LED backlighting and anti-fog technology are game-changers. Exceptional quality and professional installation.",
      rating: 5,
      project: "Luxury Villa Renovation",
    },
    {
      id: "2",
      name: "David Mwalimu",
      role: "Architect",
      company: "Modern Spaces Architecture",
      content:
        "Their skylights brought incredible natural light to our commercial project. The energy efficiency and weather sealing exceeded our expectations. The team's attention to detail is remarkable.",
      rating: 5,
      project: "Office Complex Skylights",
    },
    {
      id: "3",
      name: "Grace Kimaro",
      role: "Homeowner",
      company: "Private Residence",
      content:
        "The custom glass works for our shower enclosure and balcony railings are absolutely beautiful. Professional service from consultation to installation. Highly recommend CHEVAL MIRROR!",
      rating: 5,
      project: "Residential Glass Installation",
    },
    {
      id: "4",
      name: "Michael Thompson",
      role: "Hotel Manager",
      company: "Serena Hotels",
      content:
        "We chose CHEVAL MIRROR for our hotel renovation project. Their French doors and aluminum mirrors added elegance to our suites. Outstanding craftsmanship and timely delivery.",
      rating: 5,
      project: "Hotel Suite Renovation",
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [testimonials.length])

  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="relative h-[400px] glass-card rounded-3xl p-8 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.6 }}
            className="h-full flex flex-col justify-center"
          >
            <div className="text-center mb-8">
              <Quote className="h-12 w-12 text-gold-500 mx-auto mb-6 opacity-50" />
              <p className="text-xl md:text-2xl leading-relaxed text-foreground mb-6 italic">
                "{testimonials[activeIndex].content}"
              </p>

              <div className="flex justify-center mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < testimonials[activeIndex].rating ? "text-gold-500 fill-gold-500" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-gradient-primary text-white text-lg font-semibold">
                  {testimonials[activeIndex].name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="text-left">
                <h4 className="font-semibold text-lg">{testimonials[activeIndex].name}</h4>
                <p className="text-muted-foreground">{testimonials[activeIndex].role}</p>
                <p className="text-sm text-muted-foreground">{testimonials[activeIndex].company}</p>
                <p className="text-xs text-gold-500 mt-1">{testimonials[activeIndex].project}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeIndex ? "w-8 bg-gold-500" : "w-2 bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
