"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, isLocale, type Locale } from "@/i18n/config";

const SHORT_LABEL: Record<Locale, string> = {
  en: "EN",
  zh: "中",
  ja: "日",
};

export function LocaleSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname() ?? `/${current}`;
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && isLocale(segments[0])) segments.shift();
  const rest = segments.length ? `/${segments.join("/")}` : "";

  return (
    <div className="inline-flex items-center text-xs">
      {LOCALES.map((loc, i) => (
        <span key={loc} className="flex items-center">
          {i > 0 && <span className="px-1 text-zinc-300 dark:text-zinc-700">·</span>}
          {loc === current ? (
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {SHORT_LABEL[loc]}
            </span>
          ) : (
            <Link
              href={`/${loc}${rest}`}
              hrefLang={loc}
              className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              {SHORT_LABEL[loc]}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
}
