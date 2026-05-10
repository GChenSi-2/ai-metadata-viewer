import "server-only";
import type { Locale } from "./config";
import en from "./messages/en.json";

export type Dictionary = typeof en;

const loaders: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./messages/en.json").then((m) => m.default as Dictionary),
  zh: () => import("./messages/zh.json").then((m) => m.default as Dictionary),
  ja: () => import("./messages/ja.json").then((m) => m.default as Dictionary),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return loaders[locale]();
}
