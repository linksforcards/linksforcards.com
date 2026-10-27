import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/checklists/set/*/pdf/",
          "/checklists/theme/*/pdf/",
          "/checklists/generation/*/pdf/",
          "/*/checklists/set/*/pdf/",
          "/*/checklists/theme/*/pdf/",
          "/*/checklists/generation/*/pdf/",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
