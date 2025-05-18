import { getDictionary } from "@/lib/dictionaries"
import WallStudCalculator from "@/components/wall-stud-calculator"

export default async function WallStudPage({ params }: { params: { lang: string } }) {
  // Use Promise.resolve to properly await the params.lang
  const langValue = await Promise.resolve(params.lang);
  const dict = await getDictionary(langValue)

  return <WallStudCalculator dict={dict} lang={langValue} />
}
