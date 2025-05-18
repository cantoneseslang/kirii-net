import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, BookOpen, Calculator, Info } from "lucide-react"
import { getDictionary } from "@/lib/dictionaries"
import LanguageSwitcher from "@/components/language-switcher"

export default async function Documentation({ params }: { params: { lang: string } }) {
  // Use Promise.resolve to properly await the params.lang
  const langValue = await Promise.resolve(params.lang);
  const dict = await getDictionary(langValue)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Link href={`/${langValue}`} className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{dict.documentation.title}</h1>
        </div>
        <LanguageSwitcher currentLang={langValue} />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-3xl mx-auto mb-8">
          <TabsTrigger value="overview">{dict.documentation.tabs.overview}</TabsTrigger>
          <TabsTrigger value="wall-stud">{dict.documentation.tabs.wallStud}</TabsTrigger>
          <TabsTrigger value="ceiling">{dict.documentation.tabs.ceiling}</TabsTrigger>
          <TabsTrigger value="reference">{dict.documentation.tabs.reference}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                {dict.documentation.overview.title}
              </CardTitle>
              <CardDescription>{dict.documentation.overview.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">{dict.documentation.overview.purpose}</h3>
              <p>{dict.documentation.overview.purposeText}</p>

              <h3 className="text-lg font-medium">{dict.documentation.overview.mainFeatures}</h3>
              <ul className="list-disc pl-6 space-y-2">
                {dict.documentation.overview.mainFeaturesList.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>

              <h3 className="text-lg font-medium">{dict.documentation.overview.calculationTargets}</h3>
              <ul className="list-disc pl-6 space-y-2">
                {dict.documentation.overview.calculationTargetsList.map((target, index) => (
                  <li key={index}>{target}</li>
                ))}
              </ul>

              <h3 className="text-lg font-medium">{dict.documentation.overview.structuralCheckItems}</h3>
              <ul className="list-disc pl-6 space-y-2">
                {dict.documentation.overview.structuralCheckItemsList.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wall-stud" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                {dict.documentation.wallStud.title}
              </CardTitle>
              <CardDescription>{dict.documentation.wallStud.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">{dict.documentation.wallStud.inputItems}</h3>
              <ul className="list-disc pl-6 space-y-2">
                {dict.documentation.wallStud.inputItemsList.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>

              <h3 className="text-lg font-medium">{dict.documentation.wallStud.calculationContents}</h3>
              <ul className="list-disc pl-6 space-y-2">
                {dict.documentation.wallStud.calculationContentsList.map((content, index) => (
                  <li key={index}>{content}</li>
                ))}
              </ul>

              <h3 className="text-lg font-medium">{dict.documentation.wallStud.calculationFormulaSummary}</h3>
              <p>{dict.documentation.wallStud.calculationFormulaSummaryText}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ceiling" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                {dict.documentation.ceiling.title}
              </CardTitle>
              <CardDescription>{dict.documentation.ceiling.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">{dict.documentation.ceiling.inputItems}</h3>
              <ul className="list-disc pl-6 space-y-2">
                {dict.documentation.ceiling.inputItemsList.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>

              <h3 className="text-lg font-medium">{dict.documentation.ceiling.calculationContents}</h3>
              <ul className="list-disc pl-6 space-y-2">
                {dict.documentation.ceiling.calculationContentsList.map((content, index) => (
                  <li key={index}>{content}</li>
                ))}
              </ul>

              <h3 className="text-lg font-medium">{dict.documentation.ceiling.calculationFormulaSummary}</h3>
              <p>{dict.documentation.ceiling.calculationFormulaSummaryText}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reference" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {dict.documentation.reference.title}
              </CardTitle>
              <CardDescription>{dict.documentation.reference.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">{dict.documentation.reference.designCodes}</h3>
              <ul className="list-disc pl-6 space-y-2">
                {dict.documentation.reference.designCodesList.map((code, index) => (
                  <li key={index}>{code}</li>
                ))}
              </ul>

              <h3 className="text-lg font-medium">{dict.documentation.reference.productData}</h3>
              <ul className="list-disc pl-6 space-y-2">
                {dict.documentation.reference.productDataList.map((data, index) => (
                  <li key={index}>{data}</li>
                ))}
              </ul>

              <h3 className="text-lg font-medium">{dict.documentation.reference.technicalDocuments}</h3>
              <ul className="list-disc pl-6 space-y-2">
                {dict.documentation.reference.technicalDocumentsList.map((document, index) => (
                  <li key={index}>{document}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 text-center">
        <Link href={`/${langValue}`}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {dict.common.back}
          </Button>
        </Link>
      </div>
    </div>
  )
}
