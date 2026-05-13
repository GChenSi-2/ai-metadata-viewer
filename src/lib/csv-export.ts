import type { ExtractedMetadata } from "./types";

/** RFC 4180-ish CSV cell escaping. */
function escapeCsv(value: unknown): string {
  if (value === undefined || value === null) return "";
  const s = String(value);
  // Wrap in quotes if it contains comma, newline, CR, or double-quote.
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

const COLUMNS = [
  "filename",
  "platform",
  "prompt",
  "negative_prompt",
  "model",
  "model_hash",
  "vae",
  "sampler",
  "scheduler",
  "steps",
  "cfg_scale",
  "seed",
  "width",
  "height",
  "clip_skip",
  "denoise",
  "loras",
  "embeddings",
  "size_bytes",
  "mime_type",
  "extracted_at",
] as const;

export function metadataToCsv(entries: ExtractedMetadata[]): string {
  const lines: string[] = [];
  lines.push(COLUMNS.map(escapeCsv).join(","));

  for (const m of entries) {
    const p = m.parsed;
    const loras = (p.loras ?? []).map((l) => `${l.name}:${l.weight}`).join("; ");
    const embeddings = (p.embeddings ?? []).join("; ");
    const row: Record<(typeof COLUMNS)[number], unknown> = {
      filename: m.fileInfo.filename,
      platform: m.platform,
      prompt: p.prompt ?? "",
      negative_prompt: p.negativePrompt ?? "",
      model: p.model ?? "",
      model_hash: p.modelHash ?? "",
      vae: p.vae ?? "",
      sampler: p.sampler ?? "",
      scheduler: p.scheduler ?? "",
      steps: p.steps ?? "",
      cfg_scale: p.cfgScale ?? "",
      seed: p.seed ?? "",
      width: p.width ?? m.fileInfo.dimensions.width,
      height: p.height ?? m.fileInfo.dimensions.height,
      clip_skip: p.clipSkip ?? "",
      denoise: p.denoisingStrength ?? "",
      loras,
      embeddings,
      size_bytes: m.fileInfo.size,
      mime_type: m.fileInfo.mimeType,
      extracted_at: new Date(m.extractedAt).toISOString(),
    };
    lines.push(COLUMNS.map((c) => escapeCsv(row[c])).join(","));
  }

  // Excel + most importers expect CRLF line endings + a BOM for UTF-8 detection.
  return "﻿" + lines.join("\r\n") + "\r\n";
}

export function downloadCsv(csvText: string, filename: string): void {
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
