import { getDictionary } from "@/lib/dictionaries"
import WallStudCalculator from "@/components/wall-stud-calculator"

export default async function WallStudPage({ params }: { params: { lang: string } }) {
  // Get dictionary on the server
  const dict = await getDictionary(params.lang)

  return <WallStudCalculator dict={dict} lang={params.lang} />
}
