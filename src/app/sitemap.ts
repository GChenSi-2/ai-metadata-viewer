import type { MetadataRoute } from "next";
import { LOCALES } from "@/i18n/config";
import { PLATFORM_LANDINGS, SITE_URL } from "@/lib/seo/site";

// Minimal sitemap: <loc> + <lastmod> only.
// Google ignores <changefreq> and <priority>, and we already declare
// hreflang alternates in each page's <head>, so the sitemap doesn't need
// the xhtml:link decoration. See docs/sitemap.full-with-hreflang.ts.txt
// for the richer variant if you ever want it back.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths = ["", "/history", ...PLATFORM_LANDINGS.map((p) => `/${p.slug}`)];

  const out: MetadataRoute.Sitemap = [];
  for (const path of paths) {
    for (const lang of LOCALES) {
      out.push({
        url: `${SITE_URL}/${lang}${path}`,
        lastModified: now,
      });
    }
  }
  return out;
}
