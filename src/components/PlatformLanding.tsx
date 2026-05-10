import Link from "next/link";
import { Dropzone } from "@/components/Dropzone";
import { TopBar } from "@/components/TopBar";
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
    <>
      <TopBar
        lang={lang}
        dict={dict}
        rightSlot={
          <Link
            href={`/${lang}`}
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            {dict.nav.back}
          </Link>
        }
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 sm:py-10">
        <header className="mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {copy.h1}
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl">{copy.intro}</p>
        </header>

        <Dropzone dict={dict} />

        <section className="mt-12">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
            {copy.fieldsTitle}
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
            {copy.fields.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
            {copy.faqTitle}
          </h2>
          <div className="space-y-4">
            {copy.faq.map((item) => (
              <div key={item.q}>
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.q}</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {otherLandings.length > 0 && (
          <nav className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {otherLandings.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/${lang}/${p.slug}`}
                    className="text-blue-600 hover:underline"
                  >
                    {dict.landing[p.slug].h1}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </main>
    </>
  );
}
