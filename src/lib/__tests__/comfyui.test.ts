import { describe, expect, it } from "vitest";
import { parseComfyUI } from "../parsers/comfyui";

describe("parseComfyUI", () => {
  it("extracts prompt/negative/sampler/model from a minimal graph", () => {
    const graph = {
      "1": { class_type: "CheckpointLoaderSimple", inputs: { ckpt_name: "sd_xl_base_1.0.safetensors" } },
      "2": { class_type: "CLIPTextEncode", inputs: { text: "a beautiful landscape" } },
      "3": { class_type: "CLIPTextEncode", inputs: { text: "blurry, low quality" } },
      "4": { class_type: "EmptyLatentImage", inputs: { width: 1024, height: 1024 } },
      "5": {
        class_type: "KSampler",
        inputs: {
          steps: 20,
          cfg: 7.5,
          seed: 42,
          sampler_name: "euler",
          scheduler: "normal",
          denoise: 1,
          positive: ["2", 0],
          negative: ["3", 0],
        },
      },
    };
    const { parsed } = parseComfyUI(JSON.stringify(graph));
    expect(parsed.prompt).toBe("a beautiful landscape");
    expect(parsed.negativePrompt).toBe("blurry, low quality");
    expect(parsed.steps).toBe(20);
    expect(parsed.cfgScale).toBe(7.5);
    expect(parsed.seed).toBe(42);
    expect(parsed.sampler).toBe("euler");
    expect(parsed.scheduler).toBe("normal");
    expect(parsed.model).toBe("sd_xl_base_1.0.safetensors");
    expect(parsed.width).toBe(1024);
    expect(parsed.height).toBe(1024);
  });

  it("handles malformed JSON gracefully", () => {
    const { parsed } = parseComfyUI("not json at all");
    expect(parsed.prompt).toBeUndefined();
  });

  it("collects loras", () => {
    const graph = {
      "1": { class_type: "LoraLoader", inputs: { lora_name: "stylize.safetensors", strength_model: 0.7 } },
    };
    const { parsed } = parseComfyUI(JSON.stringify(graph));
    expect(parsed.loras).toEqual([{ name: "stylize.safetensors", weight: 0.7 }]);
  });
});
