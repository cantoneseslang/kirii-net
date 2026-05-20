import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Globe, Phone, ExternalLink } from "lucide-react"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "關於我們 | KIRII NET",
  description:
    "KIRII（香港）有限公司成立於1987年，提供金屬天花、石膏板及建築裝飾材料，服務香港及大灣區建築業界。",
}

const networkSites = [
  {
    name: "桐井製作所",
    url: "https://www.kirii.co.jp",
    description: "日本總公司",
  },
  {
    name: "佛山市三水桐井建築材料有限公司",
    url: "https://www.kirii.cn",
    description: "中國製造基地",
  },
  {
    name: "香港桐井有限公司",
    url: "https://www.kirii.com.hk",
    description: "香港及澳門業務",
  },
] as const

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative w-full py-16 md:py-24 overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <div className="absolute inset-0 opacity-30">
            <Image
              src="/images/uploaded/main-home-page.png"
              alt=""
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="relative z-10 container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                我們將設計師的想法變為現實
              </h1>
              <p className="text-gray-200 md:text-lg leading-relaxed">
                金屬天花是不可缺少的建築裝飾產品。Wellbone®（維邦）金屬天花品牌擁有多種各具特色、品質優異的產品系列，可以配合建築師和設計師的設計。Wellbone®（維邦）能夠廣泛使用於辦公大樓、醫院、酒店、大型商場、機場、地鐵、車站、銀行、學校和住宅公寓等場所。
              </p>
              <div className="flex items-center justify-center gap-2 text-gray-300">
                <Phone className="h-5 w-5 shrink-0" />
                <a href="tel:+85222648166" className="hover:text-white transition-colors">
                  (852) 2264 8166
                </a>
                <span>/</span>
                <a href="tel:+85227972026" className="hover:text-white transition-colors">
                  2797 2026
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* About KIRII */}
        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">關於我們</h2>
              <p className="text-xl text-muted-foreground">我們是?</p>
            </div>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-start">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                <Image
                  src="/images/uploaded/main-home-page.png"
                  alt="KIRII 香港"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">KIRII（香港）有限公司</strong>
                  成立於1987年，由一家國際大型企業投資。桐井建材有限公司生產各種金屬建築產品，是日本最大的製造商之一，我們在日本、香港和廣東設有十三家製造工廠，銷售網絡遍佈世界各地。
                </p>
                <p>
                  我們致力於透過製造高品質的建築材料來改善生活環境並為客戶提供技術支援。為了增強我們的服務，我們在香港設有製造工廠，生產能力為
                  6,000 公噸用於乾牆和天花板框架系統的 GI，以實現高效的交付服務。我們與 BPB Asia Limited、CertainTeed Corporation、James
                  Hardie、NAKA Corporation 以及 A&A Material Corporation 合作，代理其產品在香港和澳門地區提供石膏板及天花板系統，從而為建築師和設計師提供系統解決方案。
                </p>
                <p>
                  2006年，公司向大珠三角投資—設立三水桐井建材廠有限公司作為金屬天花板和覆層生產工廠，實現產品多樣化和中國銷售網路的發展。
                </p>
                <p>
                  KIRII 公司實踐 ISO 9001:2015 管理體系，提升產品品質，豐富產品線，提升施工業績效與顧客滿意度。KIRII 以「標準化」、「系統化」、「自動化」、「環保化」為最終使命。
                </p>
              </div>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <h3 className="text-xl font-bold text-foreground">佛山市三水桐井建築材料有限公司</h3>
                <p>
                  管理層均為業內擁有十多年專業經驗的優秀技術和企管人才，帶領200多人的團隊，嚴謹地執行 ISO 9001:2000
                  品質體系，以「不求造最多，只求造最好」的企業宗旨，竭誠為建築裝飾業界提供迅速而優質的金屬建築裝飾產品。
                </p>
                <p>
                  為配合日本總公司業務發展需要，香港桐井有限公司和滿僑有限公司的業務已於2024年7月1日整合，整合後滿僑的業務將會歸入香港桐井，並一起推進桐井品牌發展。
                </p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-6 text-center">
                <h3 className="text-lg font-semibold mb-4">代理品牌及認證</h3>
                <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
                  <img src="/images/uploaded/gyproc.png" alt="Gyproc" className="h-10 w-auto" />
                  <img src="/images/uploaded/saint-gobain.png" alt="Saint-Gobain" className="h-10 w-auto" />
                  <img src="/images/uploaded/taishan.jpg" alt="泰山石膏板" className="h-10 w-auto" />
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <img
                      key={n}
                      src={`/images/uploaded/${n}.png`}
                      alt={`認證 ${n}`}
                      className="h-14 w-auto"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product highlight */}
        <section className="w-full py-12 bg-muted">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-2xl font-bold mb-4">金屬牆身板</h2>
            <p className="text-muted-foreground whitespace-nowrap mx-auto mb-6">
              除金屬天花外，我們亦提供多樣化的金屬牆身板及建築裝飾產品，滿足各類商業及公共項目需求。
            </p>
            <Link
              href="/products"
              className="inline-flex items-center text-sm font-medium text-primary hover:underline"
            >
              瀏覽產品目錄
            </Link>
          </div>
        </section>

        {/* Network */}
        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
              <Globe className="h-10 w-10 text-primary" />
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">桐井網絡</h2>
              <p className="text-muted-foreground whitespace-nowrap">
                日本、中國及香港三地協同運營，為全球客戶提供優質金屬建築裝飾產品及系統解決方案。
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {networkSites.map((site) => (
                <Card key={site.url} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg leading-snug">{site.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{site.description}</p>
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      {site.url.replace("https://www.", "")}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
