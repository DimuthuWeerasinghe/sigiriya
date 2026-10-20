'use client';

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { translations } from '@/content/translations';

export type Language = 'en' | 'si' | 'ta';
const storageKey = 'dps-language';
const listeners = new Set<() => void>();
let memoryLanguage: Language = 'en';
const validLanguage = (value: string | null): value is Language => value === 'en' || value === 'si' || value === 'ta';

function getLanguage(): Language {
  try {
    const stored = localStorage.getItem(storageKey);
    return validLanguage(stored) ? stored : memoryLanguage;
  } catch {
    return memoryLanguage;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

function changeLanguage(language: Language) {
  memoryLanguage = language;
  try { localStorage.setItem(storageKey, language); } catch { /* Keep the choice for this session when storage is unavailable. */ }
  listeners.forEach((listener) => listener());
}

export function translate(text: string, language: Language): string {
  if (language === 'en') return text;
  const key = text.replace(/\s+/g, ' ').trim();
  const entry = translations[key];
  if (!entry) return text;
  return text.replace(/\S[\s\S]*\S|\S/, entry[language === 'si' ? 0 : 1]);
}

const LanguageContext = createContext({ language: 'en' as Language, setLanguage: changeLanguage, t: (text: string) => text });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(subscribe, getLanguage, () => 'en' as Language);
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  const value = useMemo(() => ({ language, setLanguage: changeLanguage, t: (text: string) => translate(text, language) }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() { return useContext(LanguageContext); }

export function Text({ children }: { children: string | null | undefined }) {
  const { t } = useLanguage();
  return children == null ? null : t(children);
}

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div className="language-switcher" role="group" aria-label={t('Language selection')}>
      {([['si', 'සිංහල'], ['ta', 'தமிழ்'], ['en', 'EN']] as const).map(([code, label]) => (
        <button key={code} type="button" lang={code} aria-pressed={language === code} onClick={() => setLanguage(code)}>{label}</button>
      ))}
    </div>
  );
}

export function TranslatedTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { t } = useLanguage();
  return <textarea {...props} placeholder={props.placeholder ? t(props.placeholder) : undefined} />;
}
