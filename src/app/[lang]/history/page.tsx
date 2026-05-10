import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HistoryList } from "@/components/HistoryList";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
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
    <main className="min-h-screen bg-zinc-50 dark:bg-black px-4 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto">
        <nav className="flex items-center justify-between mb-6">
          <LocaleSwitcher current={lang} />
        </nav>
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {dict.history.title}
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{dict.history.subtitle}</p>
          </div>
          <Link
            href={`/${lang}`}
            className="text-sm text-blue-600 hover:underline shrink-0"
          >
            {dict.nav.back}
          </Link>
        </header>

        <HistoryList dict={dict} lang={lang} />
      </div>
    </main>
  );
}
