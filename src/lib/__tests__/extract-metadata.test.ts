import { describe, expect, it } from "vitest";
import { extractMetadata } from "../extract-metadata";
import { buildPngWithText, bufferToFile } from "./fixtures";

describe("extractMetadata", () => {
  it("identifies an a1111 PNG end-to-end", async () => {
    const params = `cat\nNegative prompt: dog\nSteps: 20, Sampler: Euler, CFG scale: 7, Seed: 1, Size: 512x512, Model: foo`;
    const buf = buildPngWithText([["parameters", params]], 512, 512);
    const file = bufferToFile(buf, "a.png");
    const m = await extractMetadata(file);
    expect(m.platform).toBe("automatic1111");
    expect(m.parsed.prompt).toBe("cat");
    expect(m.parsed.negativePrompt).toBe("dog");
    expect(m.fileInfo.dimensions).toEqual({ width: 512, height: 512 });
  });

  it("identifies a ComfyUI PNG end-to-end", async () => {
    const graph = {
      "1": { class_type: "CheckpointLoaderSimple", inputs: { ckpt_name: "x.safetensors" } },
      "2": { class_type: "CLIPTextEncode", inputs: { text: "hello" } },
      "3": { class_type: "KSampler", inputs: { steps: 10, cfg: 5, seed: 1, sampler_name: "euler", positive: ["2", 0] } },
    };
    const buf = buildPngWithText([["prompt", JSON.stringify(graph)]]);
    const file = bufferToFile(buf, "b.png");
    const m = await extractMetadata(file);
    expect(m.platform).toBe("comfyui");
    expect(m.parsed.prompt).toBe("hello");
    expect(m.parsed.steps).toBe(10);
  });

  it("identifies NovelAI PNG end-to-end", async () => {
    const buf = buildPngWithText([
      ["Software", "NovelAI"],
      ["Description", "a forest at sunset"],
      ["Comment", JSON.stringify({ steps: 28, scale: 5, seed: 9, sampler: "k_euler", uc: "blurry" })],
    ]);
    const file = bufferToFile(buf, "c.png");
    const m = await extractMetadata(file);
    expect(m.platform).toBe("novelai");
    expect(m.parsed.prompt).toBe("a forest at sunset");
    expect(m.parsed.negativePrompt).toBe("blurry");
    expect(m.parsed.sampler).toBe("k_euler");
  });

  it("returns unknown for PNG with no AI metadata", async () => {
    const buf = buildPngWithText([]);
    const file = bufferToFile(buf, "blank.png");
    const m = await extractMetadata(file);
    expect(m.platform).toBe("unknown");
  });
});
