import type { ParsedMetadata } from "../types";

// ComfyUI embeds two PNG tEXt chunks:
//   "prompt"   — the executable prompt graph (node-id keyed)
//   "workflow" — the editor workflow JSON (with positions etc.)
// Both are JSON. We try to extract human-readable info from the prompt graph.

interface ComfyNode {
  class_type?: string;
  inputs?: Record<string, unknown>;
}

type ComfyPromptGraph = Record<string, ComfyNode>;

export interface ComfyParseResult {
  parsed: ParsedMetadata;
  workflow?: unknown;
}

function isString(x: unknown): x is string {
  return typeof x === "string";
}
function isNumber(x: unknown): x is number {
  return typeof x === "number" && !isNaN(x);
}

export function parseComfyUI(promptJson?: string, workflowJson?: string): ComfyParseResult {
  const parsed: ParsedMetadata = { extras: {} };
  let workflow: unknown;

  if (workflowJson) {
    try { workflow = JSON.parse(workflowJson); } catch { /* ignore */ }
  }

  if (!promptJson) return { parsed, workflow };

  let graph: ComfyPromptGraph;
  try {
    graph = JSON.parse(promptJson);
  } catch {
    return { parsed, workflow };
  }

  // Heuristic walk: find KSampler / KSamplerAdvanced for sampler/steps/cfg/seed,
  // find CheckpointLoaderSimple for model, find CLIPTextEncode nodes for prompts
  // (positive vs negative is inferred from being wired into KSampler.positive/negative).
  const positiveNodeIds = new Set<string>();
  const negativeNodeIds = new Set<string>();
  const loras: Array<{ name: string; weight: number }> = [];

  const linkedRef = (v: unknown): string | null => {
    if (Array.isArray(v) && v.length >= 1 && typeof v[0] === "string") return v[0];
    return null;
  };

  for (const [, node] of Object.entries(graph)) {
    if (!node || typeof node !== "object") continue;
    const cls = node.class_type || "";
    const inputs = node.inputs || {};

    if (cls.includes("KSampler")) {
      if (isNumber(inputs.steps)) parsed.steps = inputs.steps;
      if (isNumber(inputs.cfg)) parsed.cfgScale = inputs.cfg;
      if (isNumber(inputs.seed)) parsed.seed = inputs.seed;
      else if (isNumber(inputs.noise_seed)) parsed.seed = inputs.noise_seed;
      if (isString(inputs.sampler_name)) parsed.sampler = inputs.sampler_name;
      if (isString(inputs.scheduler)) parsed.scheduler = inputs.scheduler;
      if (isNumber(inputs.denoise)) parsed.denoisingStrength = inputs.denoise;
      const posRef = linkedRef(inputs.positive);
      if (posRef) positiveNodeIds.add(posRef);
      const negRef = linkedRef(inputs.negative);
      if (negRef) negativeNodeIds.add(negRef);
    } else if (cls === "CheckpointLoaderSimple" || cls === "CheckpointLoader" || cls === "UNETLoader") {
      if (isString(inputs.ckpt_name)) parsed.model = inputs.ckpt_name;
      else if (isString(inputs.unet_name)) parsed.model = inputs.unet_name;
    } else if (cls === "VAELoader") {
      if (isString(inputs.vae_name)) parsed.vae = inputs.vae_name;
    } else if (cls === "LoraLoader" || cls === "LoraLoaderModelOnly") {
      const name = isString(inputs.lora_name) ? inputs.lora_name : null;
      const w = isNumber(inputs.strength_model) ? inputs.strength_model : 1;
      if (name) loras.push({ name, weight: w });
    } else if (cls === "EmptyLatentImage" || cls === "EmptySD3LatentImage") {
      if (isNumber(inputs.width)) parsed.width = inputs.width;
      if (isNumber(inputs.height)) parsed.height = inputs.height;
    }
  }

  const collectPrompt = (id: string): string | null => {
    const node = graph[id];
    if (!node) return null;
    const text = node.inputs?.text;
    if (isString(text)) return text;
    // follow link if text is a reference
    const ref = linkedRef(text);
    if (ref) return collectPrompt(ref);
    return null;
  };

  const positives: string[] = [];
  for (const id of positiveNodeIds) {
    const t = collectPrompt(id);
    if (t) positives.push(t);
  }
  const negatives: string[] = [];
  for (const id of negativeNodeIds) {
    const t = collectPrompt(id);
    if (t) negatives.push(t);
  }
  if (positives.length) parsed.prompt = positives.join("\n").trim();
  if (negatives.length) parsed.negativePrompt = negatives.join("\n").trim();
  if (loras.length) parsed.loras = loras;

  return { parsed, workflow };
}
