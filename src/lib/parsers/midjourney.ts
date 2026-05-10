import type { ParsedMetadata } from "../types";

// Midjourney embeds metadata in JPEG EXIF fields (Description, ImageDescription, UserComment).
// The string usually looks like:  "{prompt} --ar 16:9 --s 250 --v 6.1 Job ID: <uuid>"
// We accept a free-form string (caller passes whatever EXIF returned).

const FLAG_KEYS: Record<string, keyof ParsedMetadata | "size"> = {
  s: "extras" as never, // stylize -> extras
  stylize: "extras" as never,
  c: "extras" as never, // chaos
  chaos: "extras" as never,
  ar: "size",
  v: "extras" as never,
  niji: "extras" as never,
  seed: "seed",
  q: "extras" as never,
  quality: "extras" as never,
};

export function parseMidjourney(text: string): ParsedMetadata {
  const parsed: ParsedMetadata = { extras: {} };
  if (!text) return parsed;

  let working = text.trim();

  // Strip Job ID
  const jobMatch = working.match(/Job\s*ID:\s*([a-f0-9-]+)/i);
  if (jobMatch) {
    parsed.extras!.jobId = jobMatch[1];
    working = working.replace(jobMatch[0], "").trim();
  }

  // Pull out --flag value pairs
  const flagRe = /--([a-zA-Z]+)(?:\s+([^\s-][^\s]*(?:\s+[^\s-][^\s]*)*?))?(?=\s+--|\s*$)/g;
  let m;
  const consumed: Array<[number, number]> = [];
  while ((m = flagRe.exec(working))) {
    const flag = m[1].toLowerCase();
    const val = (m[2] ?? "").trim();
    consumed.push([m.index, m.index + m[0].length]);

    if (flag === "no") {
      parsed.negativePrompt = val;
    } else if (flag === "ar") {
      parsed.extras!.aspectRatio = val;
    } else if (flag === "seed") {
      const n = parseInt(val, 10);
      if (!isNaN(n)) parsed.seed = n;
    } else if (flag === "v" || flag === "niji") {
      parsed.extras!.version = flag === "niji" ? `niji ${val}`.trim() : val || flag;
      parsed.model = parsed.extras!.version;
    } else if (FLAG_KEYS[flag] !== undefined) {
      parsed.extras![flag] = val || "true";
    } else {
      parsed.extras![flag] = val || "true";
    }
  }

  // Remove flag substrings to recover the prompt
  let prompt = working;
  // simpler: split by " --" and take first segment
  const dashIdx = prompt.indexOf(" --");
  if (dashIdx >= 0) prompt = prompt.slice(0, dashIdx);
  prompt = prompt.trim();
  if (prompt) parsed.prompt = prompt;

  return parsed;
}

export function isMidjourney(text: string): boolean {
  if (!text) return false;
  return /Job\s*ID:\s*[a-f0-9-]+/i.test(text) || /\s--(ar|v|niji|s|stylize|chaos)\b/i.test(text);
}
