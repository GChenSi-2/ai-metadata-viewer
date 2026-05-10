import type { MetadataRoute } from "next";
import { LOCALES, LOCALE_HTML_LANG } from "@/i18n/config";
import { PLATFORM_LANDINGS, SITE_URL } from "@/lib/seo/site";

type Sitemap = MetadataRoute.Sitemap;

export default function sitemap(): Sitemap {
  const now = new Date();
  const out: Sitemap = [];

  const paths = ["", "/history", ...PLATFORM_LANDINGS.map((p) => `/${p.slug}`)];

  for (const path of paths) {
    for (const lang of LOCALES) {
      const languages: Record<string, string> = {};
      for (const l of LOCALES) languages[LOCALE_HTML_LANG[l]] = `${SITE_URL}/${l}${path}`;
      out.push({
        url: `${SITE_URL}/${lang}${path}`,
        lastModified: now,
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : path.startsWith("/history") ? 0.3 : 0.8,
        alternates: { languages },
      });
    }
  }

  return out;
}
