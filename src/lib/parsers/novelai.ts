import type { ParsedMetadata } from "../types";

// NovelAI writes:
//   tEXt "Software" = "NovelAI"
//   tEXt "Description" = prompt text
//   tEXt "Comment" = JSON with steps, sampler, seed, scale, uc (negative), etc.

export function parseNovelAI(chunks: Record<string, string>): ParsedMetadata {
  const parsed: ParsedMetadata = { extras: {} };
  const description = chunks["Description"];
  const comment = chunks["Comment"];

  if (description) parsed.prompt = description.trim();

  if (comment) {
    try {
      const obj = JSON.parse(comment) as Record<string, unknown>;
      if (typeof obj.steps === "number") parsed.steps = obj.steps;
      if (typeof obj.scale === "number") parsed.cfgScale = obj.scale;
      if (typeof obj.seed === "number") parsed.seed = obj.seed;
      if (typeof obj.sampler === "string") parsed.sampler = obj.sampler;
      if (typeof obj.uc === "string") parsed.negativePrompt = obj.uc;
      if (typeof obj.width === "number") parsed.width = obj.width;
      if (typeof obj.height === "number") parsed.height = obj.height;
      if (typeof obj.noise_schedule === "string") parsed.scheduler = obj.noise_schedule;
      // Stash everything else as extras
      for (const [k, v] of Object.entries(obj)) {
        if (["steps", "scale", "seed", "sampler", "uc", "width", "height", "noise_schedule"].includes(k)) continue;
        if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
          parsed.extras![k] = String(v);
        }
      }
    } catch {
      // ignore
    }
  }

  return parsed;
}

export function isNovelAI(chunks: Record<string, string>): boolean {
  return chunks["Software"]?.toLowerCase().includes("novelai") ?? false;
}
