import type { ExtractedMetadata, HistoryEntry } from "./types";

const STORAGE_KEY = "amv:history:v1";
const MAX_ENTRIES = 20;
const EVENT = "amv:history-changed";

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function readHistory(): HistoryEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeHistory(entries: HistoryEntry[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // quota exceeded — silently drop
  }
}

export function addHistoryEntry(metadata: ExtractedMetadata): HistoryEntry {
  // Strip workflow blob from history to keep storage small (still in-memory in current session if needed)
  const slim: ExtractedMetadata = { ...metadata, workflow: undefined };
  const entry: HistoryEntry = { id: generateId(), metadata: slim };
  const current = readHistory();
  const next = [entry, ...current].slice(0, MAX_ENTRIES);
  writeHistory(next);
  return entry;
}

export function deleteHistoryEntry(id: string): void {
  const next = readHistory().filter((e) => e.id !== id);
  writeHistory(next);
}

export function clearHistory(): void {
  writeHistory([]);
}

export function subscribeHistory(cb: () => void): () => void {
  if (!isBrowser()) return () => {};
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) handler();
  });
  return () => {
    window.removeEventListener(EVENT, handler);
  };
}
