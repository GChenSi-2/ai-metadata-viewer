import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { LOCALES, LOCALE_HTML_LANG, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { SITE_URL } from "@/lib/seo/site";
import { ToastProvider } from "@/components/Toast";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ lang: string }> },
): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const languages: Record<string, string> = { "x-default": "/en" };
  for (const l of LOCALES) languages[LOCALE_HTML_LANG[l]] = `/${l}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: dict.site.title,
    description: dict.site.tagline,
    alternates: { languages, canonical: `/${lang}` },
    openGraph: {
      title: dict.site.title,
      description: dict.site.tagline,
      url: `${SITE_URL}/${lang}`,
      siteName: dict.site.title,
      type: "website",
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <html lang={LOCALE_HTML_LANG[lang]} className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <ToastProvider>{children}</ToastProvider>
        <AnalyticsProvider />
        <VercelAnalytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
