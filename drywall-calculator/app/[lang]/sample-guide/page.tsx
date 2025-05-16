import type { Metadata } from "next"
import SampleGuide from "@/components/sample-guide"
import { getDictionary } from "@/lib/dictionaries"

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const dict = await getDictionary(params.lang)
  return {
    title: dict.sampleGuide?.title || "Sample Calculation Guide",
  }
}

export default function SampleGuidePage({ params }: { params: { lang: string } }) {
  return <SampleGuide lang={params.lang} />
}
