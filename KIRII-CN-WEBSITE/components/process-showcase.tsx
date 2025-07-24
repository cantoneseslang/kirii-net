"use client"

import { motion } from "framer-motion"
import { CheckCircle, Clock, Users, Wrench } from "lucide-react"

export function ProcessShowcase() {
  const processes = [
    {
      icon: Users,
      title: "Consultation & Design",
      description:
        "Our experts work with you to understand your vision and create detailed designs tailored to your space and requirements.",
      duration: "1-2 Days",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Wrench,
      title: "Precision Manufacturing",
      description:
        "Using European-grade materials and advanced machinery, we craft your custom glass and aluminum solutions with exceptional precision.",
      duration: "5-10 Days",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: CheckCircle,
      title: "Professional Installation",
      description:
        "Our certified technicians ensure flawless installation with minimal disruption to your daily routine and complete quality assurance.",
      duration: "1-3 Days",
      color: "from-emerald-500 to-green-500",
    },
    {
      icon: Clock,
      title: "Ongoing Support",
      description:
        "We provide comprehensive aftercare including maintenance guidance, warranty support, and future upgrade consultations.",
      duration: "Lifetime",
      color: "from-amber-500 to-yellow-500",
    },
  ]

  return (
    <div className="relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {processes.map((process, index) => (
          <motion.div
            key={process.title}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Connection Line */}
            {index < processes.length - 1 && (
              <div className="hidden lg:block absolute top-16 left-full w-8 h-0.5 bg-gradient-to-r from-white/30 to-transparent z-10" />
            )}

            <div className="glass-card p-6 text-center hover-lift group">
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${process.color} mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <process.icon className="h-8 w-8 text-white" />
              </div>

              <h3 className="text-xl font-bold mb-3">{process.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">{process.description}</p>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium">
                <Clock className="h-3 w-3" />
                {process.duration}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
