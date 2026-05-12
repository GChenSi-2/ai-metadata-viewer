# AI Image Metadata Viewer

A small client-side web tool that reads the prompt, model, sampler, seed, LoRAs and ComfyUI workflow embedded in AI-generated images. Drop a PNG or JPEG made by Stable Diffusion (AUTOMATIC1111 / Forge), ComfyUI, NovelAI, or Midjourney — everything is parsed locally in your browser. No upload, no server, no account.

> **Live**: <https://ai-metadata-viewer-theta.vercel.app> &nbsp;·&nbsp; **Source**: this repo

## Why

Existing "PNG info" tools dump raw metadata as one wall of text. This one:

- Parses the PNG `tEXt` / `iTXt` / `zTXt` chunks and the AUTOMATIC1111 `parameters` string into structured fields
- Walks ComfyUI prompt graphs to surface model / sampler / prompts / LoRAs, with one-click workflow JSON download
- Keeps a local-only history (last 20 entries, no images stored)
- Works in three languages (EN / 中文 / 日本語) with `hreflang` and per-platform SEO landing pages
- Never uploads your image — the parser is pure JS, runs offline once the page is loaded

## Tech stack

- [Next.js 16](https://nextjs.org) App Router · React 19 · TypeScript
- Tailwind CSS 4
- [`exifr`](https://github.com/MikeKovarik/exifr) for JPEG EXIF; a custom PNG chunk parser ([`src/lib/png-text-parser.ts`](src/lib/png-text-parser.ts)) for PNG `tEXt` / `iTXt` / `zTXt`
- `react-dropzone` for drag-and-drop + clipboard paste
- Vercel Analytics + Speed Insights + PostHog for analytics (see [`docs/ANALYTICS.md`](docs/ANALYTICS.md))
- Vitest for unit tests
- pnpm

Zero backend. Deploys to Vercel's Hobby tier with no database, no edge function, no paid service.

## Project layout

```
src/
  app/
    [lang]/                       # i18n root segment (en / zh / ja)
      layout.tsx                  # html + body + analytics providers
      page.tsx                    # home (drop + parse)
      history/                    # local history page
      automatic1111-metadata-viewer/   # SEO landing pages
      comfyui-workflow-extractor/
      novelai-prompt-extractor/
      opengraph-image.tsx         # dynamic OG image
    sitemap.ts
    robots.ts
  components/                     # Dropzone, MetadataDisplay, HistoryList, Hero, TopBar, Toast …
  lib/
    png-text-parser.ts            # PNG chunk reader (no external deps)
    parsers/
      automatic1111.ts            # parses the "parameters" string
      comfyui.ts                  # walks the ComfyUI prompt graph
      novelai.ts                  # Description + Comment JSON
      midjourney.ts               # EXIF --flag parser
    extract-metadata.ts           # dispatches to the right parser
    history.ts                    # localStorage CRUD
    analytics.ts                  # typed PostHog wrapper (no-ops without env key)
    seo/
  i18n/
    config.ts
    dictionaries.ts
    messages/{en,zh,ja}.json
  proxy.ts                        # locale redirect (Next 16's renamed middleware)
docs/
  ANALYTICS.md
```

## Development

Requires Node 18+ and pnpm.

```bash
pnpm install
pnpm dev                # http://localhost:3000
pnpm test               # run vitest once
pnpm test:watch         # watch mode
pnpm build              # production build
pnpm start              # serve the production build
pnpm lint
```

Tests cover the four parsers and the localStorage history (24 tests total). PNG fixtures are synthesised on the fly — no binary blobs in the repo.

## Deployment

The project is wired for [Vercel](https://vercel.com). Import the repo, framework auto-detects as Next.js, click Deploy.

### Environment variables

| Name | Purpose | Required |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL used by sitemap / OG / hreflang. No trailing slash. | Recommended |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key | Optional (analytics) |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host (`https://us.i.posthog.com` or `https://eu.i.posthog.com`) | Optional (analytics) |

`NEXT_PUBLIC_*` vars are inlined at **build** time — change them in Vercel → redeploy without build cache.

Vercel Analytics and Speed Insights are enabled in the Vercel project dashboard (no env var needed).

## Privacy

The whole parsing pipeline runs in the browser; no image bytes ever leave the user's machine. Analytics events contain only:

- The detected platform (`automatic1111` / `comfyui` / `novelai` / `midjourney` / `unknown`)
- Boolean flags (has prompt, has workflow, …)
- Bucketed file sizes (`<100KB`, `100-500`, `500-2000`, `>2000`)

No prompt text, no filenames, no file contents are sent to PostHog or anywhere else. PostHog is configured with `persistence: 'memory'` (no cookies / localStorage), `autocapture: false`, `disable_session_recording: true`, and `respect_dnt: true`. See [`src/components/AnalyticsProvider.tsx`](src/components/AnalyticsProvider.tsx) and [`docs/ANALYTICS.md`](docs/ANALYTICS.md).

## Contributing

Issues and PRs welcome. If you've got a sample image that the current parsers handle poorly, attaching it to an issue is the most useful thing you can do.

## License

MIT — see [`LICENSE`](LICENSE).
