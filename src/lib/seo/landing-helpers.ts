import type { Metadata } from "next";
import { isLocale, LOCALES, LOCALE_HTML_LANG } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { SITE_URL, type PlatformLandingSlug } from "./site";

export async function buildLandingMetadata(
  slug: PlatformLandingSlug,
  langInput: string,
): Promise<Metadata> {
  if (!isLocale(langInput)) return {};
  const dict = await getDictionary(langInput);
  const copy = dict.landing[slug];
  const languages: Record<string, string> = { "x-default": `/en/${slug}` };
  for (const l of LOCALES) languages[LOCALE_HTML_LANG[l]] = `/${l}/${slug}`;
  return {
    title: `${copy.h1} — ${dict.site.title}`,
    description: copy.intro,
    alternates: { languages, canonical: `/${langInput}/${slug}` },
    openGraph: {
      title: copy.h1,
      description: copy.intro,
      url: `${SITE_URL}/${langInput}/${slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: copy.h1,
      description: copy.intro,
    },
  };
}
