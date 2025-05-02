import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t py-12 bg-gray-50">
      <div className="w-full flex justify-center items-center pt-6 pb-8">
        <div className="flex items-center gap-8">
          <img src="/images/uploaded/gyproc.png" alt="Gyproc" className="h-16 w-auto" />
          <img src="/images/uploaded/saint-gobain.png" alt="Saint-Gobain" className="h-16 w-auto" />
          <img src="/images/uploaded/taishan.jpg" alt="Taishan" className="h-16 w-auto" />
        </div>
      </div>
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <img src="/images/kirii-new-logo.png" alt="KIRII" className="h-10 w-auto" />
            </Link>
            <p className="text-sm text-gray-500">為香港建築行業提供高品質建築材料的網上商店。</p>
            <div className="mt-6">
              <div className="text-xs text-gray-600 mb-2">我們公司品牌及代理品牌</div>
              <div className="flex items-center gap-4">
                <img src="/images/uploaded/gyproc.png" alt="Gyproc" className="h-8 w-auto" />
                <img src="/images/uploaded/saint-gobain.png" alt="Saint-Gobain" className="h-8 w-auto" />
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-4">產品</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products/aluminum-composite-panel" className="text-sm text-gray-500 hover:text-primary">
                  鋁複合板
                </Link>
              </li>
              <li>
                <Link href="/products/steel-materials" className="text-sm text-gray-500 hover:text-primary">
                  鐵建築鋼材
                </Link>
              </li>
              <li>
                <Link href="/products/gypsum-board" className="text-sm text-gray-500 hover:text-primary">
                  石膏板
                </Link>
              </li>
              <li>
                <Link href="/products/fire-resistant-board" className="text-sm text-gray-500 hover:text-primary">
                  防火石膏板
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-4">公司資訊</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-gray-500 hover:text-primary">
                  關於我們
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-500 hover:text-primary">
                  聯絡我們
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-500 hover:text-primary">
                  使用條款
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-500 hover:text-primary">
                  私隱政策
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-4">聯絡方式</h3>
            <ul className="space-y-2">
              <li className="text-sm text-gray-500">地址: 香港大埔大埔工業村大富街9號</li>
              <li className="text-sm text-gray-500">電話: +852 2797 2026</li>
              <li className="text-sm text-gray-500">電郵: info@kirii-net.com</li>
            </ul>
          </div>
        </div>
        <div className="border-t pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 mb-4 md:mb-0">
              Copyright © Kirii (Hong Kong) Limited. All Rights Reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/terms" className="text-sm text-gray-500 hover:text-primary">
                使用條款
              </Link>
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-primary">
                私隱政策
              </Link>
              <Link href="/contact" className="text-sm text-gray-500 hover:text-primary">
                聯絡我們
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
