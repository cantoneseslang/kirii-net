import type { Language } from "@/lib/i18n"
import { getPageSeo } from "@/lib/page-seo"
import { localeToLanguage, type Locale } from "@/lib/locale"

export type LegalSection = {
  heading: string
  paragraphs: string[]
}

export type LegalDocument = {
  title: string
  lastUpdated: string
  intro: string
  sections: LegalSection[]
}

const privacyContent: Record<Language, LegalDocument> = {
  en: {
    title: "Privacy Policy",
    lastUpdated: "June 18, 2026",
    intro:
      "Kirii Construction Materials (三水桐井建材) respects your privacy. This policy explains how we handle information when you visit kirii.cn or contact us.",
    sections: [
      {
        heading: "Information We Collect",
        paragraphs: [
          "When you submit our contact form, we may collect your name, email address, phone number, company name, and message content.",
          "We automatically collect limited technical data such as browser type, pages visited, and approximate region through analytics tools (Google Analytics).",
        ],
      },
      {
        heading: "How We Use Information",
        paragraphs: [
          "We use enquiry information to respond to your requests, provide quotations, and deliver customer support.",
          "Analytics data helps us understand website usage and improve our content and services.",
        ],
      },
      {
        heading: "Data Sharing",
        paragraphs: [
          "We do not sell your personal information. Data may be processed by service providers (such as email delivery and hosting providers) solely to operate our website and respond to enquiries.",
        ],
      },
      {
        heading: "Data Retention & Security",
        paragraphs: [
          "We retain enquiry records only as long as necessary for business and legal purposes.",
          "We apply reasonable technical and organisational measures to protect your information.",
        ],
      },
      {
        heading: "Your Rights & Contact",
        paragraphs: [
          "You may request access, correction, or deletion of your personal data by contacting info@kirii.cn.",
          "We may update this policy from time to time. Continued use of the website constitutes acceptance of the updated policy.",
        ],
      },
    ],
  },
  "zh-HK": {
    title: "私隱政策",
    lastUpdated: "2026年6月18日",
    intro:
      "三水桐井建材重視您的私隱。本政策說明當您瀏覽 kirii.cn 或與我們聯絡時，我們如何處理相關資料。",
    sections: [
      {
        heading: "我們收集的資料",
        paragraphs: [
          "當您提交聯絡表格時，我們可能收集姓名、電郵、電話、公司名稱及留言內容。",
          "我們亦可能透過分析工具（Google Analytics）自動收集瀏覽器類型、瀏覽頁面及大致地區等技術資料。",
        ],
      },
      {
        heading: "資料用途",
        paragraphs: [
          "我們使用查詢資料以回覆您的要求、提供報價及客戶支援。",
          "分析資料有助我們了解網站使用情況並改善內容與服務。",
        ],
      },
      {
        heading: "資料分享",
        paragraphs: [
          "我們不會出售您的個人資料。資料可能由服務供應商（如電郵及托管服務）處理，僅用於網站運作及回覆查詢。",
        ],
      },
      {
        heading: "資料保存及安全",
        paragraphs: [
          "我們只会在業務及法律所需期間內保存查詢記錄。",
          "我們採取合理的技術及組織措施以保護您的資料。",
        ],
      },
      {
        heading: "您的權利及聯絡方式",
        paragraphs: [
          "您可電郵 info@kirii.cn 要求查閱、更正或刪除個人資料。",
          "我們可能不時更新本政策。繼續使用本網站即表示您接受更新後的政策。",
        ],
      },
    ],
  },
  "zh-CN": {
    title: "隐私政策",
    lastUpdated: "2026年6月18日",
    intro:
      "三水桐井建材重视您的隐私。本政策说明当您浏览 kirii.cn 或与我们联系时，我们如何处理相关信息。",
    sections: [
      {
        heading: "我们收集的信息",
        paragraphs: [
          "当您提交联系表单时，我们可能收集姓名、电邮、电话、公司名称及留言内容。",
          "我们也可能通过分析工具（Google Analytics）自动收集浏览器类型、浏览页面及大致地区等技术信息。",
        ],
      },
      {
        heading: "信息用途",
        paragraphs: [
          "我们使用查询信息以回复您的要求、提供报价及客户支持。",
          "分析信息有助于我们了解网站使用情况并改善内容与服务。",
        ],
      },
      {
        heading: "信息共享",
        paragraphs: [
          "我们不会出售您的个人信息。信息可能由服务供应商（如电邮及托管服务）处理，仅用于网站运作及回复查询。",
        ],
      },
      {
        heading: "信息保存及安全",
        paragraphs: [
          "我们仅在业务及法律所需期间内保存查询记录。",
          "我们采取合理的技术及组织措施以保护您的信息。",
        ],
      },
      {
        heading: "您的权利及联系方式",
        paragraphs: [
          "您可电邮 info@kirii.cn 要求查阅、更正或删除个人信息。",
          "我们可能不时更新本政策。继续使用本网站即表示您接受更新后的政策。",
        ],
      },
    ],
  },
}

