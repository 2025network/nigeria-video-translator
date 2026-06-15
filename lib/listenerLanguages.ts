import {
  catalogLanguageCodes,
  languageCatalog,
  languageNamesFromValues,
  normalizeLanguageList,
} from "./languageCatalog";

export const defaultListenerLanguageCodes = ["yo", "ig", "ha", "pcm"] as const;
export const defaultListenerLanguages = languageNamesFromValues([...defaultListenerLanguageCodes]);
export const listenerLanguageOptions = languageCatalog.map((language) => language.name);
export type ListenerLanguage = string;

export function serializeListenerLanguages(languages: string[]) {
  const filtered = normalizeLanguageList(languages).filter(isListenerLanguage);

  return (filtered.length ? filtered : [...defaultListenerLanguageCodes]).join(",");
}

export function parseListenerLanguages(value?: string | null) {
  const parsed = (value ?? "")
    .split(",")
    .map((language) => language.trim())
    .filter(isListenerLanguage);

  return languageNamesFromValues(parsed.length ? parsed : [...defaultListenerLanguageCodes]);
}

export function isListenerLanguage(value: string): value is ListenerLanguage {
  return catalogLanguageCodes.includes(value) || listenerLanguageOptions.includes(value);
}
