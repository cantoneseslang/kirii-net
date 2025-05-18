import { getDictionary } from "@/lib/dictionaries"
import CeilingSystemCalculator from "@/components/ceiling-system-calculator"

export default async function CeilingSystemPage({ params }: { params: { lang: string } }) {
  // Use Promise.resolve to properly await the params.lang
  const langValue = await Promise.resolve(params.lang);
  const dict = await getDictionary(langValue)

  return <CeilingSystemCalculator dict={dict} lang={langValue} />
}
