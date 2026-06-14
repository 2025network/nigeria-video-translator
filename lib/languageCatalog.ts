export type LanguageCatalogCountry = {
  country: string;
  languages: string[];
};

export const languageCatalog: LanguageCatalogCountry[] = [
  {
    country: "Nigeria",
    languages: [
      "English",
      "Nigerian Pidgin",
      "Yoruba",
      "Igbo",
      "Hausa",
      "Tiv",
      "Idoma",
      "Edo",
      "Efik",
      "Ibibio",
      "Urhobo",
    ],
  },
  {
    country: "Ghana",
    languages: ["English", "Twi", "Ewe", "Ga"],
  },
  {
    country: "South Africa",
    languages: ["English", "Zulu", "Xhosa", "Afrikaans", "Sotho"],
  },
  {
    country: "Kenya",
    languages: ["English", "Swahili", "Kikuyu", "Luo", "Kalenjin"],
  },
  {
    country: "Global",
    languages: [
      "English",
      "French",
      "Spanish",
      "Portuguese",
      "Arabic",
      "Chinese",
      "Hindi",
      "German",
      "Italian",
    ],
  },
];

export const catalogCountries = languageCatalog.map((item) => item.country);

export const catalogLanguages = Array.from(
  new Set(languageCatalog.flatMap((item) => item.languages)),
);

export function getLanguagesForCountries(countries: string[]) {
  return Array.from(
    new Set(
      languageCatalog
        .filter((item) => countries.includes(item.country))
        .flatMap((item) => item.languages),
    ),
  );
}

