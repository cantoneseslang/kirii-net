export default function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold mb-3">
          存取受限制 Access Restricted
        </h1>
        <div className="space-y-4 text-muted-foreground">
          <p>
            此頁面僅供 KIRII(HK) 員工使用，非員工恕不提供服務。
          </p>
          <p>
            This page is for KIRII(HK) employees only. Access is not available to non-employees.
          </p>
          <div className="pt-2">
            <a
              href="https://kirii-portfolio-1.vercel.app/"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              rel="noopener"
            >
              返回公司入口 · Back to company portal
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


