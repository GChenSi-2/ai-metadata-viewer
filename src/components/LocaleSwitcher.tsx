"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, LOCALE_LABELS, isLocale, type Locale } from "@/i18n/config";

export function LocaleSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname() ?? `/${current}`;
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && isLocale(segments[0])) segments.shift();
  const rest = segments.length ? `/${segments.join("/")}` : "";

  return (
    <div className="flex items-center gap-2 text-sm">
      {LOCALES.map((loc, i) => (
        <span key={loc} className="flex items-center gap-2">
          {i > 0 && <span className="text-zinc-400">·</span>}
          {loc === current ? (
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{LOCALE_LABELS[loc]}</span>
          ) : (
            <Link
              href={`/${loc}${rest}`}
              hrefLang={loc}
              className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              {LOCALE_LABELS[loc]}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
}
