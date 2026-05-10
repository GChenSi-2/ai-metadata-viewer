import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { LocaleSwitcher } from "./LocaleSwitcher";

interface Props {
  lang: Locale;
  dict: Dictionary;
  /** Optional: pages can render their own subtitle/back link in the right slot */
  rightSlot?: React.ReactNode;
}

export function TopBar({ lang, dict, rightSlot }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/85 dark:bg-zinc-950/85 backdrop-blur supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:dark:bg-zinc-950/70">
      <div className="max-w-3xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
        <Link
          href={`/${lang}`}
          className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 hover:opacity-80"
        >
          {dict.site.short ?? dict.site.title}
        </Link>
        <div className="flex items-center gap-4">
          {rightSlot ?? (
            <Link
              href={`/${lang}/history`}
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              {dict.nav.history}
            </Link>
          )}
          <span className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
          <LocaleSwitcher current={lang} />
        </div>
      </div>
    </header>
  );
}
