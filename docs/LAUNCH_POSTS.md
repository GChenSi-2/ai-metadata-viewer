# 发布文案草稿(你在此基础上改)

⚠️ **底线**:Reddit 用户对营销文案很敏感,**第一人称、真诚、有缺点**永远比"产品介绍"管用。我写的版本会偏稳,你应该:

- 加入一句你**为什么**做这个的真诚理由(不是公司画饼那种)
- 主动说一个**已知缺陷**(MJ 现在大多数图没 metadata、custom node 不支持等)——Reddit 反感"完美产品"调性
- 用第一人称("I built / I made"),不要"We"
- **不要**贴所有平台同一份文案,会被识别成 spammer

---

## 1. r/StableDiffusion

**Title**(选一个,Reddit 标题决定 80% 点击):
- `I built a tiny 100% client-side viewer for AI image metadata (open source)`
- `Drop a PNG, see the prompt — local-only viewer for SD/ComfyUI/NovelAI/MJ metadata`
- `Made a no-upload PNG info reader because I got tired of "are they reading my prompts?"`

**Body**(草稿,自己改):

```
Hey r/StableDiffusion,

I built a small web tool that reads the prompt / model / sampler / seed
/ LoRAs embedded in AI-generated images. Everything is parsed in your
browser — no upload, no server, no account.

Live: https://YOUR-VERCEL-URL.vercel.app
Source: https://github.com/GChenSi-2/ai-metadata-viewer

What it does:
- AUTOMATIC1111 / Forge: pulls the full parameters string, detects LoRAs
  and embeddings, copies any field with one click
- ComfyUI: parses the prompt graph, shows model/sampler/prompts, lets
  you download the executable workflow JSON
- NovelAI: reads Description + Comment chunks
- Midjourney: reads EXIF where available (which… isn't always, see below)

What it doesn't do (yet):
- Most Midjourney exports strip metadata, so MJ support is limited to
  images downloaded from mj.run with the field intact
- Custom ComfyUI nodes with non-standard input names won't resolve —
  only the common ones (KSampler, CheckpointLoaderSimple, LoraLoader…)

Why I made it: [写一句你的真实原因 — 比如 "I wanted to share my
generations on Discord and was tired of pasting metadata as text" /
"I didn't trust 'free' SaaS sites with my full prompt history"]

It's MIT licensed, no tracking of file contents (only an anonymous
"image_parsed" event with the platform name so I can see if anyone is
using it). Bug reports / sample images that break the parser are
genuinely useful — opening an issue is the fastest way to get a fix.

Cheers.
```

**注意**:
- 给一张 **GIF / 截图**——拖图 → 出 prompt → 点 Copy 的三秒流程。不放图的"我做了个工具"帖子 Reddit 基本不点
- 推荐在 weekday 美东时间 9-11am 或 6-8pm 发(美区流量峰值)
- 发完盯前 30 分钟,有评论就回——前 30 分钟的互动决定能不能上 hot

---

## 2. r/comfyui

**Title**(focus on workflow,这是 r/comfyui 用户最关心的):
- `One-click workflow JSON extraction from any ComfyUI PNG (local, no upload)`
- `I made a small tool to drag a ComfyUI image and grab the workflow back`

**Body**:

```
Drag a ComfyUI-generated PNG into the page, and you get:
- The executable prompt graph parsed into a flat summary (model,
  sampler, seed, positive/negative prompt, LoRAs)
- A one-click download of the original workflow JSON, ready to
  drop back into ComfyUI

Everything runs in your browser. The PNG never leaves your machine.

Live: https://YOUR-VERCEL-URL.vercel.app/en/comfyui-workflow-extractor
Source: https://github.com/GChenSi-2/ai-metadata-viewer

Caveats:
- It only knows the standard nodes (KSampler, CheckpointLoaderSimple,
  CLIPTextEncode, LoraLoader, EmptyLatentImage / EmptySD3LatentImage).
  Custom nodes won't have their inputs surfaced in the summary, but the
  workflow JSON download still works because that's just the raw chunk.
- If your image went through Discord / Twitter, the tEXt chunk is
  almost certainly stripped — this is true for any PNG info tool.

[你的真实理由,例如 "I kept losing the workflow when I refactored my
node setup and wanted a quick way to grab it back from an old output"]

MIT, no analytics on file contents. PRs / issues welcome — if you've
got a custom-node workflow that doesn't parse cleanly, attaching the
PNG to an issue is the most helpful thing.
```

---

## 3. Twitter / X

**单贴版**(280 字符以内,把最强卖点摆首):

```
Tiny tool I made: drop any AI image, see the prompt, model, seed,
LoRAs — all parsed in your browser. No upload.

SD WebUI · ComfyUI · NovelAI · MJ
+ one-click ComfyUI workflow JSON download
Open source · MIT

https://YOUR-VERCEL-URL.vercel.app
```

**Thread 版**(如果你账号有粉丝):

```
1/ Built a no-upload viewer for AI image metadata over a couple
weekends. Drop a PNG, see the prompt / model / seed / sampler /
LoRAs / ComfyUI workflow. All client-side.

🔗 https://YOUR-VERCEL-URL.vercel.app

2/ Why this exists: most "PNG info" sites either upload your file
or just dump raw text. Wanted something that:
- never touches a server
- parses ComfyUI graphs into something readable
- lets you grab the workflow JSON back in one click

3/ Tech: pure JS PNG chunk parser, Next.js, Tailwind, deployed on
Vercel's free tier. Zero backend, zero database. Code is MIT:
🔗 https://github.com/GChenSi-2/ai-metadata-viewer

4/ Known gaps: most Midjourney exports strip metadata; ComfyUI
custom nodes with non-standard input names won't be surfaced in
the flat summary (but the workflow JSON download still works).
Bug reports welcome.
```

**附图**:
- 单贴:一张展示结果区的截图(prompt + 参数表 + ComfyUI workflow 折叠区)
- Thread:每条都配图最好。第 1 条放 GIF,后面截图

---

## 4. 通用建议

### 不要做的
- 不要在多个 sub 复制粘贴**完全相同**的标题和正文 — Reddit 反 spam 系统会折叠
- 不要在 civitai 评论里硬塞链接 — civitai 反作弊很严,可能直接 ban
- 不要 1 周后再来"bump"自己的帖子 — 看起来很 desperate
- 不要在你贴里大喊"100% client-side"超过 2 次 — 一次说够了

### 推荐做的
- 提前在 Reddit / Twitter 维持一个**有真实 karma 的账号**(<10 karma 的新号发帖容易被自动隐藏)
- 发完 12 小时内回复每条评论,哪怕是负面的
- 如果有人指出 bug,**当场修**并回复"fixed in [commit hash]" — 这种互动 Reddit 很吃
- 截图截得清楚一点(retina / 高清,深色模式版本最好)

---

## 5. 一周后做什么

- 在 PostHog Activity 里看 `image_parsed` 事件:有多少 UV、来源分布、哪个 platform 占比最高
- 把 GitHub stars / issues 状态记一笔(后面找策略 Claude 时要用)
- **不要再发新帖**——同一个工具每个圈子发一次就够,2-3 个月再有大更新时再发

---

## 模板替换清单(发之前别忘了)

- [ ] `https://YOUR-VERCEL-URL.vercel.app` → 你真实的 vercel 地址
- [ ] `[你的真实理由]` → 一两句真心话
- [ ] 你的名字 / 自称(如果想用)
- [ ] 截图 / GIF 录好了
