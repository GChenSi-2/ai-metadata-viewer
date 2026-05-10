import { notFound } from "next/navigation";
import { PlatformLanding } from "@/components/PlatformLanding";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { buildLandingMetadata } from "@/lib/seo/landing-helpers";

const SLUG = "novelai-prompt-extractor" as const;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return buildLandingMetadata(SLUG, lang);
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return <PlatformLanding slug={SLUG} lang={lang} dict={dict} />;
}