const termsContent: Record<Language, LegalDocument> = {
  en: {
    title: "Terms of Service",
    lastUpdated: "June 18, 2026",
    intro:
      "These terms govern your use of the Kirii Construction Materials website at kirii.cn. By accessing this site, you agree to these terms.",
    sections: [
      {
        heading: "Use of Website",
        paragraphs: [
          "This website provides company information, product overviews, project references, and enquiry channels.",
          "You agree to use the website lawfully and not to attempt unauthorised access, disruption, or misuse of site content.",
        ],
      },
      {
        heading: "Product Information",
        paragraphs: [
          "Specifications, images, and descriptions are provided for general reference. Final product selection, engineering data, and compliance documentation are confirmed in project-specific quotations and contracts.",
        ],
      },
      {
        heading: "Intellectual Property",
        paragraphs: [
          "All website content, including text, images, logos, and layouts, is owned by Kirii Construction Materials or used with permission. Reproduction without written consent is prohibited.",
        ],
      },
      {
        heading: "Limitation of Liability",
        paragraphs: [
          "We strive to keep information accurate and up to date but do not guarantee completeness or uninterrupted availability.",
          "To the extent permitted by law, we are not liable for indirect or consequential losses arising from use of this website.",
        ],
      },
      {
        heading: "Governing Law & Contact",
        paragraphs: [
          "These terms are governed by the laws applicable in the People's Republic of China unless otherwise required by mandatory local law.",
          "Questions regarding these terms may be sent to info@kirii.cn.",
        ],
      },
    ],
  },
  "zh-HK": {
    title: "服務條款",
    lastUpdated: "2026年6月18日",
    intro:
      "以下條款適用於您使用三水桐井建材網站 kirii.cn。瀏覽本網站即表示您同意這些條款。",
    sections: [
      {
        heading: "網站使用",
        paragraphs: [
          "本網站提供公司資訊、產品概覽、工程參考及查詢渠道。",
          "您同意合法使用本網站，不得嘗試未經授權的存取、干擾或濫用網站內容。",
        ],
      },
      {
        heading: "產品資訊",
        paragraphs: [
          "規格、圖片及說明僅供一般參考。最終產品選型、工程資料及合規文件以項目報價及合約為準。",
        ],
      },
      {
        heading: "知識產權",
        paragraphs: [
          "本網站所有內容（包括文字、圖片、標誌及版面）均屬三水桐井建材或已獲授權使用。未經書面同意不得複製。",
        ],
      },
      {
        heading: "責任限制",
        paragraphs: [
          "我們致力保持資訊準確及更新，但不保證內容完整或服務不間斷。",
          "在法律允許範圍內，我們不對因使用本網站而產生的間接或相應損失負責。",
        ],
      },
      {
        heading: "適用法律及聯絡",
        paragraphs: [
          "除非强制性本地法律另有要求，本條款受中華人民共和國法律管轄。",
          "有關本條款的查詢請電郵 info@kirii.cn。",
        ],
      },
    ],
  },
  "zh-CN": {
    title: "服务条款",
    lastUpdated: "2026年6月18日",
    intro:
      "以下条款适用于您使用三水桐井建材网站 kirii.cn。浏览本网站即表示您同意这些条款。",
    sections: [
      {
        heading: "网站使用",
        paragraphs: [
          "本网站提供公司信息、产品概览、工程参考及查询渠道。",
          "您同意合法使用本网站，不得尝试未经授权的访问、干扰或滥用网站内容。",
        ],
      },
      {
        heading: "产品信息",
        paragraphs: [
          "规格、图片及说明仅供一般参考。最终产品选型、工程资料及合规文件以项目报价及合约为准。",
        ],
      },
      {
        heading: "知识产权",
        paragraphs: [
          "本网站所有内容（包括文字、图片、标志及版面）均属三水桐井建材或已获授权使用。未经书面同意不得复制。",
        ],
      },
      {
        heading: "责任限制",
        paragraphs: [
          "我们致力保持信息准确及更新，但不保证内容完整或服务不间断。",
          "在法律允许范围内，我们不对因使用本网站而产生的间接或相应损失负责。",
        ],
      },
      {
        heading: "适用法律及联系",
        paragraphs: [
          "除非强制性本地法律另有要求，本条款受中华人民共和国法律管辖。",
          "有关本条款的查询请电邮 info@kirii.cn。",
        ],
      },
    ],
  },
}

