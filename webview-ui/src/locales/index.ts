import { I18n, Locale } from "val-i18n";
import en from "./en.json"
import zhCN from "./zh-cn.json"

export const locales: Record<string, Locale> = {
  en: en,
  "zh-cn": zhCN,
};

export const createI18n = async (locale: string) => {
  return I18n.preload(locale, (lang) => locales[lang]);
};

