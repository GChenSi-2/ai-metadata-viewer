import Link from "next/link";
import { Dropzone } from "@/components/Dropzone";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { PLATFORM_LANDINGS, SITE_URL, SITE_NAME, type PlatformLandingSlug } from "@/lib/seo/site";

interface Props {
  slug: PlatformLandingSlug;
  lang: Locale;
  dict: Dictionary;
}

export function PlatformLanding({ slug, lang, dict }: Props) {
  const copy = dict.landing[slug];
  const url = `${SITE_URL}/${lang}/${slug}`;

  const ld = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: copy.h1,
    url,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any (browser)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: copy.intro,
    publisher: { "@type": "Organization", name: SITE_NAME },
  };

  const otherLandings = PLATFORM_LANDINGS.filter((p) => p.slug !== slug);

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black px-4 py-12 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <div className="max-w-4xl mx-auto">
        <nav className="flex items-center justify-between mb-6">
          <LocaleSwitcher current={lang} />
          <Link
            href={`/${lang}`}
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            {dict.nav.back}
          </Link>
        </nav>

        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            {copy.h1}
          </h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400 max-w-3xl">{copy.intro}</p>
        </header>

        <Dropzone dict={dict} />

        <section className="mt-16">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            {copy.fieldsTitle}
          </h2>
          <ul className="list-disc pl-6 space-y-1 text-zinc-700 dark:text-zinc-300">
            {copy.fields.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            {copy.faqTitle}
          </h2>
          <div className="space-y-5">
            {copy.faq.map((item) => (
              <div key={item.q}>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100">{item.q}</h3>
                <p className="mt-1 text-zinc-600 dark:text-zinc-400">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {otherLandings.length > 0 && (
          <nav className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-xs uppercase tracking-wide text-zinc-500 mb-3">
              {dict.metadata.platform}
            </p>
            <ul className="flex flex-wrap gap-3">
              {otherLandings.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/${lang}/${p.slug}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {dict.landing[p.slug].h1}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <footer className="mt-16 text-center text-xs text-zinc-500">
          <p>{dict.site.footer}</p>
        </footer>
      </div>
    </main>
  );
}
