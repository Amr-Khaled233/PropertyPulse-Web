// Compact theme (dark/light) + language (EN/AR) switcher.

import { useUiStore } from '../../../store/uiStore';
import { useI18n } from '../../../i18n';

export function ThemeLangToggle() {
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const { lang, setLang } = useI18n();

  return (
    <div className="center-row" style={{ gap: 6 }}>
      <button
        className="icon-btn"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      >
        {theme === 'dark' ? '☀' : '☾'}
      </button>
      <button
        className="icon-btn"
        onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
        aria-label="Toggle language"
        title={lang === 'ar' ? 'English' : 'العربية'}
        style={{ fontSize: '0.78rem', fontWeight: 700 }}
      >
        {lang === 'ar' ? 'EN' : 'ع'}
      </button>
    </div>
  );
}
