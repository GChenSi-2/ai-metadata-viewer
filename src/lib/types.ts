export type AIPlatform =
  | "automatic1111"
  | "comfyui"
  | "novelai"
  | "midjourney"
  | "invokeai"
  | "fooocus"
  | "unknown";

export interface ParsedMetadata {
  prompt?: string;
  negativePrompt?: string;
  model?: string;
  modelHash?: string;
  vae?: string;
  sampler?: string;
  scheduler?: string;
  steps?: number;
  cfgScale?: number;
  seed?: number;
  width?: number;
  height?: number;
  clipSkip?: number;
  denoisingStrength?: number;
  loras?: Array<{ name: string; weight: number }>;
  embeddings?: string[];
  extras?: Record<string, string>;
}

export interface FileInfo {
  filename: string;
  size: number;
  mimeType: string;
  dimensions: { width: number; height: number };
}

export interface ExtractedMetadata {
  platform: AIPlatform;
  rawText: string;
  parsed: ParsedMetadata;
  workflow?: unknown;
  fileInfo: FileInfo;
  extractedAt: number;
}

export interface HistoryEntry {
  id: string;
  metadata: ExtractedMetadata;
}
