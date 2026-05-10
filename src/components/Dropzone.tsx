"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { extractMetadata } from "@/lib/extract-metadata";
import { addHistoryEntry } from "@/lib/history";
import type { ExtractedMetadata } from "@/lib/types";
import type { Dictionary } from "@/i18n/dictionaries";
import { useToast } from "./Toast";
import { MetadataDisplay } from "./MetadataDisplay";

const ACCEPT = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
};

export function Dropzone({ dict }: { dict: Dictionary }) {
  const [result, setResult] = useState<ExtractedMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const handleFile = useCallback(
    async (file: File) => {
      setBusy(true);
      setError(null);
      try {
        const m = await extractMetadata(file);
        setResult(m);
        if (m.platform !== "unknown" || m.rawText) addHistoryEntry(m);
      } catch (e) {
        setError(e instanceof Error ? e.message : dict.errors.readFailed);
        setResult(null);
      } finally {
        setBusy(false);
      }
    },
    [dict.errors.readFailed],
  );

  const onDrop = useCallback(
    (files: File[]) => {
      if (files.length) handleFile(files[0]);
    },
    [handleFile],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: ACCEPT,
    multiple: false,
    noClick: false,
    noKeyboard: false,
  });

  // Global paste handler — Cmd/Ctrl+V from clipboard
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const f = item.getAsFile();
          if (f) {
            e.preventDefault();
            handleFile(f);
            return;
          }
        }
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleFile]);

  // Esc to clear
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && (result || error)) {
        setResult(null);
        setError(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [result, error]);

  const reset = () => {
    setResult(null);
    setError(null);
  };

  // Three layouts: empty (large), busy (large with spinner), result (compact strip + display)
  if (result && !busy) {
    return (
      <div className="space-y-4">
        <CompactDropzone
          dict={dict}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          isDragActive={isDragActive}
        />
        <MetadataDisplay metadata={result} dict={dict} onReset={reset} onCopied={(text) => toast.show(text, "success")} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`relative rounded-xl border border-dashed transition-colors px-6 py-14 sm:py-20 text-center cursor-pointer select-none ${
          isDragActive
            ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/30"
            : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500"
        }`}
        aria-label={dict.dropzone.idle}
      >
        <input {...getInputProps()} />
        {busy ? (
          <div className="flex flex-col items-center gap-3">
            <Spinner />
            <span className="text-sm text-zinc-500">{dict.dropzone.reading}</span>
          </div>
        ) : (
          <>
            <p className="text-base sm:text-lg text-zinc-800 dark:text-zinc-200">
              {isDragActive ? dict.dropzone.active : dict.dropzone.idle}
            </p>
            <p className="mt-2 text-xs text-zinc-500">{dict.dropzone.hint}</p>
            <p className="mt-3 text-[11px] text-zinc-400 dark:text-zinc-500">
              {dict.dropzone.privacy}
            </p>
          </>
        )}
      </div>
      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button
            onClick={reset}
            className="text-xs underline underline-offset-2 hover:opacity-80"
          >
            {dict.metadata.actions.clear}
          </button>
        </div>
      )}
      {/* Visually hidden helper to allow keyboard "/" focus */}
      <button
        type="button"
        onClick={open}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      >
        open file
      </button>
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
          ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/30"
          : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500"
      }`}
      aria-label={dict.dropzone.compact}
    >
      <input {...getInputProps()} />
      <span className="text-zinc-600 dark:text-zinc-400">
        {isDragActive ? dict.dropzone.active : dict.dropzone.compact}
      </span>
      <span className="text-xs text-zinc-400 dark:text-zinc-500 hidden sm:inline">
        {dict.dropzone.hint}
      </span>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin text-zinc-500"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
