"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  clearHistory,
  deleteHistoryEntry,
  readHistory,
  subscribeHistory,
} from "@/lib/history";
import type { HistoryEntry } from "@/lib/types";
import type { Dictionary } from "@/i18n/dictionaries";
import { useToast } from "./Toast";
import { MetadataDisplay } from "./MetadataDisplay";

const PLATFORM_BADGE: Record<string, string> = {
  automatic1111: "A1111",
  comfyui: "ComfyUI",
  novelai: "NovelAI",
  midjourney: "MJ",
  invokeai: "InvokeAI",
  fooocus: "Fooocus",
  unknown: "?",
};

function formatTime(ts: number, locale: string): string {
  return new Date(ts).toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HistoryList({ dict, lang }: { dict: Dictionary; lang: string }) {
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    setEntries(readHistory());
    const unsub = subscribeHistory(() => setEntries(readHistory()));
    return unsub;
  }, []);

  if (entries === null) {
    return <p className="text-sm text-zinc-500">{dict.history.loading}</p>;
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{dict.history.empty}</p>
        <Link
          href={`/${lang}`}
          className="mt-2 inline-block text-sm text-blue-600 hover:underline"
        >
          {dict.history.emptyCta}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500">
          {entries.length} · max 20
        </p>
        <button
          onClick={() => {
            if (confirm(dict.history.confirmClear)) clearHistory();
          }}
          className="text-xs text-zinc-500 hover:text-rose-600"
        >
          {dict.history.clearAll}
        </button>
      </div>

      <ul className="rounded-md border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white dark:bg-zinc-950">
        {entries.map((e) => {
          const m = e.metadata;
          const isOpen = openId === e.id;
          return (
            <li key={e.id}>
              <div className="group flex items-center gap-3 px-3 py-2 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40">
                <span className="shrink-0 inline-flex items-center rounded border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-700 dark:text-zinc-300 font-mono">
                  {PLATFORM_BADGE[m.platform] ?? m.platform}
                </span>
                <button
                  onClick={() => setOpenId(isOpen ? null : e.id)}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="text-sm truncate text-zinc-800 dark:text-zinc-200">
                    {m.parsed.prompt?.slice(0, 120) || m.fileInfo.filename || dict.history.noPrompt}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5 truncate">
                    {m.fileInfo.filename} · {m.fileInfo.dimensions.width}×
                    {m.fileInfo.dimensions.height} · {formatTime(m.extractedAt, lang)}
                  </div>
                </button>
                <button
                  onClick={() => deleteHistoryEntry(e.id)}
                  className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 text-xs text-zinc-500 hover:text-rose-600 px-2 py-1 transition"
                  aria-label={dict.history.delete}
                >
                  {dict.history.delete}
                </button>
              </div>
              {isOpen && (
                <div className="border-t border-zinc-100 dark:border-zinc-800/60 p-3 bg-zinc-50/40 dark:bg-zinc-900/30">
                  <MetadataDisplay
                    metadata={m}
                    dict={dict}
                    onCopied={(text) => toast.show(text, "success")}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
