import type { Metadata } from "next"
import SampleGuide from "@/components/sample-guide"
import { getDictionary } from "@/lib/dictionaries"

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  // Use Promise.resolve to properly await the params.lang
  const langValue = await Promise.resolve(params.lang);
  const dict = await getDictionary(langValue)
  return {
    title: dict.sampleGuide?.title || "Sample Calculation Guide",
  }
}

export default async function SampleGuidePage({ params }: { params: { lang: string } }) {
  // Use Promise.resolve to properly await the params.lang
  const langValue = await Promise.resolve(params.lang);
  return <SampleGuide lang={langValue} />
}
