import { notFound } from "next/navigation";
import { Dropzone } from "@/components/Dropzone";
import { Hero, HeroPreviewCards } from "@/components/Hero";
import { TopBar } from "@/components/TopBar";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <div className="bg-mesh flex flex-col flex-1">
      <TopBar lang={lang} dict={dict} />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 pb-16">
        <Dropzone
          dict={dict}
          emptyHero={<Hero dict={dict} lang={lang} />}
          emptyExtras={<HeroPreviewCards dict={dict} />}
        />
      </main>
    </div>
  );
}
