"use client"

import { useState, useEffect } from "react"
import { Phone, VoicemailIcon as Fax, Mail } from "lucide-react"
import { type Language, getTranslation, loadLanguage } from "@/lib/i18n"

export function SiteFooter() {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    const savedLanguage = loadLanguage()
    setLanguage(savedLanguage)
  }, [])

  const t = getTranslation(language)
  return (
    <footer className="bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">{t.companyInfo}</h3>
            <p className="text-gray-600">
              {t.companyName}
              <br />
              {t.postalCode}: 528100
              <br />
              {t.address}: {t.companyFullAddress}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">{t.contact}</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gold-500" />
                <div>
                  <div>{t.tel}</div>
                  <div>{t.telephone}</div>
                  {language !== "en" && (
                    <div>{t.phoneNumber2}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Fax className="h-4 w-4 text-gold-500" />
                <span>{t.fax}: {t.faxNumber}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gold-500" />
                <span>{t.email}: {t.emailAddress}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">{t.quickLinks}</h3>
            <ul className="text-gray-600 space-y-2">
              <li>
                <a href="/">{t.home}</a>
              </li>
              <li>
                <a href="/about">{t.about}</a>
              </li>
              <li>
                <a href="/products">{t.products}</a>
              </li>
              <li>
                <a href="/contact">{t.contact}</a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">{t.newsletter}</h3>
            <p className="text-gray-600 mb-4">{t.newsletterDesc}</p>
            <div className="flex">
              <input
                type="email"
                placeholder={t.enterEmail}
                className="border border-gray-300 rounded-l px-4 py-2 w-full"
              />
              <button className="bg-gold-500 text-white rounded-r px-4 py-2">{t.subscribe}</button>
            </div>
          </div>
        </div>
        <div className="text-center mt-8">
          <p className="text-gray-500">&copy; {new Date().getFullYear()} {t.companyName}. {t.allRightsReserved}</p>
        </div>
      </div>
    </footer>
  )
}
