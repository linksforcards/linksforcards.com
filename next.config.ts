import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  images: { formats: ["image/avif", "image/webp"] },
  serverExternalPackages: ["@electric-sql/pglite"],
  outputFileTracingExcludes: {
    "*": ["node_modules/@electric-sql/**"],
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Card pages are generated on demand. A middleware rewrite would skip
        // that cache, so the public US path is mapped here instead.
        { source: "/cards/:slug", destination: "/us/cards/:slug" },
        { source: "/illustrators/:slug", destination: "/us/illustrators/:slug" },
      ],
      afterFiles: [
        { source: "/sitemap.xml", destination: "/sitemap-index" },
        { source: "/sitemap/:id.xml", destination: "/sitemap/:id" },
      ],
    };
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/icon.svg",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
    ];
  },
};

export default nextConfig;
