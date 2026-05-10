import { describe, expect, it } from "vitest";
import { parseAutomatic1111 } from "../parsers/automatic1111";

describe("parseAutomatic1111", () => {
  it("parses a typical SD WebUI parameters string", () => {
    const raw = `masterpiece, 1girl, blue hair, <lora:detailEnhancer:0.8>
Negative prompt: lowres, bad anatomy
Steps: 28, Sampler: DPM++ 2M Karras, CFG scale: 7, Seed: 1234567890, Size: 512x768, Model hash: abc123, Model: realisticVision, Clip skip: 2, Denoising strength: 0.5`;
    const p = parseAutomatic1111(raw);
    expect(p.prompt).toContain("masterpiece");
    expect(p.negativePrompt).toBe("lowres, bad anatomy");
    expect(p.steps).toBe(28);
    expect(p.sampler).toBe("DPM++ 2M Karras");
    expect(p.cfgScale).toBe(7);
    expect(p.seed).toBe(1234567890);
    expect(p.width).toBe(512);
    expect(p.height).toBe(768);
    expect(p.modelHash).toBe("abc123");
    expect(p.model).toBe("realisticVision");
    expect(p.clipSkip).toBe(2);
    expect(p.denoisingStrength).toBe(0.5);
    expect(p.loras).toEqual([{ name: "detailEnhancer", weight: 0.8 }]);
  });

  it("handles missing negative prompt", () => {
    const raw = `cat\nSteps: 20, Sampler: Euler, CFG scale: 6, Seed: 1, Size: 256x256`;
    const p = parseAutomatic1111(raw);
    expect(p.prompt).toBe("cat");
    expect(p.negativePrompt).toBeUndefined();
    expect(p.steps).toBe(20);
  });

  it("preserves unknown fields in extras", () => {
    const raw = `dog\nSteps: 10, Sampler: Euler, CFG scale: 5, Seed: 7, Size: 64x64, FreshField: hello`;
    const p = parseAutomatic1111(raw);
    expect(p.extras?.FreshField).toBe("hello");
  });

  it("handles quoted values containing commas", () => {
    const raw = `bird\nSteps: 10, Sampler: Euler, CFG scale: 5, Seed: 7, Size: 64x64, Lora hashes: "a:b, c:d"`;
    const p = parseAutomatic1111(raw);
    expect(p.extras?.["Lora hashes"]).toBe("a:b, c:d");
  });
});
