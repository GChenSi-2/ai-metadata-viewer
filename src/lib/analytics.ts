// Typed wrapper around posthog-js. Safe to call from anywhere — no-ops if
// the env key is missing or running on the server.

import posthog from "posthog-js";

type EventProps = {
  image_parsed: {
    platform: string;
    has_prompt: boolean;
    has_negative: boolean;
    has_workflow: boolean;
    has_loras: boolean;
    file_type: string;
    file_size_kb_bucket: string;
  };
  prompt_copied: { platform: string };
  field_copied: { field: string; platform: string };
  workflow_downloaded: { platform: string };
  raw_metadata_opened: { platform: string };
  history_opened: { entry_count: number };
  history_entry_loaded: { platform: string };
  history_cleared: Record<string, never>;
};

const ENABLED =
  typeof window !== "undefined" && Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);

export function track<K extends keyof EventProps>(event: K, props: EventProps[K]): void {
  if (!ENABLED) return;
  try {
    posthog.capture(event as string, props as Record<string, unknown>);
  } catch {
    // swallow — analytics must never break the app
  }
}

export function fileSizeBucket(bytes: number): string {
  const kb = bytes / 1024;
  if (kb < 100) return "<100";
  if (kb < 500) return "100-500";
  if (kb < 2000) return "500-2000";
  return ">2000";
}

export function fileTypeFromName(name: string, fallback: string): string {
  const ext = name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  if (ext) return ext;
  return fallback.replace(/^image\//, "") || "unknown";
}
