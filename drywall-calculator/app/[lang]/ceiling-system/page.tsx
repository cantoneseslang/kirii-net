import { getDictionary } from "@/lib/dictionaries"
import CeilingSystemCalculator from "@/components/ceiling-system-calculator"

export default async function CeilingSystemPage({ params }: { params: { lang: string } }) {
  // Get dictionary on the server
  const dict = await getDictionary(params.lang)

  return <CeilingSystemCalculator dict={dict} lang={params.lang} />
}
