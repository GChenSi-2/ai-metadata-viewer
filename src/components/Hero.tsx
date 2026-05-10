import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

const PLATFORM_DOTS: Array<{
  key: keyof Dictionary["hero"]["platforms"];
  href: (lang: string) => string | null;
  /** tailwind classes for the colored dot */
  dot: string;
}> = [
  { key: "automatic1111", href: (l) => `/${l}/automatic1111-metadata-viewer`, dot: "bg-orange-500" },
  { key: "comfyui",       href: (l) => `/${l}/comfyui-workflow-extractor`,    dot: "bg-emerald-500" },
  { key: "novelai",       href: (l) => `/${l}/novelai-prompt-extractor`,      dot: "bg-pink-500" },
  { key: "midjourney",    href: () => null,                                    dot: "bg-violet-500" },
];

const PREVIEW_ICONS: React.ReactNode[] = [
  // Prompt — quote
  <svg key="0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 9.5h-2a1 1 0 0 0-1 1V14a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-1.5m0-3v6m11-3h-2a1 1 0 0 0-1 1V14a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-1.5m0-3v6" />
  </svg>,
  // Parameters — sliders
  <svg key="1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
    <path strokeLinecap="round" d="M4 7h7m4 0h5M4 12h3m4 0h9M4 17h11m4 0h1" />
    <circle cx="13" cy="7" r="2" /><circle cx="9" cy="12" r="2" /><circle cx="17" cy="17" r="2" />
  </svg>,
  // Workflow — connected nodes
  <svg key="2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
    <rect x="3" y="4" width="6" height="6" rx="1.2" /><rect x="15" y="4" width="6" height="6" rx="1.2" /><rect x="9" y="14" width="6" height="6" rx="1.2" />
    <path d="M9 7h6M6 10v3a1 1 0 0 0 1 1h2m9-4v3a1 1 0 0 1-1 1h-2" />
  </svg>,
];

export function Hero({ dict, lang }: { dict: Dictionary; lang: Locale }) {
  const headlinePost = (dict.hero as { headlinePost?: string }).headlinePost;
  return (
    <section className="pt-2 pb-6 sm:pt-6 sm:pb-10">
      <h1 className="text-2xl sm:text-[34px] font-semibold tracking-tight leading-[1.15] text-zinc-900 dark:text-zinc-50">
        {dict.hero.headlinePre}{" "}
        <span className="gradient-text">{dict.hero.headlineAccent}</span>
        {headlinePost ? <> {headlinePost}</> : null}
      </h1>
      <p className="mt-3 text-sm sm:text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-2xl">
        {dict.hero.tagline}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-2 text-xs">
        <span className="text-zinc-500">{dict.hero.supports}</span>
        {PLATFORM_DOTS.map((p) => {
          const label = dict.hero.platforms[p.key];
          const href = p.href(lang);
          const inner = (
            <>
              <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} aria-hidden />
              <span>{label}</span>
            </>
          );
          const cls =
            "inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/50 backdrop-blur px-2.5 py-1 text-zinc-700 dark:text-zinc-300";
          return href ? (
            <Link key={p.key} href={href} className={`${cls} hover:border-zinc-300 dark:hover:border-zinc-700 transition`}>
              {inner}
            </Link>
          ) : (
            <span key={p.key} className={cls}>{inner}</span>
          );
        })}
      </div>
    </section>
  );
}

export function HeroPreviewCards({ dict }: { dict: Dictionary }) {
  return (
    <section className="mt-8">
      <h2 className="text-[11px] uppercase tracking-wider text-zinc-500 mb-3">
        {dict.hero.previewTitle}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {dict.hero.preview.map((p, i) => (
          <div
            key={p.title}
            className="rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 backdrop-blur p-3"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-fuchsia-500/10 text-zinc-700 dark:text-zinc-300">
                {PREVIEW_ICONS[i]}
              </span>
              <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{p.title}</h3>
            </div>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
