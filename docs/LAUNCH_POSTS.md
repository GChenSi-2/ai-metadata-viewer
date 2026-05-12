# 发布文案(ready to paste)

> **Live**: <https://ai-metadata-viewer-theta.vercel.app>
> **GitHub**: <https://github.com/GChenSi-2/ai-metadata-viewer>

⚠️ **底线**:发帖**用你自己的账号、自己手按 Submit**。哪怕只改一个词、加一句口语,都比原样粘贴的可信度高 — Reddit 用户对"完美但平淡"的帖子敏感。我写的"reason"段我会标 `// EDITABLE`,你可以保留、改写、或整段替换成你自己的一句话。

---

## 1. r/StableDiffusion

**推荐标题**:
> I built a tiny 100% client-side viewer for AI image metadata (open source)

**Body**(直接粘贴):

```
Hey r/StableDiffusion,

I built a small web tool that reads the prompt / model / sampler / seed
/ LoRAs embedded in AI-generated images. Everything is parsed in your
browser — no upload, no server, no account.

Live: https://ai-metadata-viewer-theta.vercel.app
Source: https://github.com/GChenSi-2/ai-metadata-viewer

What it does:
- AUTOMATIC1111 / Forge: pulls the full parameters string, detects
  LoRAs and embeddings, copies any field with one click
- ComfyUI: parses the prompt graph, shows model/sampler/prompts, lets
  you download the executable workflow JSON
- NovelAI: reads Description + Comment chunks
- Midjourney: reads EXIF where available (which isn't always, see below)

What it doesn't do (yet):
- Most Midjourney exports strip metadata, so MJ support is limited to
  images downloaded from mj.run with the field intact
- Custom ComfyUI nodes with non-standard input names won't resolve —
  only the common ones (KSampler, CheckpointLoaderSimple, LoraLoader…)

// EDITABLE — replace with your real motivation in your own voice:
Why I made it: I kept running into "PNG info" sites that wanted me to
upload the file to inspect it, or worse, sign up. For something this
trivial (you can read the bytes locally in 50 lines of JS), that felt
backwards. So I wrote one that doesn't.

It's MIT-licensed, no tracking of file contents — only an anonymous
"image_parsed" event with the platform name so I can tell if anyone's
using it. Bug reports and sample images that break the parser are
genuinely the most useful thing you can send.

Cheers.
```

**附 GIF**:必须有。

---

## 2. r/comfyui

**推荐标题**:
> One-click workflow JSON extraction from any ComfyUI PNG (local, no upload)

**Body**(直接粘贴):

```
Drag a ComfyUI-generated PNG into the page, and you get:
- The executable prompt graph parsed into a flat summary (model,
  sampler, seed, positive/negative prompt, LoRAs)
- A one-click download of the original workflow JSON, ready to drop
  back into ComfyUI

Everything runs in your browser. The PNG never leaves your machine.

Live: https://ai-metadata-viewer-theta.vercel.app/en/comfyui-workflow-extractor
Source: https://github.com/GChenSi-2/ai-metadata-viewer

Caveats:
- It only knows the standard nodes (KSampler, CheckpointLoaderSimple,
  CLIPTextEncode, LoraLoader, EmptyLatentImage / EmptySD3LatentImage).
  Custom nodes won't have their inputs surfaced in the flat summary,
  but the workflow JSON download still works because that's just the
  raw chunk.
- If your image went through Discord / Twitter, the tEXt chunk is
  almost certainly stripped — true for any PNG info tool.

// EDITABLE — replace with your real motivation:
Why I made it: I had a workflow I actually liked and lost the canvas
state. The PNG still had it embedded, but every tool I tried either
displayed it as a raw JSON dump or wanted me to upload the file. I
wanted "drag in, get JSON out, done."

MIT, no analytics on file contents. PRs and issues welcome — if you've
got a custom-node workflow that doesn't parse cleanly, attaching the
PNG to an issue is the fastest way for me to fix it.
```

