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
  return new Date(ts).toLocaleString(locale);
}

export function HistoryList({ dict, lang }: { dict: Dictionary; lang: string }) {
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    setEntries(readHistory());
    const unsub = subscribeHistory(() => setEntries(readHistory()));
    return unsub;
  }, []);

  if (entries === null) {
    return <p className="text-center text-sm text-zinc-500">{dict.history.loading}</p>;
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center">
        <p className="text-zinc-600 dark:text-zinc-400">{dict.history.empty}</p>
        <Link href={`/${lang}`} className="mt-3 inline-block text-blue-600 hover:underline">
          {dict.history.emptyCta}
        </Link>
      </div>
    );
  }

  const countTpl = entries.length === 1 ? dict.history.countOne : dict.history.count;
  const countText = countTpl.replace("{count}", String(entries.length));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{countText}</p>
        <button
          onClick={() => {
            if (confirm(dict.history.confirmClear)) clearHistory();
          }}
          className="text-sm text-red-600 hover:underline"
        >
          {dict.history.clearAll}
        </button>
      </div>

      <ul className="space-y-2">
        {entries.map((e) => {
          const m = e.metadata;
          const isOpen = openId === e.id;
          return (
            <li
              key={e.id}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
            >
              <div className="flex items-center gap-3 p-3">
                <span className="text-xs font-mono px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 shrink-0">
                  {PLATFORM_BADGE[m.platform] ?? m.platform}
                </span>
                <button
                  onClick={() => setOpenId(isOpen ? null : e.id)}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="text-sm truncate">
                    {m.parsed.prompt?.slice(0, 100) || m.fileInfo.filename || dict.history.noPrompt}
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {m.fileInfo.filename} · {m.fileInfo.dimensions.width}×
                    {m.fileInfo.dimensions.height} · {formatTime(m.extractedAt, lang)}
                  </div>
                </button>
                <button
                  onClick={() => deleteHistoryEntry(e.id)}
                  className="text-xs text-zinc-500 hover:text-red-600 px-2 py-1"
                  aria-label={dict.history.delete}
                >
                  {dict.history.delete}
                </button>
              </div>
              {isOpen && (
                <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
                  <MetadataDisplay metadata={m} dict={dict} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
