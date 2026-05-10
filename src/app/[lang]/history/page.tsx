import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HistoryList } from "@/components/HistoryList";
import { TopBar } from "@/components/TopBar";
import { isLocale, LOCALES, LOCALE_HTML_LANG } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata(
  { params }: { params: Promise<{ lang: string }> },
): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const languages: Record<string, string> = { "x-default": "/en/history" };
  for (const l of LOCALES) languages[LOCALE_HTML_LANG[l]] = `/${l}/history`;
  return {
    title: `${dict.history.title} — ${dict.site.title}`,
    description: dict.history.subtitle,
    alternates: { languages, canonical: `/${lang}/history` },
  };
}

export default async function HistoryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

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
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 sm:py-8">
        <div className="mb-4">
          <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {dict.history.title}
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">{dict.history.subtitle}</p>
        </div>
        <HistoryList dict={dict} lang={lang} />
      </main>
    </>
  );
}
