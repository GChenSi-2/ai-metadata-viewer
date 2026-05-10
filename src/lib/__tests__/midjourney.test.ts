import { describe, expect, it } from "vitest";
import { isMidjourney, parseMidjourney } from "../parsers/midjourney";

describe("parseMidjourney", () => {
  it("detects MJ-style strings", () => {
    expect(isMidjourney("a cat --ar 16:9 --v 6.1 Job ID: 123e4567-e89b-12d3-a456-426614174000")).toBe(true);
    expect(isMidjourney("just a normal sentence")).toBe(false);
  });

  it("extracts prompt, ar, version, seed", () => {
    const text = "majestic mountain at dawn --ar 16:9 --v 6.1 --seed 42 Job ID: deadbeef-dead-beef-dead-beefdeadbeef";
    const p = parseMidjourney(text);
    expect(p.prompt).toBe("majestic mountain at dawn");
    expect(p.extras?.aspectRatio).toBe("16:9");
    expect(p.extras?.version).toBe("6.1");
    expect(p.seed).toBe(42);
    expect(p.extras?.jobId).toBe("deadbeef-dead-beef-dead-beefdeadbeef");
  });

  it("handles --no for negative prompt", () => {
    const p = parseMidjourney("a portrait --no glasses --v 6");
    expect(p.negativePrompt).toBe("glasses");
  });
});
