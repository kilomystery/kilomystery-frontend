/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverActions: { bodySizeLimit: "2mb" } },
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // ✅ CSP per consentire GA + TikTok + Shopify checkout
          // Se hai già CSP altrove (Vercel/proxy), questa potrebbe non essere quella effettiva.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Script: Next + GA + TikTok + (eventuali script Shopify)
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://analytics.tiktok.com https://www.google-analytics.com https://ssl.google-analytics.com https://www.googletagmanager.com https://cdn.shopify.com",
              // Connessioni XHR/fetch per tracking
              "connect-src 'self' https://www.google-analytics.com https://stats.g.doubleclick.net https://analytics.tiktok.com https://business-api.tiktok.com https://cdn.shopify.com",
              // Immagini
              "img-src 'self' data: blob: https:",
              // Stili (Next + CSS inline)
              "style-src 'self' 'unsafe-inline' https:",
              // Font
              "font-src 'self' data: https:",
              // Frame (Shopify checkout / payment)
              "frame-src 'self' https://*.myshopify.com https://checkout.shopify.com https://pay.shopify.com https://shop.kilomystery.com",
              // Worker
              "worker-src 'self' blob:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
