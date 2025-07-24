"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PageHeader } from "@/components/page-header"
import { ContactForm } from "@/components/contact-form"
import { MapPin, Phone, VoicemailIcon as Fax, Mail } from "lucide-react"
import { type Language, getTranslation, loadLanguage } from "@/lib/i18n"

export default function ContactPage() {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    const savedLanguage = loadLanguage()
    setLanguage(savedLanguage)
  }, [])

  const t = getTranslation(language)
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <PageHeader
          title={t.contactUs}
          highlightedText={t.getInTouch}
          description={t.contactPageDesc}
          backgroundImage="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/about-kirii-01.jpg-xiKJjANxvt5rzvEWA4bxRJmmTE28jE.jpeg"
          badge={t.getInTouch}
        />

        <section className="py-20 md:py-24 bg-slate-900 text-white relative">
          <div className="absolute inset-0 bg-[url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/about-kirii-01.jpg-xiKJjANxvt5rzvEWA4bxRJmmTE28jE.jpeg')] opacity-10 bg-cover bg-center" />

          <div className="container mx-auto px-4 md:px-6 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
                  {t.weWouldLoveToHear} <span className="text-gold-500">{t.hearFromYou}</span>
                </h2>

                <p className="text-lg text-slate-300 mb-8">
                  {t.contactDescription}
                </p>

                <div className="space-y-6 mb-8">
                  <div>
                    <h3 className="font-semibold text-xl mb-4 text-gold-500">{t.companyInformation}</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-lg text-white">{t.kiriiSanshuiBuilding}</h4>
                        <div className="flex items-start gap-4 mt-2">
                          <MapPin className="h-5 w-5 text-gold-500 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-slate-300">
                              {t.postalCode}: 528100
                              <br />
                              {t.address}: {t.companyFullAddress}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Phone className="h-5 w-5 text-gold-500" />
                        <div>
                          <h4 className="font-semibold text-white">{t.tel}</h4>
                          <p className="text-slate-300">
                            {t.phoneNumber1}
                            {language !== "en" && (
                              <>
                                <br />
                                {t.phoneNumber2}
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Fax className="h-5 w-5 text-gold-500" />
                        <div>
                          <h4 className="font-semibold text-white">{t.fax}</h4>
                          <p className="text-slate-300">{t.faxNumber}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Mail className="h-5 w-5 text-gold-500" />
                        <div>
                          <h4 className="font-semibold text-white">{t.email}</h4>
                          <p className="text-slate-300">{t.emailAddress}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="font-semibold text-lg mb-4">{t.businessHours}</h3>
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div>{t.mondayFriday}</div>
                    <div>8:00 AM - 6:00 PM</div>
                    <div>{t.saturday}</div>
                    <div>9:00 AM - 4:00 PM</div>
                    <div>{t.sunday}</div>
                    <div>{t.closed}</div>
                  </div>
                </div>

                <div className="mb-8">
                  <a
                    href="https://maps.app.goo.gl/ERew3Eos5piUiCNR8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gold-500 text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-gold-600 transition-colors"
                  >
                    <MapPin className="h-5 w-5" />
                    {t.viewOnGoogleMaps}
                  </a>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
                <ContactForm />
              </div>
            </div>
          </div>
        </section>

        <section className="relative h-[400px] md:h-[600px]">
          <div className="absolute inset-0">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.234567890123!2d112.8123456789!3d23.1234567890!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDA3JzI0LjQiTiAxMTLCsDQ4JzQ0LjQiRQ!5e0!3m2!1sen!2scn!4v1234567890123!5m2!1sen!2scn"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div className="absolute top-8 left-8 md:top-12 md:left-12 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg max-w-sm">
            <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">{t.ourFactory}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              {t.visitOurFactory}
            </p>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4 text-gold-500" />
              <span className="text-sm">Sanshui Foshan, GuangDong, China</span>
            </div>
            <a
              href="https://maps.app.goo.gl/ERew3Eos5piUiCNR8"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-500 hover:text-gold-600 text-sm font-medium"
            >
              {t.openInGoogleMaps} →
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
