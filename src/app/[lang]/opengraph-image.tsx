import { ImageResponse } from "next/og";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export const runtime = "edge";
export const alt = "AI Image Metadata Viewer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: l } = await params;
  const lang = isLocale(l) ? l : "en";
  const dict = await getDictionary(lang);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%)",
          color: "white",
          padding: "80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "system-ui",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: 28, opacity: 0.7 }}>
          <span style={{ fontSize: 40 }}>🔒</span>
          <span>100% client-side</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ fontSize: 80, fontWeight: 700, lineHeight: 1.1 }}>{dict.site.title}</div>
          <div style={{ fontSize: 32, opacity: 0.8, maxWidth: 980, lineHeight: 1.4 }}>
            {dict.site.tagline}
          </div>
        </div>
        <div style={{ display: "flex", gap: "32px", fontSize: 24, opacity: 0.6 }}>
          <span>SD WebUI</span>
          <span>·</span>
          <span>ComfyUI</span>
          <span>·</span>
          <span>NovelAI</span>
          <span>·</span>
          <span>Midjourney</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
