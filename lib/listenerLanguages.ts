export const defaultListenerLanguages = [
  "Yoruba",
  "Igbo",
  "Hausa",
  "Nigerian Pidgin",
] as const;

export const listenerLanguageOptions = [
  ...defaultListenerLanguages,
  "French",
  "Spanish",
] as const;

export type ListenerLanguage = (typeof listenerLanguageOptions)[number];

export function serializeListenerLanguages(languages: string[]) {
  const filtered = languages.filter(isListenerLanguage);

  return (filtered.length ? filtered : [...defaultListenerLanguages]).join(",");
}

export function parseListenerLanguages(value?: string | null) {
  const parsed = (value ?? "")
    .split(",")
    .map((language) => language.trim())
    .filter(isListenerLanguage);

  return Array.from(new Set(parsed.length ? parsed : [...defaultListenerLanguages]));
}

export function isListenerLanguage(value: string): value is ListenerLanguage {
  return listenerLanguageOptions.includes(value as ListenerLanguage);
}
