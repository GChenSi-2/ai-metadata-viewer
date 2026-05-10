# 流量与产品分析配置

本项目用两套互补的分析,**都默认无 cookie、不记录敏感数据**,与 "100% client-side" 的隐私调性一致。

| 工具 | 看什么 | 价格 |
|---|---|---|
| **Vercel Analytics** | 流量 / 来源 / 设备 / 地理 | Hobby 100k pageview/月 免费 |
| **Vercel Speed Insights** | LCP / CLS / INP / TTFB(Web Vitals) | Hobby 免费(采样) |
| **PostHog** | 用户行为事件(谁拖了图、复制了什么、看了历史) | Cloud 免费 1M 事件/月 |

---

## 1. 环境变量

在 Vercel → 项目 → **Settings → Environment Variables** 添加:

| Name | Example value | Environments |
|---|---|---|
| `NEXT_PUBLIC_POSTHOG_KEY` | `phc_xxxxxxxxxxxxxxx` | ✅ Production ✅ Preview ⬜ Development |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://us.i.posthog.com`(或 `https://eu.i.posthog.com`)| ✅ Production ✅ Preview ⬜ Development |

> **Development 不勾**——本地开发不要污染线上事件数据。
>
> **重要**:`NEXT_PUBLIC_*` 在 **build 时**被内联到 JS bundle 中。修改 env var 后**必须 Redeploy**,且 **不要勾 "Use existing Build Cache"**,否则不生效。

Vercel Analytics 和 Speed Insights **不需要环境变量**——在 Vercel 项目页顶栏点 `Analytics` / `Speed Insights` 标签里的 **Enable** 即可。

---

## 2. PostHog 隐私配置

代码中已硬编码以下隐私设置(见 [`src/components/AnalyticsProvider.tsx`](../src/components/AnalyticsProvider.tsx)):

| 设置 | 值 | 作用 |
|---|---|---|
| `persistence` | `memory` | 不写 cookie、不写 localStorage,刷新即匿名 |
| `autocapture` | `false` | 不自动抓所有点击 / 表单输入 |
| `disable_session_recording` | `true` | 不录屏 |
| `respect_dnt` | `true` | 浏览器开 Do Not Track 时不上报 |
| `capture_pageview` | `false` | 改为手动捕获,避免重复 |
| `sanitize_properties` | 自定义 | 从 `$current_url` 剥离 query string,防泄漏 |

PostHog dashboard 端也建议自检:
- Project Settings → **Recordings** = OFF
- Project Settings → **Autocapture** = OFF

---

## 3. 事件清单

全部定义在 [`src/lib/analytics.ts`](../src/lib/analytics.ts) 的 `EventProps` 类型里。**事件 payload 只包含枚举值、布尔、分桶数字,绝不发送 prompt 文本 / 文件名 / 文件内容**。

| 事件 | 触发时机 | 关键属性 |
|---|---|---|
| `$pageview` | 路由变化 | `$current_url`(已剥 query) |
| `image_parsed` | 解析完一张图(成功或 unknown 都发) | `platform`, `has_prompt`, `has_negative`, `has_workflow`, `has_loras`, `file_type`, `file_size_kb_bucket` |
| `prompt_copied` | 主按钮 "复制 Prompt" 点击成功 / 整段 prompt 块复制 | `platform` |
| `field_copied` | 参数行 hover 复制按钮点击成功 | `field`(`sampler`/`seed`/`model`...), `platform` |
| `workflow_downloaded` | ComfyUI workflow JSON 下载按钮 | `platform` |
| `raw_metadata_opened` | 用户展开 "原始 metadata" 折叠区 | `platform` |
| `history_opened` | 进入 `/history` 页或组件挂载 | `entry_count` |
| `history_entry_loaded` | 在历史列表里展开某条 | `platform` |

属性约定:
- `platform`:`automatic1111` / `comfyui` / `novelai` / `midjourney` / `invokeai` / `fooocus` / `unknown`
- `file_size_kb_bucket`:`<100` / `100-500` / `500-2000` / `>2000`(分桶,不发原值)
- `field`:稳定的英文 key(`model_hash` 而非本地化标签 "模型 hash")

---

## 4. 验证是否生效

### Vercel 端

部署完成后打开站点,DevTools → Network 过滤 `_vercel`:
- 应看到 `/_vercel/insights/view` 之类请求,状态 200

### PostHog 端

DevTools → Network 过滤 `posthog`:
- 应看到 `decide?...` 和 `e?...` 等请求,状态 200
- 拖一张图进去,应该多出 1-2 个新请求(对应 `image_parsed` 事件)

PostHog dashboard:
- 左侧栏 **Activity**(或 **Events → Live Events**)→ 5-10 秒内能看到事件流入

---

## 5. 常见问题

| 症状 | 原因 / 解法 |
|---|---|
| Bundle 里搜不到 `phc_` 前缀 | env var 没生效——确认已 Redeploy 且**未勾 Build Cache** |
| Network 里没有 posthog 请求 | 浏览器装了 AdBlock(uBlock / Brave Shields 默认拦 PostHog),换个浏览器或开无痕模式验证 |
| 请求 status 是 `(blocked:other)` | 同上,AdBlock 拦截 |
| Vercel Analytics 看不到数据 | 项目页 Analytics 标签里点了 **Enable** 没?光装 `@vercel/analytics` 包不够 |
| host 写错 | US 区 key 配 EU host 不通(反之亦然),换 host 重试 |
| PostHog dashboard 是空的但 Network 有请求 | 数据有,只是默认页 Insights 是空白,去 **Activity** 看原始事件流 |
| 本地 dev 不发送事件 | **这是预期**——env var 没勾 Development,代码自动 no-op |

---

## 6. 加新事件的步骤

1. 在 [`src/lib/analytics.ts`](../src/lib/analytics.ts) 的 `EventProps` 类型里加新条目:
   ```ts
   new_event_name: { someProp: string; anotherProp: number };
   ```
2. 在触发处:
   ```ts
   import { track } from "@/lib/analytics";
   track("new_event_name", { someProp: "x", anotherProp: 1 });
   ```
3. 推送 → Vercel 自动部署 → 事件自动开始流入

TypeScript 会强制 event 名和 props 匹配,**写错事件名编译就过不去**——这是 typed wrapper 的好处,避免 PostHog 上长期有"枯死"的事件名拼写错误。

---

## 7. 2 周后该回答什么问题

数据攒到一定量后,这些问题可以从 PostHog Insights 直接出图回答,用来决策 v2:

| 问题 | 怎么查 |
|---|---|
| 解析成功率 | `image_parsed` 中 `platform != unknown` 占比 |
| 哪个平台用户最多 | `image_parsed` group by `platform` |
| 用户来了之后会复制 prompt 吗 | `prompt_copied` UV / `image_parsed` UV |
| ComfyUI workflow 下载值得做吗 | `workflow_downloaded` 数 |
| 历史功能用得多吗 | `history_opened` UV / DAU |
| 哪个 landing 页转化高 | landing 路由的 PV(Vercel)+ 后续 `image_parsed` 比 |

---

## 8. 相关文件

- [`src/lib/analytics.ts`](../src/lib/analytics.ts) — 类型化 `track()` 包装、no-op 安全防御
- [`src/components/AnalyticsProvider.tsx`](../src/components/AnalyticsProvider.tsx) — PostHog 初始化 + 手动 pageview
- [`src/app/[lang]/layout.tsx`](../src/app/[lang]/layout.tsx) — 挂载 `<VercelAnalytics />` `<SpeedInsights />` `<AnalyticsProvider />`