const cookiesContent: Record<Language, LegalDocument> = {
  en: {
    title: "Cookie Policy",
    lastUpdated: "June 18, 2026",
    intro:
      "This policy explains how kirii.cn uses cookies and similar technologies to operate and analyse the website.",
    sections: [
      {
        heading: "What Are Cookies",
        paragraphs: [
          "Cookies are small text files stored on your device when you visit a website. They help remember preferences and understand how visitors use the site.",
        ],
      },
      {
        heading: "Cookies We Use",
        paragraphs: [
          "Essential cookies: required for basic site functionality such as language preference.",
          "Analytics cookies: we use Google Analytics (G-LKW86VJECG) to collect aggregated usage statistics.",
        ],
      },
      {
        heading: "Managing Cookies",
        paragraphs: [
          "You can control or delete cookies through your browser settings. Disabling cookies may affect certain site features.",
          "For Google Analytics opt-out options, refer to Google's documentation.",
        ],
      },
      {
        heading: "Updates",
        paragraphs: [
          "We may update this Cookie Policy periodically. Please review this page for the latest information.",
        ],
      },
    ],
  },
  "zh-HK": {
    title: "Cookie 政策",
    lastUpdated: "2026年6月18日",
    intro:
      "本政策說明 kirii.cn 如何使用 Cookie 及類似技術以運作及分析網站。",
    sections: [
      {
        heading: "什麼是 Cookie",
        paragraphs: [
          "Cookie 是您瀏覽網站時儲存在裝置上的小型文字檔案，有助記住偏好及了解訪客如何使用網站。",
        ],
      },
      {
        heading: "我們使用的 Cookie",
        paragraphs: [
          "必要 Cookie：用於語言偏好等基本功能。",
          "分析 Cookie：我們使用 Google Analytics（G-LKW86VJECG）收集汇总的使用统计。",
        ],
      },
      {
        heading: "管理 Cookie",
        paragraphs: [
          "您可透過瀏覽器設定控制或刪除 Cookie。停用 Cookie 可能影響部分功能。",
          "如需停用 Google Analytics，请参阅 Google 的相关说明。",
        ],
      },
      {
        heading: "更新",
        paragraphs: [
          "我們可能不时更新本 Cookie 政策，请查阅本页了解最新信息。",
        ],
      },
    ],
  },
  "zh-CN": {
    title: "Cookie 政策",
    lastUpdated: "2026年6月18日",
    intro:
      "本政策说明 kirii.cn 如何使用 Cookie 及类似技术以运作及分析网站。",
    sections: [
      {
        heading: "什么是 Cookie",
        paragraphs: [
          "Cookie 是您浏览网站时存储在设备上的小型文本文件，有助于记住偏好及了解访客如何使用网站。",
        ],
      },
      {
        heading: "我们使用的 Cookie",
        paragraphs: [
          "必要 Cookie：用于语言偏好等基本功能。",
          "分析 Cookie：我们使用 Google Analytics（G-LKW86VJECG）收集汇总的使用统计。",
        ],
      },
      {
        heading: "管理 Cookie",
        paragraphs: [
          "您可通过浏览器设置控制或删除 Cookie。停用 Cookie 可能影响部分功能。",
          "如需停用 Google Analytics，请参阅 Google 的相关说明。",
        ],
      },
      {
        heading: "更新",
        paragraphs: [
          "我们可能不时更新本 Cookie 政策，请查阅本页了解最新信息。",
        ],
      },
    ],
  },
}

export type LegalPageKey = "privacy" | "terms" | "cookies"

const legalDocuments: Record<LegalPageKey, Record<Language, LegalDocument>> = {
  privacy: privacyContent,
  terms: termsContent,
  cookies: cookiesContent,
}

export function getLegalDocument(page: LegalPageKey, language: Language): LegalDocument {
  return legalDocuments[page][language]
}

export function getLegalDocumentForLocale(page: LegalPageKey, locale: Locale): LegalDocument {
  return getLegalDocument(page, localeToLanguage(locale))
}

export function getLegalLastUpdatedLabel(language: Language): string {
  const labels: Record<Language, string> = {
    en: "Last updated",
    "zh-HK": "最後更新",
    "zh-CN": "最后更新",
  }
  return labels[language]
}

export function getLegalMeta(locale: Locale, page: LegalPageKey) {
  return getPageSeo(locale, page)
}
