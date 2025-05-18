import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Calculator, FileText, LayoutGrid, BookOpen } from "lucide-react"
import { getDictionary } from "@/lib/dictionaries"
import { SiteHeader } from "@/components/site-header"

interface HomeProps {
  params: { lang: string }
}

export default async function Home(props: HomeProps) {
  // Extract params to avoid direct access
  const { params } = props;
  // Store the lang in a separate variable
  const lang = String(params?.lang || 'en');
  const dict = await getDictionary(lang);

  return (
    <div className="container mx-auto px-4 py-12">
      <SiteHeader title={dict.home.title} lang={lang} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <Card className="shadow-md hover:shadow-lg transition-shadow flex flex-col min-h-[450px]">
          <CardHeader className="bg-slate-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-slate-700" />
              {dict.home.wallStudModule}
            </CardTitle>
            <CardDescription>{dict.home.wallStudDescription}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 flex-grow">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 mr-2 mt-0.5 text-slate-600" />
                <span>{dict.home.wallStudFeature1}</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 mr-2 mt-0.5 text-slate-600" />
                <span>{dict.home.wallStudFeature2}</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 mr-2 mt-0.5 text-slate-600" />
                <span>{dict.home.wallStudFeature3}</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link href={`/${lang}/wall-stud`} className="w-full">
              <Button className="w-full">
                {dict.common.startCalculation}
                <Calculator className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow flex flex-col min-h-[450px]">
          <CardHeader className="bg-slate-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-slate-700" />
              {dict.home.ceilingModule}
            </CardTitle>
            <CardDescription>{dict.home.ceilingDescription}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 flex-grow">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 mr-2 mt-0.5 text-slate-600" />
                <span>{dict.home.ceilingFeature1}</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 mr-2 mt-0.5 text-slate-600" />
                <span>{dict.home.ceilingFeature2}</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 mr-2 mt-0.5 text-slate-600" />
                <span>{dict.home.ceilingFeature3}</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link href={`/${lang}/ceiling-system`} className="w-full">
              <Button className="w-full">
                {dict.common.startCalculation}
                <Calculator className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow flex flex-col min-h-[450px]">
          <CardHeader className="bg-slate-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-slate-700" />
              {lang === "en" ? "Sample Calculation Guide" : "樣本計算指南"}
            </CardTitle>
            <CardDescription>
              {lang === "en"
                ? "Input guide to get the same results as the sample calculation document"
                : "輸入指南以獲得與樣本計算相同的結果"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 flex-grow">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 mr-2 mt-0.5 text-slate-600" />
                <span>
                  {lang === "en"
                    ? "Overview of sample calculation document and explanation of input parameters"
                    : "樣本計算文檔概述和輸入參數說明"}
                </span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 mr-2 mt-0.5 text-slate-600" />
                <span>{lang === "en" ? "Step-by-step input guide" : "逐步輸入指南"}</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 mr-2 mt-0.5 text-slate-600" />
                <span>
                  {lang === "en"
                    ? "Comparison of calculation results and verification method"
                    : "計算結果比較和驗證方法"}
                </span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link href={`/${lang}/sample-guide`} className="w-full">
              <Button className="w-full">
                {lang === "en" ? "View Guide" : "查看指南"}
                <BookOpen className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-semibold mb-4">{dict.home.systemFeatures}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="p-6 bg-slate-50 rounded-lg">
            <h3 className="font-medium mb-2">{dict.home.feature1Title}</h3>
            <p className="text-sm text-muted-foreground">{dict.home.feature1Description}</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-lg">
            <h3 className="font-medium mb-2">{dict.home.feature2Title}</h3>
            <p className="text-sm text-muted-foreground">{dict.home.feature2Description}</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-lg">
            <h3 className="font-medium mb-2">{dict.home.feature3Title}</h3>
            <p className="text-sm text-muted-foreground">{dict.home.feature3Description}</p>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link href={`/${lang}/documentation`}>
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            {dict.common.viewDocumentation}
          </Button>
        </Link>
      </div>
    </div>
  )
}
