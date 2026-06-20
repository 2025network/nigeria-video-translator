export type LanguageRegion =
  | "Popular"
  | "Nigerian Languages"
  | "African Languages"
  | "European Languages"
  | "Asian Languages"
  | "Middle East"
  | "Americas"
  | "Oceania";

export type LanguageCatalogEntry = {
  code: string;
  name: string;
  region: LanguageRegion;
  nativeName?: string;
};

export const languageRegions: LanguageRegion[] = [
  "Popular",
  "Nigerian Languages",
  "African Languages",
  "European Languages",
  "Asian Languages",
  "Middle East",
  "Americas",
  "Oceania",
];

export const languageCatalog: LanguageCatalogEntry[] = [
  { code: "en", name: "English", region: "Popular", nativeName: "English" },
  { code: "fr", name: "French", region: "Popular", nativeName: "Français" },
  { code: "es", name: "Spanish", region: "Popular", nativeName: "Español" },
  { code: "pt", name: "Portuguese", region: "Popular", nativeName: "Português" },
  { code: "ar", name: "Arabic", region: "Popular", nativeName: "العربية" },
  { code: "sw", name: "Swahili", region: "Popular", nativeName: "Kiswahili" },
  { code: "yo", name: "Yoruba", region: "Nigerian Languages", nativeName: "Yorùbá" },
  { code: "ig", name: "Igbo", region: "Nigerian Languages", nativeName: "Igbo" },
  { code: "ha", name: "Hausa", region: "Nigerian Languages", nativeName: "Hausa" },
  { code: "pcm", name: "Nigerian Pidgin", region: "Nigerian Languages" },
  { code: "tiv", name: "Tiv", region: "Nigerian Languages" },
  { code: "idu", name: "Idoma", region: "Nigerian Languages" },
  { code: "bin", name: "Edo", region: "Nigerian Languages" },
  { code: "efi", name: "Efik", region: "Nigerian Languages" },
  { code: "ibb", name: "Ibibio", region: "Nigerian Languages" },
  { code: "urh", name: "Urhobo", region: "Nigerian Languages" },
  { code: "ijw", name: "Ijaw", region: "Nigerian Languages" },
  { code: "kan", name: "Kanuri", region: "Nigerian Languages" },
  { code: "ful", name: "Fulfulde", region: "Nigerian Languages" },
  { code: "nupe", name: "Nupe", region: "Nigerian Languages" },
  { code: "igala", name: "Igala", region: "Nigerian Languages" },
  { code: "gwo", name: "Gbagyi", region: "Nigerian Languages" },
  { code: "ann", name: "Obolo", region: "Nigerian Languages" },
  { code: "iso", name: "Isoko", region: "Nigerian Languages" },
  { code: "esan", name: "Esan", region: "Nigerian Languages" },
  { code: "jukun", name: "Jukun", region: "Nigerian Languages" },
  { code: "berom", name: "Berom", region: "Nigerian Languages" },
  { code: "its", name: "Itsekiri", region: "Nigerian Languages" },
  { code: "ebira", name: "Ebira", region: "Nigerian Languages" },
  { code: "ana", name: "Anaang / Annang", region: "Nigerian Languages" },
  { code: "oro", name: "Oron", region: "Nigerian Languages" },
  { code: "kal", name: "Kalabari", region: "Nigerian Languages" },
  { code: "ogo", name: "Ogoni", region: "Nigerian Languages" },
  { code: "bini", name: "Bini", region: "Nigerian Languages" },
  { code: "ikw", name: "Ikwere", region: "Nigerian Languages" },
  { code: "margi", name: "Margi", region: "Nigerian Languages" },
  { code: "kilba", name: "Kilba", region: "Nigerian Languages" },
  { code: "bachama", name: "Bachama", region: "Nigerian Languages" },
  { code: "tangale", name: "Tangale", region: "Nigerian Languages" },
  { code: "bura", name: "Bura", region: "Nigerian Languages" },
  { code: "chamba", name: "Chamba", region: "Nigerian Languages" },
  { code: "mumuye", name: "Mumuye", region: "Nigerian Languages" },
  { code: "kuteb", name: "Kuteb", region: "Nigerian Languages" },
  { code: "eggon", name: "Eggon", region: "Nigerian Languages" },
  { code: "mada", name: "Mada", region: "Nigerian Languages" },
  { code: "gwari", name: "Gwari / Gbagyi", region: "Nigerian Languages" },
  { code: "aka", name: "Akan", region: "African Languages" },
  { code: "tw", name: "Twi", region: "African Languages", nativeName: "Twi" },
  { code: "ee", name: "Ewe", region: "African Languages", nativeName: "Eʋegbe" },
  { code: "gaa", name: "Ga", region: "African Languages" },
  { code: "zu", name: "Zulu", region: "African Languages", nativeName: "isiZulu" },
  { code: "xh", name: "Xhosa", region: "African Languages", nativeName: "isiXhosa" },
  { code: "st", name: "Sotho", region: "African Languages", nativeName: "Sesotho" },
  { code: "tn", name: "Tswana", region: "African Languages", nativeName: "Setswana" },
  { code: "nso", name: "Northern Sotho", region: "African Languages" },
  { code: "ts", name: "Tsonga", region: "African Languages" },
  { code: "ss", name: "Swati", region: "African Languages" },
  { code: "ve", name: "Venda", region: "African Languages" },
  { code: "af", name: "Afrikaans", region: "African Languages" },
  { code: "am", name: "Amharic", region: "African Languages", nativeName: "አማርኛ" },
  { code: "om", name: "Oromo", region: "African Languages", nativeName: "Afaan Oromoo" },
  { code: "ti", name: "Tigrinya", region: "African Languages", nativeName: "ትግርኛ" },
  { code: "so", name: "Somali", region: "African Languages", nativeName: "Soomaali" },
  { code: "rw", name: "Kinyarwanda", region: "African Languages" },
  { code: "rn", name: "Kirundi", region: "African Languages" },
  { code: "ln", name: "Lingala", region: "African Languages" },
  { code: "kg", name: "Kongo", region: "African Languages" },
  { code: "lu", name: "Luba-Katanga", region: "African Languages" },
  { code: "mg", name: "Malagasy", region: "African Languages" },
  { code: "ny", name: "Chichewa", region: "African Languages" },
  { code: "sn", name: "Shona", region: "African Languages", nativeName: "chiShona" },
  { code: "nd", name: "Northern Ndebele", region: "African Languages" },
  { code: "bem", name: "Bemba", region: "African Languages" },
  { code: "loz", name: "Lozi", region: "African Languages" },
  { code: "kik", name: "Kikuyu", region: "African Languages", nativeName: "Gĩkũyũ" },
  { code: "luo", name: "Luo", region: "African Languages" },
  { code: "kln", name: "Kalenjin", region: "African Languages" },
  { code: "mas", name: "Maasai", region: "African Languages" },
  { code: "wo", name: "Wolof", region: "African Languages" },
  { code: "bm", name: "Bambara", region: "African Languages", nativeName: "Bamanankan" },
  { code: "dyu", name: "Dyula", region: "African Languages" },
  { code: "mos", name: "Mossi", region: "African Languages" },
  { code: "fon", name: "Fon", region: "African Languages" },
  { code: "kab", name: "Kabyle", region: "African Languages" },
  { code: "ber", name: "Tamazight", region: "African Languages" },
  { code: "de", name: "German", region: "European Languages", nativeName: "Deutsch" },
  { code: "it", name: "Italian", region: "European Languages", nativeName: "Italiano" },
  { code: "nl", name: "Dutch", region: "European Languages", nativeName: "Nederlands" },
  { code: "sv", name: "Swedish", region: "European Languages", nativeName: "Svenska" },
  { code: "da", name: "Danish", region: "European Languages", nativeName: "Dansk" },
  { code: "no", name: "Norwegian", region: "European Languages", nativeName: "Norsk" },
  { code: "fi", name: "Finnish", region: "European Languages", nativeName: "Suomi" },
  { code: "pl", name: "Polish", region: "European Languages", nativeName: "Polski" },
  { code: "cs", name: "Czech", region: "European Languages", nativeName: "Čeština" },
  { code: "sk", name: "Slovak", region: "European Languages" },
  { code: "hu", name: "Hungarian", region: "European Languages", nativeName: "Magyar" },
  { code: "ro", name: "Romanian", region: "European Languages", nativeName: "Română" },
  { code: "bg", name: "Bulgarian", region: "European Languages" },
  { code: "el", name: "Greek", region: "European Languages", nativeName: "Ελληνικά" },
  { code: "ru", name: "Russian", region: "European Languages", nativeName: "Русский" },
  { code: "uk", name: "Ukrainian", region: "European Languages", nativeName: "Українська" },
  { code: "tr", name: "Turkish", region: "European Languages", nativeName: "Türkçe" },
  { code: "ga", name: "Irish", region: "European Languages", nativeName: "Gaeilge" },
  { code: "cy", name: "Welsh", region: "European Languages", nativeName: "Cymraeg" },
  { code: "ca", name: "Catalan", region: "European Languages", nativeName: "Català" },
  { code: "eu", name: "Basque", region: "European Languages", nativeName: "Euskara" },
  { code: "gl", name: "Galician", region: "European Languages", nativeName: "Galego" },
  { code: "zh", name: "Chinese", region: "Asian Languages", nativeName: "中文" },
  { code: "yue", name: "Cantonese", region: "Asian Languages", nativeName: "粵語" },
  { code: "bo", name: "Tibetan", region: "Asian Languages", nativeName: "བོད་སྐད" },
  { code: "hi", name: "Hindi", region: "Asian Languages", nativeName: "हिन्दी" },
  { code: "bn", name: "Bengali", region: "Asian Languages", nativeName: "বাংলা" },
  { code: "ur", name: "Urdu", region: "Asian Languages", nativeName: "اردو" },
  { code: "pa", name: "Punjabi", region: "Asian Languages", nativeName: "ਪੰਜਾਬੀ" },
  { code: "ta", name: "Tamil", region: "Asian Languages", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", region: "Asian Languages" },
  { code: "ml", name: "Malayalam", region: "Asian Languages" },
  { code: "kn", name: "Kannada", region: "Asian Languages" },
  { code: "mr", name: "Marathi", region: "Asian Languages" },
  { code: "gu", name: "Gujarati", region: "Asian Languages" },
  { code: "ne", name: "Nepali", region: "Asian Languages", nativeName: "नेपाली" },
  { code: "si", name: "Sinhala", region: "Asian Languages" },
  { code: "my", name: "Burmese", region: "Asian Languages" },
  { code: "th", name: "Thai", region: "Asian Languages", nativeName: "ไทย" },
  { code: "lo", name: "Lao", region: "Asian Languages" },
  { code: "km", name: "Khmer", region: "Asian Languages" },
  { code: "vi", name: "Vietnamese", region: "Asian Languages", nativeName: "Tiếng Việt" },
  { code: "id", name: "Indonesian", region: "Asian Languages", nativeName: "Bahasa Indonesia" },
  { code: "ms", name: "Malay", region: "Asian Languages", nativeName: "Bahasa Melayu" },
  { code: "tl", name: "Filipino", region: "Asian Languages" },
  { code: "ja", name: "Japanese", region: "Asian Languages", nativeName: "日本語" },
  { code: "ko", name: "Korean", region: "Asian Languages", nativeName: "한국어" },
  { code: "fa", name: "Persian", region: "Middle East", nativeName: "فارسی" },
  { code: "he", name: "Hebrew", region: "Middle East", nativeName: "עברית" },
  { code: "ku", name: "Kurdish", region: "Middle East", nativeName: "Kurdî" },
  { code: "ps", name: "Pashto", region: "Middle East" },
  { code: "az", name: "Azerbaijani", region: "Middle East" },
  { code: "hy", name: "Armenian", region: "Middle East" },
  { code: "ka", name: "Georgian", region: "Middle East" },
  { code: "es-mx", name: "Mexican Spanish", region: "Americas", nativeName: "Español mexicano" },
  { code: "pt-br", name: "Brazilian Portuguese", region: "Americas", nativeName: "Português brasileiro" },
  { code: "ht", name: "Haitian Creole", region: "Americas", nativeName: "Kreyòl ayisyen" },
  { code: "qu", name: "Quechua", region: "Americas" },
  { code: "ay", name: "Aymara", region: "Americas" },
  { code: "gn", name: "Guarani", region: "Americas", nativeName: "Avañe'ẽ" },
  { code: "nv", name: "Navajo", region: "Americas" },
  { code: "iu", name: "Inuktitut", region: "Americas" },
  { code: "mi", name: "Māori", region: "Oceania", nativeName: "Te reo Māori" },
  { code: "sm", name: "Samoan", region: "Oceania", nativeName: "Gagana Samoa" },
];

export const popularLanguageCodes = ["en", "yo", "ig", "ha", "pcm", "fr", "es", "pt", "ar", "sw"];

export const catalogCountries = languageRegions;
export const catalogLanguageCodes = languageCatalog.map((language) => language.code);
export const catalogLanguages = languageCatalog.map((language) => language.name);
export const languageCount = languageCatalog.length;

export function getLanguagesForCountries(regions: string[]) {
  return languageCatalog
    .filter((language) => regions.includes(language.region))
    .map((language) => language.name);
}

export function getLanguageByCode(code: string) {
  return languageCatalog.find((language) => language.code === code);
}

export function getLanguageByName(name: string) {
  const normalized = normalizeLanguageKey(name);
  return languageCatalog.find((language) => normalizeLanguageKey(language.name) === normalized);
}

export function normalizeLanguageValue(value: string) {
  const trimmed = value.trim();
  return getLanguageByCode(trimmed)?.code ?? getLanguageByName(trimmed)?.code ?? trimmed;
}

export function getLanguageName(value: string) {
  const trimmed = value.trim();
  return getLanguageByCode(trimmed)?.name ?? getLanguageByName(trimmed)?.name ?? trimmed;
}

export function getLanguageLabel(value: string) {
  const language = getLanguageByCode(value) ?? getLanguageByName(value);
  if (!language) return value;
  return language.nativeName && language.nativeName !== language.name
    ? `${language.name} (${language.nativeName})`
    : language.name;
}

export function getLanguagesByRegion(region: LanguageRegion) {
  return languageCatalog.filter((language) => language.region === region);
}

export function normalizeLanguageList(values: string[]) {
  return Array.from(new Set(values.map(normalizeLanguageValue).filter(Boolean)));
}

export function languageNamesFromValues(values: string[]) {
  return Array.from(new Set(values.map(getLanguageName).filter(Boolean)));
}

function normalizeLanguageKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}
