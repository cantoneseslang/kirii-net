"use client"

import { useState } from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

export function ProcessTimeline() {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      title: "Initial Consultation",
      description:
        "We begin with a detailed consultation to understand your vision, requirements, and space constraints. Our design experts will guide you through material options and design possibilities.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gold-500"
        >
          <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h16a2 2 0 0 1 1.2.4" />
          <path d="M2 10h20" />
          <path d="M7 15h.01" />
          <path d="M11 15h2" />
          <path d="M16 5V3a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v2" />
        </svg>
      ),
    },
    {
      title: "Measurement & Design",
      description:
        "Our team conducts precise measurements of your space and creates detailed designs based on your requirements. We use advanced technology to ensure accuracy and provide 3D visualizations when needed.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gold-500"
        >
          <path d="M2 12h5" />
          <path d="M17 12h5" />
          <path d="M9 12h6" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
    },
    {
      title: "Material Selection",
      description:
        "Choose from our premium range of European glass and aluminium materials. We help you select the perfect options that balance aesthetics, functionality, and durability for your specific project.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gold-500"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      ),
    },
    {
      title: "Fabrication",
      description:
        "Our skilled craftsmen fabricate your custom glass and aluminium products using state-of-the-art equipment. Every piece is crafted with precision and undergoes rigorous quality control checks.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gold-500"
        >
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      ),
    },
    {
      title: "Installation",
      description:
        "Our professional installation team ensures your products are installed with precision and care. We minimize disruption to your space and adhere to the highest safety and quality standards.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gold-500"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      title: "Final Inspection & Handover",
      description:
        "We conduct a thorough inspection with you to ensure everything meets our high standards and your expectations. We also provide maintenance advice and warranty information before final handover.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gold-500"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
  ]

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className={cn(
              "bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-white/10 cursor-pointer transition-all duration-300",
              activeStep === index ? "ring-2 ring-gold-500" : "hover:bg-white/10 dark:hover:bg-slate-700/50",
            )}
            onClick={() => setActiveStep(index)}
          >
            <div className="h-12 w-12 rounded-full bg-gold-500/20 flex items-center justify-center mb-4">
              {step.icon}
            </div>
            <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">{step.title}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">{step.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="relative">
        <div className="absolute left-0 top-1/2 w-full h-1 bg-white/10 transform -translate-y-1/2" />
        <div className="relative flex justify-between">
          {steps.map((_, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center z-10",
                index <= activeStep ? "bg-gold-500" : "bg-white/20 dark:bg-slate-700",
              )}
              onClick={() => setActiveStep(index)}
            >
              {index < activeStep && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-900"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
