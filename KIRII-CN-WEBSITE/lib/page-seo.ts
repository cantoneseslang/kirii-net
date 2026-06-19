import type { Metadata } from "next"
import type { Language } from "@/lib/i18n"
import { isValidLocale, localeToLanguage, type Locale } from "@/lib/locale"
import { createPageMetadata } from "@/lib/seo"

export type SeoPageKey =
  | "home"
  | "about"
  | "products"
  | "projects"
  | "contact"
  | "blog"
  | "privacy"
  | "terms"
  | "cookies"

const pageSeo: Record<SeoPageKey, Record<Language, { title: string; description: string }>> = {
  home: {
    en: {
      title: "Professional Ceiling Systems & Building Materials",
      description:
        "Kirii Construction Materials (三水桐井) supplies aluminum ceiling systems, building accessories, and custom construction solutions across Hong Kong and China.",
    },
    "zh-HK": {
      title: "專業天花系統及建築材料",
      description:
        "三水桐井建材提供鋁制天花系統、建築配件及定制工程解決方案，服務香港及中國市場。",
    },
    "zh-CN": {
      title: "专业天花系统及建筑材料",
      description:
        "三水桐井建材提供铝制天花系统、建筑配件及定制工程解决方案，服务香港及中国市场。",
    },
  },
  about: {
    en: {
      title: "About Us",
      description:
        "Learn about Kirii Construction Materials (三水桐井), a leading supplier of aluminum ceiling systems and building materials serving Hong Kong and China since 2008.",
    },
    "zh-HK": {
      title: "關於我們",
      description:
        "了解三水桐井建材——自2008年起為香港及中國提供鋁制天花系統和建築材料的领先供应商。",
    },
    "zh-CN": {
      title: "关于我们",
      description:
        "了解三水桐井建材——自2008年起为香港及中国提供铝制天花系统和建筑材料的领先供应商。",
    },
  },
  products: {
    en: {
      title: "Products",
      description:
        "Explore Kirii ceiling systems including CH linear, CP clip-in, CR wide linear, HP hook-on, and building accessories for commercial and residential projects.",
    },
    "zh-HK": {
      title: "產品",
      description:
        "探索三水桐井天花系統，包括CH線型、CP卡扣式、CR寬線型、HP勾搭式天花及建築配件，適用於商業及住宅項目。",
    },
    "zh-CN": {
      title: "产品",
      description:
        "探索三水桐井天花系统，包括CH线型、CP卡扣式、CR宽线型、HP勾搭式天花及建筑配件，适用于商业及住宅项目。",
    },
  },
  projects: {
    en: {
      title: "Projects",
      description:
        "View Kirii project portfolio including MTR stations, hospitals, cultural centres, and commercial buildings across Hong Kong and China.",
    },
    "zh-HK": {
      title: "工程案例",
      description:
        "查看三水桐井工程案例，包括港鐵站、醫院、文化場館及商業建築項目。",
    },
    "zh-CN": {
      title: "工程案例",
      description:
        "查看三水桐井工程案例，包括港铁站、医院、文化场馆及商业建筑项目。",
    },
  },
  contact: {
    en: {
      title: "Contact Us",
      description:
        "Contact Kirii Construction Materials in Foshan, China for ceiling systems quotes, technical consultation, and project support. Email info@kirii.cn.",
    },
    "zh-HK": {
      title: "聯絡我們",
      description:
        "聯絡佛山三水桐井建材，獲取天花系統報價、技術諮詢及項目支持。電郵 info@kirii.cn。",
    },
    "zh-CN": {
      title: "联系我们",
      description:
        "联系佛山三水桐井建材，获取天花系统报价、技术咨询及项目支持。电邮 info@kirii.cn。",
    },
  },
  blog: {
    en: {
      title: "Blog",
      description:
        "Industry insights and technical articles on ceiling systems, building materials, and construction solutions from Kirii Construction Materials.",
    },
    "zh-HK": {
      title: "資訊文章",
      description:
        "三水桐井建材分享天花系統、建築材料及工程應用的技術文章與行業資訊。",
    },
    "zh-CN": {
      title: "资讯文章",
      description:
        "三水桐井建材分享天花系统、建筑材料及工程应用的技术文章与行业资讯。",
    },
  },
  privacy: {
    en: {
      title: "Privacy Policy",
      description:
        "Privacy policy for Kirii Construction Materials (kirii.cn) explaining how we collect, use, and protect your personal information.",
    },
    "zh-HK": {
      title: "私隱政策",
      description:
        "三水桐井建材（kirii.cn）私隱政策，說明我們如何收集、使用及保護您的個人資料。",
    },
    "zh-CN": {
      title: "隐私政策",
      description:
        "三水桐井建材（kirii.cn）隐私政策，说明我们如何收集、使用及保护您的个人信息。",
    },
  },
  terms: {
    en: {
      title: "Terms of Service",
      description:
        "Terms of service for using the Kirii Construction Materials website and enquiry services at kirii.cn.",
    },
    "zh-HK": {
      title: "服務條款",
      description:
        "使用三水桐井建材網站（kirii.cn）及查詢服務的條款與細則。",
    },
    "zh-CN": {
      title: "服务条款",
      description:
        "使用三水桐井建材网站（kirii.cn）及查询服务的条款与细则。",
    },
  },
  cookies: {
    en: {
      title: "Cookie Policy",
      description:
        "Cookie policy for kirii.cn explaining how cookies and analytics tools are used on our website.",
    },
    "zh-HK": {
      title: "Cookie 政策",
      description:
        "kirii.cn Cookie 政策，說明本網站如何使用 Cookie 及分析工具。",
    },
    "zh-CN": {
      title: "Cookie 政策",
      description:
        "kirii.cn Cookie 政策，说明本网站如何使用 Cookie 及分析工具。",
    },
  },
}

export const navLabels: Record<
  Language,
  { blog: string; privacy: string; terms: string; cookies: string; legal: string }
> = {
  en: {
    blog: "Blog",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    cookies: "Cookie Policy",
    legal: "Legal",
  },
  "zh-HK": {
    blog: "資訊文章",
    privacy: "私隱政策",
    terms: "服務條款",
    cookies: "Cookie 政策",
    legal: "法律資訊",
  },
  "zh-CN": {
    blog: "资讯文章",
    privacy: "隐私政策",
    terms: "服务条款",
    cookies: "Cookie 政策",
    legal: "法律信息",
  },
}

export function getPageSeo(locale: Locale, page: SeoPageKey) {
  const language = localeToLanguage(locale)
  return pageSeo[page][language]
}

export function buildPageMetadata(
  localeParam: string,
  page: SeoPageKey,
  path: string,
  ogImage?: string,
): Metadata {
  if (!isValidLocale(localeParam)) {
    return {}
  }

  const locale = localeParam as Locale
  const { title, description } = getPageSeo(locale, page)

  return createPageMetadata({
    locale,
    title,
    description,
    path,
    ogImage,
  })
}
