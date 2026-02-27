/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverActions: { bodySizeLimit: "2mb" } },
  reactStrictMode: true,

  async redirects() {
    return [
      // BIO links (puliti) -> URL con UTM
      {
        source: "/tiktok",
        destination: "/?utm_source=tiktok&utm_medium=social&utm_campaign=bio",
        permanent: false, // 302
      },
      {
        source: "/instagram",
        destination: "/?utm_source=instagram&utm_medium=social&utm_campaign=bio",
        permanent: false, // 302
      },

      // (opzionale) se usi /it/ come lingua
      {
        source: "/it/tiktok",
        destination: "/it?utm_source=tiktok&utm_medium=social&utm_campaign=bio",
        permanent: false,
      },
      {
        source: "/it/instagram",
        destination: "/it?utm_source=instagram&utm_medium=social&utm_campaign=bio",
        permanent: false,
      },

      // Influencer links
      {
        source: "/susy",
        destination:
          "/?utm_source=susy&utm_medium=influencer&utm_campaign=collab_marzo",
        permanent: false,
      },
      {
        source: "/ary",
        destination:
          "/?utm_source=ary&utm_medium=influencer&utm_campaign=collab_marzo",
        permanent: false,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "interest-cohort=()" },
        ],
      },
    ];
  },
};

export default nextConfig;