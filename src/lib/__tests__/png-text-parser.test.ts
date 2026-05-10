import { describe, expect, it } from "vitest";
import { parsePngChunks } from "../png-text-parser";
import { buildPngWithText } from "./fixtures";

describe("parsePngChunks", () => {
  it("reads a single tEXt chunk", async () => {
    const buf = buildPngWithText([["parameters", "hello world"]], 128, 128);
    const { text, width, height } = await parsePngChunks(buf);
    expect(text.parameters).toBe("hello world");
    expect(width).toBe(128);
    expect(height).toBe(128);
  });

  it("reads multiple tEXt chunks", async () => {
    const buf = buildPngWithText([
      ["prompt", "{\"1\":{}}"],
      ["workflow", "{\"nodes\":[]}"],
    ]);
    const { text } = await parsePngChunks(buf);
    expect(text.prompt).toBe("{\"1\":{}}");
    expect(text.workflow).toBe("{\"nodes\":[]}");
  });

  it("rejects non-PNG buffers", async () => {
    const garbage = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]).buffer;
    await expect(parsePngChunks(garbage)).rejects.toThrow(/Not a PNG/);
  });

  it("preserves multiline values with embedded newlines", async () => {
    const value = "a tall blue cat\nNegative prompt: ugly\nSteps: 20, Sampler: Euler a, CFG scale: 7, Seed: 42, Size: 512x768, Model: foo";
    const buf = buildPngWithText([["parameters", value]]);
    const { text } = await parsePngChunks(buf);
    expect(text.parameters).toBe(value);
  });
});
