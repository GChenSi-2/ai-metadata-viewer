// Single source of truth for canonical site URL. Override via NEXT_PUBLIC_SITE_URL.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://ai-metadata-viewer.example.com";

export const SITE_NAME = "AI Image Metadata Viewer";

export const PLATFORM_LANDINGS = [
  { slug: "automatic1111-metadata-viewer", platform: "automatic1111" },
  { slug: "comfyui-workflow-extractor", platform: "comfyui" },
  { slug: "novelai-prompt-extractor", platform: "novelai" },
] as const;

export type PlatformLandingSlug = (typeof PLATFORM_LANDINGS)[number]["slug"];
