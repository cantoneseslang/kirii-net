"use client"

import Link from "next/link"
import Image from "next/image"
import LanguageSwitcher from "@/components/language-switcher"
import logoImage from "@/public/KIRII-logo-3.png"

export function SiteHeader({ title, lang }: { title: string, lang: string }) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-4">
        <Link href={`/${lang}`} className="h-10">
          <Image 
            src={logoImage}
            alt="KIRII" 
            height={40} 
            width={120} 
            className="h-full w-auto object-contain" 
            priority
          />
        </Link>
        <h1 className={`font-bold ${lang === 'en' ? 'text-2xl' : 'text-3xl'}`}>{title}</h1>
      </div>
      <LanguageSwitcher currentLang={lang} />
    </div>
  )
}
