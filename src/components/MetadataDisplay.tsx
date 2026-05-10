"use client";

import { useState } from "react";
import type { ExtractedMetadata } from "@/lib/types";
import type { Dictionary } from "@/i18n/dictionaries";

function CopyButton({ value, dict }: { value: string; dict: Dictionary }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="text-xs px-2 py-1 rounded bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700"
    >
      {copied ? dict.metadata.actions.copied : dict.metadata.actions.copy}
    </button>
  );
}

function Field({ label, value, dict }: { label: string; value?: string | number; dict: Dictionary }) {
  if (value === undefined || value === null || value === "") return null;
  const str = String(value);
  return (
    <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs uppercase tracking-wide text-zinc-500">{label}</span>
        <CopyButton value={str} dict={dict} />
      </div>
      <div className="text-sm text-zinc-900 dark:text-zinc-100 break-words whitespace-pre-wrap">{str}</div>
    </div>
  );
}

export function MetadataDisplay({ metadata, dict }: { metadata: ExtractedMetadata; dict: Dictionary }) {
  const { platform, parsed, fileInfo, rawText, workflow } = metadata;
  const [showRaw, setShowRaw] = useState(false);
  const f = dict.metadata.fields;

  const platformLabel = dict.platforms[platform as keyof typeof dict.platforms] ?? platform;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-zinc-500">{dict.metadata.platform}</div>
          <div className="text-lg font-semibold">{platformLabel}</div>
        </div>
        <div className="text-xs text-zinc-500 text-right">
          <div>{fileInfo.filename}</div>
          <div>
            {fileInfo.dimensions.width}×{fileInfo.dimensions.height} · {(fileInfo.size / 1024).toFixed(1)} KB
          </div>
        </div>
      </div>

      {platform === "unknown" && !rawText && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          {dict.metadata.noMetadata}
        </div>
      )}

      {parsed.prompt && <Field label={f.prompt} value={parsed.prompt} dict={dict} />}
      {parsed.negativePrompt && <Field label={f.negativePrompt} value={parsed.negativePrompt} dict={dict} />}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Field label={f.model} value={parsed.model} dict={dict} />
        <Field label={f.modelHash} value={parsed.modelHash} dict={dict} />
        <Field label={f.vae} value={parsed.vae} dict={dict} />
        <Field label={f.sampler} value={parsed.sampler} dict={dict} />
        <Field label={f.scheduler} value={parsed.scheduler} dict={dict} />
        <Field label={f.steps} value={parsed.steps} dict={dict} />
        <Field label={f.cfgScale} value={parsed.cfgScale} dict={dict} />
        <Field label={f.seed} value={parsed.seed} dict={dict} />
        <Field label={f.size} value={parsed.width && parsed.height ? `${parsed.width}×${parsed.height}` : undefined} dict={dict} />
        <Field label={f.clipSkip} value={parsed.clipSkip} dict={dict} />
        <Field label={f.denoise} value={parsed.denoisingStrength} dict={dict} />
      </div>

      {parsed.loras && parsed.loras.length > 0 && (
        <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 p-3">
          <div className="text-xs uppercase tracking-wide text-zinc-500 mb-2">{f.loras}</div>
          <ul className="space-y-1 text-sm">
            {parsed.loras.map((l, i) => (
              <li key={i} className="font-mono">
                {l.name} <span className="text-zinc-500">({l.weight})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {parsed.embeddings && parsed.embeddings.length > 0 && (
        <Field label={f.embeddings} value={parsed.embeddings.join(", ")} dict={dict} />
      )}

      {parsed.extras && Object.keys(parsed.extras).length > 0 && (
        <details className="rounded-lg bg-zinc-50 dark:bg-zinc-900 p-3">
          <summary className="text-xs uppercase tracking-wide text-zinc-500 cursor-pointer">
            {f.extras} ({Object.keys(parsed.extras).length})
          </summary>
          <dl className="mt-2 space-y-1 text-sm">
            {Object.entries(parsed.extras).map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <dt className="text-zinc-500 shrink-0">{k}:</dt>
                <dd className="font-mono break-all">{v}</dd>
              </div>
            ))}
          </dl>
        </details>
      )}

      {workflow !== undefined && (
        <details className="rounded-lg bg-zinc-50 dark:bg-zinc-900 p-3">
          <summary className="text-xs uppercase tracking-wide text-zinc-500 cursor-pointer flex items-center justify-between">
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
              className="text-xs px-2 py-1 rounded bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            >
              {dict.metadata.actions.download}
            </button>
          </summary>
          <pre className="mt-2 text-xs overflow-auto max-h-96">{JSON.stringify(workflow, null, 2)}</pre>
        </details>
      )}

      {rawText && (
        <div>
          <button
            onClick={() => setShowRaw((s) => !s)}
            className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            {showRaw ? dict.metadata.actions.hideRaw : dict.metadata.actions.showRaw}
          </button>
          {showRaw && (
            <pre className="mt-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 p-3 text-xs overflow-auto max-h-96 whitespace-pre-wrap">
              {rawText}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
