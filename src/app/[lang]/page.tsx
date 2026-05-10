import Link from "next/link";
import { notFound } from "next/navigation";
import { Dropzone } from "@/components/Dropzone";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black px-4 py-12 sm:py-20">
      <div className="max-w-4xl mx-auto">
        <nav className="flex items-center justify-between mb-6">
          <LocaleSwitcher current={lang} />
          <Link
            href={`/${lang}/history`}
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            {dict.nav.history} →
          </Link>
        </nav>
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-50">{dict.site.title}</h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">{dict.site.tagline}</p>
        </header>

        <Dropzone dict={dict} />

        <footer className="mt-16 text-center text-xs text-zinc-500">
          <p>{dict.site.footer}</p>
        </footer>
      </div>
    </main>
  );
}
