export const supportedLanguages = [
  "Yoruba",
  "Igbo",
  "Hausa",
  "Nigerian Pidgin",
] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

export function isSupportedLanguage(value: string): value is SupportedLanguage {
  return supportedLanguages.some((language) => language === value);
}
