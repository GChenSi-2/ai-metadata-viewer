"use client";

import { useState } from "react";
import type { ExtractedMetadata } from "@/lib/types";
import type { Dictionary } from "@/i18n/dictionaries";

interface Props {
  metadata: ExtractedMetadata;
  dict: Dictionary;
  onReset?: () => void;
  onCopied?: (text: string) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function CopyIconButton({
  value,
  ariaLabel,
  toastText,
  onCopied,
}: {
  value: string;
  ariaLabel: string;
  toastText: string;
  onCopied?: (text: string) => void;
}) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          onCopied?.(toastText);
          setTimeout(() => setDone(false), 1000);
        } catch {
          /* ignore */
        }
      }}
      aria-label={ariaLabel}
      className="inline-flex h-7 w-7 items-center justify-center rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
    >
      {done ? (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="5" y="5" width="9" height="9" rx="1.5" />
          <path d="M3 11V3.5A1.5 1.5 0 0 1 4.5 2H11" />
        </svg>
      )}
    </button>
  );
}

function PromptBlock({
  label,
  value,
  dict,
  onCopied,
  primary = false,
}: {
  label: string;
  value: string;
  dict: Dictionary;
  onCopied?: (text: string) => void;
  primary?: boolean;
}) {
  return (
    <section className="group rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 px-3 py-1.5">
        <span className="text-[11px] uppercase tracking-wider text-zinc-500">{label}</span>
        <CopyIconButton value={value} ariaLabel={dict.metadata.actions.copy} toastText={dict.metadata.actions.copied} onCopied={onCopied} />
      </div>
      <div
        className={`px-3 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
          primary ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-700 dark:text-zinc-300"
        }`}
      >
        {value}
      </div>
    </section>
  );
}

function ParamRow({
  label,
  value,
  mono = true,
  dict,
  onCopied,
}: {
  label: string;
  value: string | number | undefined;
  mono?: boolean;
  dict: Dictionary;
  onCopied?: (text: string) => void;
}) {
  if (value === undefined || value === null || value === "") return null;
  const str = String(value);
  return (
    <div className="group flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/60 px-3 py-1.5 last:border-b-0 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40">
      <dt className="w-28 shrink-0 text-xs text-zinc-500">{label}</dt>
      <dd className={`flex-1 min-w-0 text-sm break-all ${mono ? "font-mono" : ""} text-zinc-800 dark:text-zinc-200`}>
        {str}
      </dd>
      <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition">
        <CopyIconButton value={str} ariaLabel={dict.metadata.actions.copy} toastText={dict.metadata.actions.copied} onCopied={onCopied} />
      </div>
    </div>
  );
}

