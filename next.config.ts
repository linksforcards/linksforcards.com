import type { NextConfig } from "next";
import { cdnConfigHeaders } from "./src/lib/cdn-cache";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  images: { formats: ["image/avif", "image/webp"] },
  serverExternalPackages: ["@electric-sql/pglite", "pdfkit"],
  outputFileTracingExcludes: {
    "*": ["node_modules/@electric-sql/**"],
  },
  outputFileTracingIncludes: {
    "/:locale/checklists/:kind/:id/pdf/:paper": ["./src/assets/fonts/**/*"],
    "/checklists/:kind/:id/pdf/:paper": ["./src/assets/fonts/**/*"],
  },
  async rewrites() {
    return {
      beforeFiles: [
        // US English has no public prefix. Map these detail URLs onto /us here
        // so the request path stays the CDN cache key.
        { source: "/cards/:slug", destination: "/us/cards/:slug" },
        { source: "/illustrators/:slug", destination: "/us/illustrators/:slug" },
        { source: "/checklists/:kind/:id/pdf/:paper", destination: "/us/checklists/:kind/:id/pdf/:paper" },
        { source: "/checklists/:kind/:id", destination: "/us/checklists/:kind/:id" },
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
      ...cdnConfigHeaders(),
    ];
  },
};

export default nextConfig;
