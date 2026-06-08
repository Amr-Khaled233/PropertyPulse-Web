// i18n helpers — reads the active language from the UI store and resolves keys.

import { translations, type Lang, type TranslationKey } from './translations';
import { useUiStore } from '../store/uiStore';

export type { Lang, TranslationKey };

export function translate(lang: Lang, key: TranslationKey): string {
  return translations[lang][key] ?? translations.en[key] ?? key;
}

/** Hook returning `t(key)`, current language and a direction helper. */
export function useI18n() {
  const lang = useUiStore((s) => s.lang);
  const setLang = useUiStore((s) => s.setLang);
  const t = (key: TranslationKey) => translate(lang, key);
  return { t, lang, setLang, dir: lang === 'ar' ? 'rtl' : 'ltr' as const };
}
