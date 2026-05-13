"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { extractMetadata } from "@/lib/extract-metadata";
import { addHistoryEntry } from "@/lib/history";
import type { ExtractedMetadata } from "@/lib/types";
import type { Dictionary } from "@/i18n/dictionaries";
import { durationBucket, fileSizeBucket, fileTypeFromName, track } from "@/lib/analytics";
import { useToast } from "./Toast";
import { MetadataDisplay } from "./MetadataDisplay";
import { BulkResults } from "./BulkResults";

const ACCEPT = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
};

const MAX_BULK = 100;

interface Props {
  dict: Dictionary;
  emptyHero?: React.ReactNode;
  emptyExtras?: React.ReactNode;
}

interface FailedItem {
  name: string;
  message: string;
}

export function Dropzone({ dict, emptyHero, emptyExtras }: Props) {
  const [results, setResults] = useState<ExtractedMetadata[]>([]);
  const [failed, setFailed] = useState<FailedItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const toast = useToast();

  // Track an event for a single parsed image.
  const trackSingle = useCallback((m: ExtractedMetadata, file: File) => {
    track("image_parsed", {
      platform: m.platform,
      has_prompt: Boolean(m.parsed.prompt),
      has_negative: Boolean(m.parsed.negativePrompt),
      has_workflow: m.workflow !== undefined,
      has_loras: Boolean(m.parsed.loras?.length),
      file_type: fileTypeFromName(file.name, file.type || "image/unknown"),
      file_size_kb_bucket: fileSizeBucket(file.size),
    });
  }, []);

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) return;
      setError(null);

      // Single-file fast path — preserves the existing single-result UX
      if (files.length === 1) {
        setBusy(true);
        setFailed([]);
        setProgress(null);
        try {
          const m = await extractMetadata(files[0]);
          setResults([m]);
          trackSingle(m, files[0]);
          if (m.platform !== "unknown" || m.rawText) addHistoryEntry(m);
        } catch (e) {
          setError(e instanceof Error ? e.message : dict.errors.readFailed);
          setResults([]);
        } finally {
          setBusy(false);
        }
        return;
      }

      // Bulk mode
      let trimmed = files;
      if (files.length > MAX_BULK) {
        trimmed = files.slice(0, MAX_BULK);
        toast.show(
          dict.bulk.tooMany.replace("{max}", String(MAX_BULK)),
          "neutral",
        );
      }

      setBusy(true);
      setResults([]);
      setFailed([]);
      setProgress({ done: 0, total: trimmed.length });

      const collected: ExtractedMetadata[] = [];
      const failures: FailedItem[] = [];
      const startedAt = performance.now();

      for (let i = 0; i < trimmed.length; i++) {
        const file = trimmed[i];
        try {
          const m = await extractMetadata(file);
          collected.push(m);
          trackSingle(m, file);
          if (m.platform !== "unknown" || m.rawText) addHistoryEntry(m);
        } catch (e) {
          failures.push({
            name: file.name,
            message: e instanceof Error ? e.message : dict.errors.readFailed,
          });
        }
        // Stream updates so the UI doesn't feel frozen.
        setResults([...collected]);
        setFailed([...failures]);
        setProgress({ done: i + 1, total: trimmed.length });
      }

      const durationMs = performance.now() - startedAt;
      track("bulk_parsed", {
        file_count: trimmed.length,
        success_count: collected.length,
        failed_count: failures.length,
        duration_ms_bucket: durationBucket(durationMs),
      });
      setProgress(null);
      setBusy(false);
    },
    [dict.errors.readFailed, dict.bulk.tooMany, toast, trackSingle],
  );

  const onDrop = useCallback(
    (files: File[]) => {
      handleFiles(files);
    },
    [handleFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    multiple: true,
  });

  // ⌘V / Ctrl+V — paste image(s) from clipboard
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const pasted: File[] = [];
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const f = item.getAsFile();
          if (f) pasted.push(f);
        }
      }
      if (pasted.length) {
        e.preventDefault();
        handleFiles(pasted);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleFiles]);

  // Esc — clear results / errors
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && (results.length || error || failed.length)) {
        setResults([]);
        setFailed([]);
        setError(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [results.length, failed.length, error]);

  const reset = () => {
    setResults([]);
    setFailed([]);
    setError(null);
  };

  const hasResults = results.length > 0 || failed.length > 0;

  // Result mode: compact strip + (single result OR bulk list)
  if (hasResults && !busy) {
    return (
      <div className="space-y-4">
        <CompactDropzone
          dict={dict}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          isDragActive={isDragActive}
        />
        {results.length === 1 && failed.length === 0 ? (
          <MetadataDisplay
            metadata={results[0]}
            dict={dict}
            onReset={reset}
            onCopied={(text) => toast.show(text, "success")}
          />
        ) : (
          <BulkResults
            results={results}
            failed={failed}
            dict={dict}
            onReset={reset}
            onCopied={(text) => toast.show(text, "success")}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {emptyHero}

      <div
        {...getRootProps()}
        className={`gradient-ring relative cursor-pointer select-none transition-colors ${
          isDragActive ? "ring-2 ring-blue-500/40" : ""
        }`}
        aria-label={dict.dropzone.idle}
      >
        <input {...getInputProps()} />
        <div
          className={`relative rounded-[14px] border ${
            isDragActive
              ? "border-transparent bg-blue-50/70 dark:bg-blue-950/30"
              : "border-zinc-200/70 dark:border-zinc-800/70 bg-white/85 dark:bg-zinc-950/60"
          } backdrop-blur px-6 py-12 sm:py-16 text-center transition-colors`}
        >
          {busy ? (
            <div className="flex flex-col items-center gap-3">
              <Spinner />
              <span className="text-sm text-zinc-500">
                {progress
                  ? dict.bulk.progress
                      .replace("{done}", String(progress.done))
                      .replace("{total}", String(progress.total))
                  : dict.dropzone.reading}
              </span>
            </div>
          ) : (
            <>
              <UploadIcon className="mx-auto h-10 w-10 text-zinc-400 dark:text-zinc-500" />
              <p className="mt-3 text-base sm:text-lg font-medium text-zinc-800 dark:text-zinc-100">
                {isDragActive ? dict.dropzone.active : dict.dropzone.idle}
              </p>
              <p className="mt-1.5 text-xs text-zinc-500">{dict.dropzone.hint}</p>
              <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
                <ShieldIcon className="h-3 w-3" />
                {dict.dropzone.privacy}
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50/80 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button onClick={reset} className="text-xs underline underline-offset-2 hover:opacity-80">
            {dict.metadata.actions.clear}
          </button>
        </div>
      )}

      {emptyExtras}
    </div>
  );
}

function CompactDropzone({
  dict,
  getRootProps,
  getInputProps,
  isDragActive,
}: {
  dict: Dictionary;
  getRootProps: ReturnType<typeof useDropzone>["getRootProps"];
  getInputProps: ReturnType<typeof useDropzone>["getInputProps"];
  isDragActive: boolean;
}) {
  return (
    <div
      {...getRootProps()}
      className={`group flex items-center justify-between gap-3 rounded-md border border-dashed px-3 py-2 text-sm cursor-pointer transition-colors ${
        isDragActive
          ? "border-blue-500 bg-blue-50/70 dark:bg-blue-950/30"
          : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500"
      }`}
      aria-label={dict.dropzone.compact}
    >
      <input {...getInputProps()} />
      <span className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
        <UploadIcon className="h-4 w-4 text-zinc-400" />
        {isDragActive ? dict.dropzone.active : dict.dropzone.compact}
      </span>
      <span className="text-xs text-zinc-400 dark:text-zinc-500 hidden sm:inline">
        {dict.dropzone.hint}
      </span>
    </div>
  );
}

function UploadIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v11m0-11l-4 4m4-4l4 4M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

function ShieldIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin text-zinc-500" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