export function MetadataDisplay({ metadata, dict, onReset, onCopied }: Props) {
  const { platform, parsed, fileInfo, rawText, workflow } = metadata;
  const [showRaw, setShowRaw] = useState(false);
  const f = dict.metadata.fields;
  const platformLabel = dict.platforms[platform as keyof typeof dict.platforms] ?? platform;
  const isUnknown = platform === "unknown";

  const sizeText =
    parsed.width && parsed.height
      ? `${parsed.width}×${parsed.height}`
      : `${fileInfo.dimensions.width}×${fileInfo.dimensions.height}`;

  const copyPrompt = async () => {
    if (!parsed.prompt) return;
    try {
      await navigator.clipboard.writeText(parsed.prompt);
      onCopied?.(dict.metadata.actions.copied);
    } catch {
      /* ignore */
    }
  };

  const hasParams =
    parsed.model ||
    parsed.modelHash ||
    parsed.vae ||
    parsed.sampler ||
    parsed.scheduler ||
    parsed.steps !== undefined ||
    parsed.cfgScale !== undefined ||
    parsed.seed !== undefined ||
    parsed.clipSkip !== undefined ||
    parsed.denoisingStrength !== undefined ||
    sizeText;

  return (
    <div className="space-y-4">
      {/* Result header */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center rounded-full border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
            {platformLabel}
          </span>
          <span className="truncate text-sm text-zinc-700 dark:text-zinc-300" title={fileInfo.filename}>
            {fileInfo.filename}
          </span>
          <span className="text-xs text-zinc-400 whitespace-nowrap">
            · {sizeText} · {formatBytes(fileInfo.size)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {parsed.prompt && (
            <button
              onClick={copyPrompt}
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              {dict.metadata.actions.copyPrompt}
            </button>
          )}
          {onReset && (
            <button
              onClick={onReset}
              className="rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition"
            >
              {dict.metadata.actions.clear}
            </button>
          )}
        </div>
      </div>

      {isUnknown && !rawText && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
          {dict.metadata.noMetadata}
        </div>
      )}

      {parsed.prompt && (
        <PromptBlock label={f.prompt} value={parsed.prompt} dict={dict} onCopied={onCopied} primary />
      )}
      {parsed.negativePrompt && (
        <PromptBlock label={f.negativePrompt} value={parsed.negativePrompt} dict={dict} onCopied={onCopied} />
      )}

      {hasParams && (
        <section className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <dl>
            <ParamRow label={f.model} value={parsed.model} dict={dict} onCopied={onCopied} />
            <ParamRow label={f.modelHash} value={parsed.modelHash} dict={dict} onCopied={onCopied} />
            <ParamRow label={f.vae} value={parsed.vae} dict={dict} onCopied={onCopied} />
            <ParamRow label={f.sampler} value={parsed.sampler} dict={dict} onCopied={onCopied} />
            <ParamRow label={f.scheduler} value={parsed.scheduler} dict={dict} onCopied={onCopied} />
            <ParamRow label={f.steps} value={parsed.steps} dict={dict} onCopied={onCopied} />
            <ParamRow label={f.cfgScale} value={parsed.cfgScale} dict={dict} onCopied={onCopied} />
            <ParamRow label={f.seed} value={parsed.seed} dict={dict} onCopied={onCopied} />
            <ParamRow label={f.size} value={parsed.width && parsed.height ? `${parsed.width}×${parsed.height}` : undefined} dict={dict} onCopied={onCopied} />
            <ParamRow label={f.clipSkip} value={parsed.clipSkip} dict={dict} onCopied={onCopied} />
            <ParamRow label={f.denoise} value={parsed.denoisingStrength} dict={dict} onCopied={onCopied} />
          </dl>
        </section>
      )}

      {parsed.loras && parsed.loras.length > 0 && (
        <section className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2">
          <div className="text-[11px] uppercase tracking-wider text-zinc-500 mb-2">{f.loras}</div>
          <ul className="flex flex-wrap gap-1.5">
            {parsed.loras.map((l, i) => (
              <li
                key={i}
                className="inline-flex items-center gap-1.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2 py-0.5 text-xs font-mono"
              >
                <span>{l.name}</span>
                <span className="text-zinc-500">{l.weight}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {parsed.embeddings && parsed.embeddings.length > 0 && (
        <PromptBlock label={f.embeddings} value={parsed.embeddings.join(", ")} dict={dict} onCopied={onCopied} />
      )}

      {parsed.extras && Object.keys(parsed.extras).length > 0 && (
        <details className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <summary className="cursor-pointer px-3 py-2 text-[11px] uppercase tracking-wider text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
            {f.extras} · {Object.keys(parsed.extras).length}
          </summary>
          <dl className="border-t border-zinc-100 dark:border-zinc-800/60">
            {Object.entries(parsed.extras).map(([k, v]) => (
              <ParamRow key={k} label={k} value={v} dict={dict} onCopied={onCopied} />
            ))}
          </dl>
        </details>
      )}

      {workflow !== undefined && (
        <details className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <summary className="flex cursor-pointer items-center justify-between px-3 py-2 text-[11px] uppercase tracking-wider text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
            <span>{f.workflow}</span>
            <button
              onClick={(e) => {
                e.preventDefault();
                const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${fileInfo.filename.replace(/\.[^.]+$/, "")}-workflow.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 py-0.5 text-[11px] normal-case tracking-normal text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              {dict.metadata.actions.download}
            </button>
          </summary>
          <pre className="border-t border-zinc-100 dark:border-zinc-800/60 px-3 py-2 text-xs font-mono overflow-auto max-h-96">
            {JSON.stringify(workflow, null, 2)}
          </pre>
        </details>
      )}

      {rawText && (
        <details
          open={showRaw}
          onToggle={(e) => setShowRaw((e.target as HTMLDetailsElement).open)}
          className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
        >
          <summary className="cursor-pointer px-3 py-2 text-[11px] uppercase tracking-wider text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
            {dict.metadata.actions.showRaw}
          </summary>
          <pre className="border-t border-zinc-100 dark:border-zinc-800/60 px-3 py-2 text-xs font-mono overflow-auto max-h-96 whitespace-pre-wrap">
            {rawText}
          </pre>
        </details>
      )}
    </div>
  );
}
