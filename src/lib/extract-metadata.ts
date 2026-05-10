import exifr from "exifr";
import type { AIPlatform, ExtractedMetadata } from "./types";
import { parsePngChunks } from "./png-text-parser";
import { parseAutomatic1111 } from "./parsers/automatic1111";
import { parseComfyUI } from "./parsers/comfyui";
import { isNovelAI, parseNovelAI } from "./parsers/novelai";
import { isMidjourney, parseMidjourney } from "./parsers/midjourney";

function detectPlatformFromPng(chunks: Record<string, string>): AIPlatform {
  if (isNovelAI(chunks)) return "novelai";
  if (chunks["workflow"] || chunks["prompt"]?.trim().startsWith("{")) return "comfyui";
  if (chunks["parameters"]) {
    const p = chunks["parameters"];
    if (/Steps\s*:/i.test(p)) return "automatic1111";
  }
  if (chunks["sd-metadata"] || chunks["invokeai_metadata"]) return "invokeai";
  if (chunks["fooocus_scheme"]) return "fooocus";
  return "unknown";
}

export async function extractMetadata(file: File): Promise<ExtractedMetadata> {
  const buffer = await file.arrayBuffer();
  const isPng = file.type === "image/png" || file.name.toLowerCase().endsWith(".png");
  const isJpeg = /^image\/jpe?g$/.test(file.type) || /\.(jpe?g)$/i.test(file.name);

  let platform: AIPlatform = "unknown";
  let rawText = "";
  let parsed: ExtractedMetadata["parsed"] = {};
  let workflow: unknown;
  let width = 0;
  let height = 0;

  if (isPng) {
    const { text: chunks, width: w, height: h } = await parsePngChunks(buffer);
    width = w; height = h;
    platform = detectPlatformFromPng(chunks);

    if (platform === "automatic1111") {
      rawText = chunks["parameters"];
      parsed = parseAutomatic1111(rawText);
    } else if (platform === "comfyui") {
      const r = parseComfyUI(chunks["prompt"], chunks["workflow"]);
      parsed = r.parsed;
      workflow = r.workflow;
      rawText = chunks["prompt"] || chunks["workflow"] || "";
    } else if (platform === "novelai") {
      parsed = parseNovelAI(chunks);
      rawText = JSON.stringify(chunks, null, 2);
    } else {
      // dump everything
      rawText = Object.entries(chunks).map(([k, v]) => `${k}: ${v}`).join("\n\n");
      // Best-effort: if any chunk looks like a1111 parameters
      const candidate = Object.values(chunks).find((v) => /Steps\s*:/i.test(v));
      if (candidate) {
        platform = "automatic1111";
        rawText = candidate;
        parsed = parseAutomatic1111(candidate);
      }
    }
  } else if (isJpeg) {
    try {
      const exif = await exifr.parse(buffer, { userComment: true });
      const candidate =
        (exif?.UserComment as string | undefined) ||
        (exif?.ImageDescription as string | undefined) ||
        (exif?.Description as string | undefined) ||
        "";
      rawText = candidate;
      width = exif?.ImageWidth || exif?.ExifImageWidth || 0;
      height = exif?.ImageHeight || exif?.ExifImageHeight || 0;
      if (isMidjourney(candidate)) {
        platform = "midjourney";
        parsed = parseMidjourney(candidate);
      } else if (/Steps\s*:/i.test(candidate)) {
        platform = "automatic1111";
        parsed = parseAutomatic1111(candidate);
      }
    } catch {
      // ignore
    }
  }

  if (!width || !height) {
    const dims = await readImageDimensions(file).catch(() => ({ width: 0, height: 0 }));
    width = width || dims.width;
    height = height || dims.height;
  }

  return {
    platform,
    rawText,
    parsed,
    workflow,
    fileInfo: {
      filename: file.name,
      size: file.size,
      mimeType: file.type || (isPng ? "image/png" : isJpeg ? "image/jpeg" : "application/octet-stream"),
      dimensions: { width, height },
    },
    extractedAt: Date.now(),
  };
}

async function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  if (typeof window === "undefined") return { width: 0, height: 0 };
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const out = { width: img.naturalWidth, height: img.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(out);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}
