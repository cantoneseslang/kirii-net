import Image from "next/image"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TeamMemberProps {
  image: string
  name: string
  position: string
  bio: string
  specialties: string[]
}

export function TeamMember({ image, name, position, bio, specialties }: TeamMemberProps) {
  return (
    <Card className="overflow-hidden border-0 bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm border border-white/10 h-full">
      <div className="relative h-[250px]">
        <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6">
          <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
          <p className="text-gold-500 text-sm">{position}</p>
        </div>
      </div>
      <CardContent className="p-6">
        <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">{bio}</p>
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Specialties</h4>
          <div className="flex flex-wrap gap-2">
            {specialties.map((specialty, index) => (
              <Badge key={index} variant="outline" className="border-gold-500/30 text-gold-500 bg-gold-500/5">
                {specialty}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
