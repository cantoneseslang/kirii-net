"use client"

import type React from "react"
import { useState, useTransition, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { sendContactEmail } from "@/app/actions/send-email"
import { type Language, getTranslation, loadLanguage } from "@/lib/i18n"

export function ContactForm() {
  const [language, setLanguage] = useState<Language>("en")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const savedLanguage = loadLanguage()
    setLanguage(savedLanguage)
  }, [])

  const t = getTranslation(language)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await sendContactEmail(formData)

      if (result.success) {
        setSubmitted(true)
      } else {
        setError(result.error || "An error occurred. Please try again.")
      }
    })
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
          <h3 className="text-xl font-bold mb-2 text-white">{t.messageSentSuccessfully}</h3>
          <p className="text-slate-300 mb-6">
            {t.thankYouForContacting}
          </p>
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 bg-transparent"
            onClick={() => setSubmitted(false)}
          >
            {t.sendAnotherMessage}
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">
                {t.fullNameRequired}
              </Label>
              <Input
                id="name"
                name="name"
                placeholder={t.enterFullName}
                required
                disabled={isPending}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                {t.emailAddressRequired}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t.enterEmailAddress}
                required
                disabled={isPending}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white">
              {t.phoneNumber}
            </Label>
            <Input
              id="phone"
              name="phone"
              placeholder={t.enterPhoneNumber}
              disabled={isPending}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject" className="text-white">
              {t.subject}
            </Label>
            <Select name="subject" disabled={isPending}>
              <SelectTrigger id="subject" className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder={t.selectSubject} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quote">{t.requestQuote}</SelectItem>
                <SelectItem value="info">{t.productInformation}</SelectItem>
                <SelectItem value="support">{t.customerSupport}</SelectItem>
                <SelectItem value="feedback">{t.feedback}</SelectItem>
                <SelectItem value="other">{t.other}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-white">
              {t.messageRequired}
            </Label>
            <Textarea
              id="message"
              name="message"
              placeholder={t.enterMessage}
              required
              disabled={isPending}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
              rows={5}
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-gold-500 hover:bg-gold-600 text-slate-900 disabled:opacity-50"
          >
            {isPending ? t.sending : t.sendMessage}
          </Button>
        </form>
      )}
    </div>
  )
}
