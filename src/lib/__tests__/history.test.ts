import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addHistoryEntry,
  clearHistory,
  deleteHistoryEntry,
  readHistory,
} from "../history";
import type { ExtractedMetadata } from "../types";

function makeMeta(filename: string, platform: ExtractedMetadata["platform"] = "automatic1111"): ExtractedMetadata {
  return {
    platform,
    rawText: "Steps: 20",
    parsed: { prompt: "test", steps: 20 },
    fileInfo: { filename, size: 1024, mimeType: "image/png", dimensions: { width: 64, height: 64 } },
    extractedAt: Date.now(),
  };
}

beforeEach(() => {
  // jsdom-free shim: install a minimal localStorage + window
  const store = new Map<string, string>();
  const ls = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() { return store.size; },
  };
  vi.stubGlobal("localStorage", ls);
  vi.stubGlobal("window", { localStorage: ls, dispatchEvent: () => true, addEventListener: () => {}, removeEventListener: () => {} });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("history", () => {
  it("adds and reads entries (newest first)", () => {
    addHistoryEntry(makeMeta("a.png"));
    addHistoryEntry(makeMeta("b.png"));
    const entries = readHistory();
    expect(entries).toHaveLength(2);
    expect(entries[0].metadata.fileInfo.filename).toBe("b.png");
    expect(entries[1].metadata.fileInfo.filename).toBe("a.png");
  });

  it("caps at 20 entries", () => {
    for (let i = 0; i < 25; i++) addHistoryEntry(makeMeta(`f${i}.png`));
    const entries = readHistory();
    expect(entries).toHaveLength(20);
    expect(entries[0].metadata.fileInfo.filename).toBe("f24.png");
  });

  it("deletes a single entry by id", () => {
    const e1 = addHistoryEntry(makeMeta("a.png"));
    addHistoryEntry(makeMeta("b.png"));
    deleteHistoryEntry(e1.id);
    const entries = readHistory();
    expect(entries).toHaveLength(1);
    expect(entries[0].metadata.fileInfo.filename).toBe("b.png");
  });

  it("clears all entries", () => {
    addHistoryEntry(makeMeta("a.png"));
    addHistoryEntry(makeMeta("b.png"));
    clearHistory();
    expect(readHistory()).toEqual([]);
  });

  it("strips workflow blob to keep storage small", () => {
    const m = makeMeta("a.png", "comfyui");
    m.workflow = { nodes: [1, 2, 3] };
    addHistoryEntry(m);
    const e = readHistory()[0];
    expect(e.metadata.workflow).toBeUndefined();
  });
});
