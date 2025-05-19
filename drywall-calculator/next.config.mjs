/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Vercelにデプロイされた場合のAPI処理の制限を緩和
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'mammoth'],
  },
  // APIルートの処理時間を延長（デフォルトでは10秒程度）
  api: {
    responseLimit: false,
    // Vercel環境でのタイムアウト制限対策（開発環境では効果なし）
    externalResolver: true,
  }
}

export default nextConfig
