import type { ParsedMetadata } from "../types";

// AUTOMATIC1111 / Forge "parameters" string format:
//   {prompt}
//   Negative prompt: {negative}
//   Steps: 20, Sampler: Euler a, CFG scale: 7, Seed: 12345, Size: 512x512, Model hash: abc, Model: v1-5, Lora hashes: "x:y", ...
// Final line is comma-separated key:value pairs. Values can be quoted with double quotes.

const KEY_MAP: Record<string, keyof ParsedMetadata | "size" | "ignore"> = {
  steps: "steps",
  sampler: "sampler",
  schedule: "scheduler",
  scheduler: "scheduler",
  "schedule type": "scheduler",
  "cfg scale": "cfgScale",
  seed: "seed",
  size: "size",
  "model hash": "modelHash",
  model: "model",
  vae: "vae",
  "clip skip": "clipSkip",
  "denoising strength": "denoisingStrength",
};

function splitTopLevel(line: string): string[] {
  // split by commas not inside quotes / brackets
  const out: string[] = [];
  let depth = 0;
  let inQuote = false;
  let buf = "";
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"' && line[i - 1] !== "\\") inQuote = !inQuote;
    else if (!inQuote) {
      if (c === "{" || c === "[" || c === "(") depth++;
      else if (c === "}" || c === "]" || c === ")") depth--;
    }
    if (c === "," && !inQuote && depth === 0) {
      out.push(buf.trim());
      buf = "";
    } else {
      buf += c;
    }
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

function unquote(v: string): string {
  v = v.trim();
  if (v.startsWith('"') && v.endsWith('"') && v.length >= 2) {
    return v.slice(1, -1).replace(/\\"/g, '"');
  }
  return v;
}

function extractLoras(prompt: string): Array<{ name: string; weight: number }> {
  const loras: Array<{ name: string; weight: number }> = [];
  const re = /<lora:([^:>]+):([-\d.]+)>/gi;
  let m;
  while ((m = re.exec(prompt))) {
    loras.push({ name: m[1], weight: parseFloat(m[2]) || 1 });
  }
  return loras;
}

function extractEmbeddings(prompt: string): string[] {
  const out = new Set<string>();
  const re = /<embedding:([^>]+)>/gi;
  let m;
  while ((m = re.exec(prompt))) out.add(m[1]);
  return Array.from(out);
}

export function parseAutomatic1111(raw: string): ParsedMetadata {
  const result: ParsedMetadata = { extras: {} };
  if (!raw || !raw.trim()) return result;

  const lines = raw.split("\n");
  // Find "Negative prompt:" line and the params line (last line that begins with a known key like "Steps:")
  let negIdx = -1;
  let paramsIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (negIdx < 0 && lines[i].toLowerCase().startsWith("negative prompt:")) negIdx = i;
    if (/^steps\s*:/i.test(lines[i].trim())) paramsIdx = i;
  }
  if (paramsIdx < 0) paramsIdx = lines.length; // no params line, treat all as prompt

  const promptEnd = negIdx >= 0 ? negIdx : paramsIdx;
  const promptText = lines.slice(0, promptEnd).join("\n").trim();
  const negText = negIdx >= 0
    ? lines.slice(negIdx, paramsIdx).join("\n").replace(/^negative prompt:\s*/i, "").trim()
    : "";
  const paramsLine = paramsIdx < lines.length ? lines.slice(paramsIdx).join(" ").trim() : "";

  if (promptText) result.prompt = promptText;
  if (negText) result.negativePrompt = negText;

  if (paramsLine) {
    const parts = splitTopLevel(paramsLine);
    for (const part of parts) {
      const colonIdx = part.indexOf(":");
      if (colonIdx < 0) continue;
      const key = part.slice(0, colonIdx).trim().toLowerCase();
      const value = unquote(part.slice(colonIdx + 1));
      const target = KEY_MAP[key];
      if (target === "size") {
        const m = /^(\d+)\s*x\s*(\d+)$/i.exec(value);
        if (m) {
          result.width = parseInt(m[1], 10);
          result.height = parseInt(m[2], 10);
        }
      } else if (target === "steps" || target === "seed" || target === "clipSkip") {
        const n = parseInt(value, 10);
        if (!isNaN(n)) (result as Record<string, unknown>)[target] = n;
      } else if (target === "cfgScale" || target === "denoisingStrength") {
        const n = parseFloat(value);
        if (!isNaN(n)) (result as Record<string, unknown>)[target] = n;
      } else if (target && target !== "ignore") {
        (result as Record<string, unknown>)[target] = value;
      } else {
        result.extras![part.slice(0, colonIdx).trim()] = value;
      }
    }
  }

  if (result.prompt) {
    const loras = extractLoras(result.prompt);
    if (loras.length) result.loras = loras;
    const emb = extractEmbeddings(result.prompt);
    if (emb.length) result.embeddings = emb;
  }

  return result;
}
