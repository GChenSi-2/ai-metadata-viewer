"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { extractMetadata } from "@/lib/extract-metadata";
import { addHistoryEntry } from "@/lib/history";
import type { ExtractedMetadata } from "@/lib/types";
import type { Dictionary } from "@/i18n/dictionaries";
import { MetadataDisplay } from "./MetadataDisplay";

export function Dropzone({ dict }: { dict: Dictionary }) {
  const [result, setResult] = useState<ExtractedMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onDrop = useCallback(async (files: File[]) => {
    if (!files.length) return;
    setBusy(true);
    setError(null);
    try {
      const m = await extractMetadata(files[0]);
      setResult(m);
      if (m.platform !== "unknown" || m.rawText) {
        addHistoryEntry(m);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : dict.errors.readFailed);
      setResult(null);
    } finally {
      setBusy(false);
    }
  }, [dict.errors.readFailed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"], "image/webp": [".webp"] },
    multiple: false,
  });

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
            : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500"
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-lg font-medium text-zinc-800 dark:text-zinc-200">
          {isDragActive ? dict.dropzone.active : dict.dropzone.idle}
        </p>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{dict.dropzone.formats}</p>
        <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">{dict.dropzone.privacy}</p>
      </div>

      {busy && <p className="mt-6 text-center text-zinc-500">{dict.dropzone.reading}</p>}
      {error && (
        <div className="mt-6 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}
      {result && !busy && (
        <div className="mt-8">
          <MetadataDisplay metadata={result} dict={dict} />
        </div>
      )}
    </div>
  );
}
