export const GUIDE_SLUGS = ["organize-binder", "bulk-cards", "donating-cards"] as const;

export type GuideSlug = (typeof GUIDE_SLUGS)[number];

export const GUIDE_UPDATED = "2026-10-24";

export function isGuideSlug(value: string): value is GuideSlug {
  return (GUIDE_SLUGS as readonly string[]).includes(value);
}
