import { redirect } from "next/navigation"
import { i18n } from "@/lib/i18n-config"

export default function Home() {
  // Default redirect to the first locale
  redirect(`/${i18n.defaultLocale}`)
}
