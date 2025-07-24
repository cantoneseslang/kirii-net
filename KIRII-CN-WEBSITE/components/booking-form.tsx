"use client"

import type React from "react"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

export function BookingForm() {
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState<string>("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would handle the form submission here
    setSubmitted(true)
  }

  return (
    <div className="space-y-6">
      {submitted ? (
        <div className="text-center py-8">
          <div className="h-16 w-16 rounded-full bg-gold-500/20 flex items-center justify-center mx-auto mb-4">
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
          </div>
          <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Consultation Booked</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Thank you for booking a consultation. We will contact you shortly to confirm your appointment.
          </p>
          <Button variant="outline" onClick={() => setSubmitted(false)}>
            Book Another Consultation
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="Enter your full name" required className="bg-white/5 border-white/10" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              required
              className="bg-white/5 border-white/10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" placeholder="Enter your phone number" required className="bg-white/5 border-white/10" />
          </div>

          <div className="space-y-2">
            <Label>Consultation Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-white/5 border-white/10",
                    !date && "text-slate-500",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Preferred Time</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue placeholder="Select a time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="09:00">9:00 AM</SelectItem>
                <SelectItem value="10:00">10:00 AM</SelectItem>
                <SelectItem value="11:00">11:00 AM</SelectItem>
                <SelectItem value="12:00">12:00 PM</SelectItem>
                <SelectItem value="14:00">2:00 PM</SelectItem>
                <SelectItem value="15:00">3:00 PM</SelectItem>
                <SelectItem value="16:00">4:00 PM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service">Service Interested In</Label>
            <Select>
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mirrors">Custom Mirrors</SelectItem>
                <SelectItem value="shower">Shower Enclosures</SelectItem>
                <SelectItem value="partitions">Glass Partitions</SelectItem>
                <SelectItem value="windows">Aluminium Windows</SelectItem>
                <SelectItem value="doors">Aluminium Doors</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Additional Information</Label>
            <Textarea
              id="message"
              placeholder="Tell us more about your project requirements"
              className="bg-white/5 border-white/10"
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full bg-gold-500 hover:bg-gold-600 text-slate-900">
            Book Consultation
          </Button>
        </form>
      )}
    </div>
  )
}