**附 GIF**:推荐拍 "拖图 → 点 Download workflow → 拖到 ComfyUI 画布" 的全流程。

---

## 3. Twitter / X(单贴版)

```
Tiny tool I made: drop any AI image, see the prompt, model, seed,
LoRAs — all parsed in your browser. No upload.

SD WebUI · ComfyUI · NovelAI · MJ
+ one-click ComfyUI workflow JSON download
Open source · MIT

https://ai-metadata-viewer-theta.vercel.app
```

**附 GIF**

---

## 3.b Twitter / X(Thread 版,如果你账号有粉丝)

```
1/ Built a no-upload viewer for AI image metadata over a couple weekends.
Drop a PNG, see the prompt / model / seed / sampler / LoRAs / ComfyUI
workflow. All client-side.

🔗 https://ai-metadata-viewer-theta.vercel.app

2/ Why this exists: most "PNG info" sites either upload your file or
just dump raw text. Wanted something that:
- never touches a server
- parses ComfyUI graphs into something readable
- lets you grab the workflow JSON back in one click

3/ Tech: pure JS PNG chunk parser, Next.js, Tailwind, deployed on
Vercel's free tier. Zero backend, zero database. MIT licensed.
🔗 https://github.com/GChenSi-2/ai-metadata-viewer

4/ Known gaps: most Midjourney exports strip metadata; ComfyUI custom
nodes with non-standard input names won't be surfaced in the flat
summary (but the workflow JSON download still works). Bug reports
welcome.
```

---

## 4. 发布执行清单(自己 5 分钟搞定)

按这个顺序做,前后大概 10-15 分钟:

1. **Reddit**(r/StableDiffusion)
   - 打开 reddit.com,登录
   - r/StableDiffusion → Create Post → 选 "Image & Video" 类型(让 GIF 当主图)
   - 标题:粘贴上面的标题
   - 上传 GIF
   - **正文是评论区第一条**(很多 sub 的图文帖正文要发在评论里),复制 Body 粘贴
   - 检查链接没断、看一眼预览、Submit
   - **接下来 30 分钟别关网页**——有评论立刻回(哪怕"thanks!")

2. **Reddit**(r/comfyui)— **等 r/StableDiffusion 帖发完至少 1 小时再发**,避免被 Reddit 反 spam 判为 cross-posting
   - 同样流程,标题 + body 用 r/comfyui 那份

3. **Twitter / X** — 可以和 Reddit 同一天发,但建议在 r/StableDiffusion 帖**发出来 4-6 小时后**再发 — 这样 Twitter 看到的人去 Reddit 帖里能看到已经有一些热度

---

## 5. 不要做的事(再强调一遍)

- ❌ **不要让任何 AI(包括我)替你按 submit** — Reddit / Twitter 反自动化检测会让你新账号或低 karma 账号秒爆,而且 mod 看到 "AI 帮我发了" 的痕迹会直接删帖
- ❌ 不要在 24 小时内同时在 3 个以上 sub 发完全相同的内容 — 自动 spam filter 会折叠
- ❌ 不要在帖里强调超过 2 次 "100% client-side" — 一次足够
- ❌ 不要在 civitai 评论里硬塞链接 — civitai 反作弊很严,容易直接 ban

## 6. 应该做的

- ✅ 发完盯 30 分钟,看到每条评论都回(哪怕一句 "thanks for the heads up")
- ✅ 有人指出 bug → 当场修 → 回 "fixed in [commit hash]" — Reddit 极吃这种互动
- ✅ 看到批评先点 upvote 再回复 — 显得 secure

---

## 7. 一周后回顾

进 PostHog → Activity 看:
- `image_parsed` UV(有多少人真用了)
- platform 分布(哪个 sub 的用户最多)
- `workflow_downloaded` 次数(对 r/comfyui 帖的真实回报指标)

记下这些数字,2 周后带去找策略 Claude。
