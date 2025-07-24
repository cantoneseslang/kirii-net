"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function MaterialViewer() {
  const [rotation, setRotation] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    setRotation({
      x: (y - 0.5) * 20,
      y: (x - 0.5) * -20,
    })
  }

  return (
    <Tabs defaultValue="glass" className="w-full">
      <TabsList className="bg-white/10 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10 p-1 mb-8">
        <TabsTrigger value="glass" className="data-[state=active]:bg-gold-500 data-[state=active]:text-slate-900">
          Glass
        </TabsTrigger>
        <TabsTrigger value="aluminium" className="data-[state=active]:bg-gold-500 data-[state=active]:text-slate-900">
          Aluminium
        </TabsTrigger>
        <TabsTrigger value="hardware" className="data-[state=active]:bg-gold-500 data-[state=active]:text-slate-900">
          Hardware
        </TabsTrigger>
      </TabsList>

      <TabsContent value="glass" className="mt-0">
        <div
          className="relative h-[400px] rounded-2xl overflow-hidden bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10 perspective-1000"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setRotation({ x: 0, y: 0 })}
        >
          <motion.div
            className="absolute inset-0 p-8 flex items-center justify-center"
            animate={{ rotateX: rotation.x, rotateY: rotation.y }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="relative w-full h-full">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[300px] h-[300px] rounded-lg overflow-hidden shadow-2xl">
                  <Image src="/placeholder.svg?key=bc4rt" alt="Tempered Glass" fill className="object-cover" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20">
                <h3 className="text-xl font-bold text-white mb-2">Tempered Safety Glass</h3>
                <p className="text-sm text-white/80">
                  Our premium tempered glass is 4-5 times stronger than regular glass and designed to break into small,
                  harmless pieces if damaged.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </TabsContent>

      <TabsContent value="aluminium" className="mt-0">
        <div
          className="relative h-[400px] rounded-2xl overflow-hidden bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10 perspective-1000"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setRotation({ x: 0, y: 0 })}
        >
          <motion.div
            className="absolute inset-0 p-8 flex items-center justify-center"
            animate={{ rotateX: rotation.x, rotateY: rotation.y }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="relative w-full h-full">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[300px] h-[300px] rounded-lg overflow-hidden shadow-2xl">
                  <Image src="/placeholder.svg?key=e5fuq" alt="Aluminium Profile" fill className="object-cover" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20">
                <h3 className="text-xl font-bold text-white mb-2">European Aluminium Profiles</h3>
                <p className="text-sm text-white/80">
                  Our aluminium profiles feature thermal break technology for superior insulation and energy efficiency.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </TabsContent>

      <TabsContent value="hardware" className="mt-0">
        <div
          className="relative h-[400px] rounded-2xl overflow-hidden bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10 perspective-1000"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setRotation({ x: 0, y: 0 })}
        >
          <motion.div
            className="absolute inset-0 p-8 flex items-center justify-center"
            animate={{ rotateX: rotation.x, rotateY: rotation.y }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="relative w-full h-full">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[300px] h-[300px] rounded-lg overflow-hidden shadow-2xl">
                  <Image src="/placeholder.svg?key=eefpo" alt="Premium Hardware" fill className="object-cover" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20">
                <h3 className="text-xl font-bold text-white mb-2">Premium Hardware</h3>
                <p className="text-sm text-white/80">
                  We use only the highest quality hardware components for smooth operation and long-lasting durability.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
