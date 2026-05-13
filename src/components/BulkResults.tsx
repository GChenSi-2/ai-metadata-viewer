"use client";

import { useMemo, useState } from "react";
import type { ExtractedMetadata } from "@/lib/types";
import type { Dictionary } from "@/i18n/dictionaries";
import { track } from "@/lib/analytics";
import { downloadCsv, metadataToCsv } from "@/lib/csv-export";
import { MetadataDisplay } from "./MetadataDisplay";

interface FailedItem {
  name: string;
  message: string;
}

interface Props {
  results: ExtractedMetadata[];
  failed: FailedItem[];
  dict: Dictionary;
  onReset: () => void;
  onCopied: (text: string) => void;
}

const PLATFORM_BADGE: Record<string, string> = {
  automatic1111: "A1111",
  comfyui: "ComfyUI",
  novelai: "NovelAI",
  midjourney: "MJ",
  invokeai: "InvokeAI",
  fooocus: "Fooocus",
  unknown: "?",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function BulkResults({ results, failed, dict, onReset, onCopied }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const b = dict.bulk;

  const withMetadata = useMemo(
    () => results.filter((r) => r.platform !== "unknown" || r.rawText),
    [results],
  );
  const promptCount = useMemo(
    () => results.filter((r) => Boolean(r.parsed.prompt)).length,
    [results],
  );

  const copyAllPrompts = async () => {
    const text = results
      .map((r) => r.parsed.prompt)
      .filter((p): p is string => Boolean(p))
      .join("\n\n");
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      onCopied(dict.metadata.actions.copied);
      track("bulk_copy_all_prompts", { count: promptCount });
    } catch {
      /* ignore */
    }
  };

  const exportCsv = () => {
    const csv = metadataToCsv(results);
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    downloadCsv(csv, `ai-metadata-${stamp}.csv`);
    track("bulk_export_csv", { count: results.length });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {b.summary
            .replace("{total}", String(results.length))
            .replace("{withMetadata}", String(withMetadata.length))
            .replace("{failed}", String(failed.length))}
        </p>
        <div className="flex items-center gap-2">
          {promptCount > 0 && (
            <button
              onClick={copyAllPrompts}
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              {b.copyAllPrompts}
            </button>
          )}
          {results.length > 0 && (
            <button
              onClick={exportCsv}
              className="rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition"
            >
              {b.exportCsv}
            </button>
          )}
          <button
            onClick={onReset}
            className="rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition"
          >
            {dict.metadata.actions.clear}
          </button>
        </div>
      </div>

      {/* Results list */}
      <ul className="rounded-md border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white dark:bg-zinc-950 overflow-hidden">
        {results.map((m, i) => {
          const isOpen = openIdx === i;
          return (
            <li key={`${m.fileInfo.filename}-${i}`}>
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition"
              >
                <span className="shrink-0 inline-flex items-center rounded border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-700 dark:text-zinc-300 font-mono mt-0.5">
                  {PLATFORM_BADGE[m.platform] ?? m.platform}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="text-sm font-medium truncate text-zinc-900 dark:text-zinc-100" title={m.fileInfo.filename}>
                      {m.fileInfo.filename}
                    </span>
                    <span className="text-[11px] text-zinc-400 whitespace-nowrap">
                      {m.fileInfo.dimensions.width}×{m.fileInfo.dimensions.height} · {formatBytes(m.fileInfo.size)}
                    </span>
                  </div>
                  {m.parsed.prompt ? (
                    <div className="mt-0.5 text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2 leading-snug">
                      {m.parsed.prompt}
                    </div>
                  ) : (
                    <div className="mt-0.5 text-xs italic text-zinc-400">
                      {dict.metadata.noMetadata}
                    </div>
                  )}
                  {(m.parsed.model || m.parsed.sampler || m.parsed.seed !== undefined) && (
                    <div className="mt-1 text-[11px] text-zinc-500 truncate font-mono">
                      {[
                        m.parsed.model,
                        m.parsed.sampler,
                        m.parsed.seed !== undefined ? `seed ${m.parsed.seed}` : null,
                        m.parsed.steps !== undefined ? `${m.parsed.steps} steps` : null,
                      ].filter(Boolean).join(" · ")}
                    </div>
                  )}
                </div>
                <span className="shrink-0 mt-1 text-zinc-400" aria-hidden>
                  {isOpen ? "▾" : "▸"}
                </span>
              </button>
              {isOpen && (
                <div className="border-t border-zinc-100 dark:border-zinc-800/60 p-3 bg-zinc-50/40 dark:bg-zinc-900/30">
                  <MetadataDisplay
                    metadata={m}
                    dict={dict}
                    compact
                    onCopied={onCopied}
                  />
                </div>
              )}
            </li>
          );
        })}

        {failed.map((f, i) => (
          <li
            key={`fail-${f.name}-${i}`}
            className="flex items-center gap-3 px-3 py-2 text-sm text-rose-700 dark:text-rose-300 bg-rose-50/40 dark:bg-rose-950/20"
          >
            <span className="shrink-0 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium text-rose-700 dark:text-rose-300 font-mono border border-rose-200 dark:border-rose-900">
              ✕
            </span>
            <span className="flex-1 min-w-0 truncate">{f.name}</span>
            <span className="text-xs text-rose-600/80 dark:text-rose-400/80 truncate">{f.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
