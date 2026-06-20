import { getLanguageName, normalizeLanguageList } from "./languageCatalog";

export type CountryRegion = "Africa" | "Europe" | "Asia" | "Middle East" | "Americas" | "Oceania" | "Other";

export type CountryCatalogEntry = {
  code: string;
  name: string;
  region: CountryRegion;
  primaryLanguages: string[];
  commonLocalLanguages: string[];
};

const countryCodes = "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW".split(" ");

const africa = new Set("AO BF BI BJ BW CD CF CG CI CM CV DJ DZ EG EH ER ET GA GH GM GN GQ GW KE KM LR LS LY MA MG ML MR MU MW MZ NA NE NG RE RW SC SD SH SL SN SO SS ST SZ TD TG TN TZ UG YT ZA ZM ZW".split(" "));
const europe = new Set("AD AL AT AX BA BE BG BY CH CY CZ DE DK EE ES FI FO FR GB GG GI GR HR HU IE IM IS IT JE LI LT LU LV MC MD ME MK MT NL NO PL PT RO RS RU SE SI SJ SK SM UA VA".split(" "));
const asia = new Set("AF AM AZ BD BT CN GE HK ID IN JP KG KH KP KR KZ LA LK MM MN MO MV MY NP PH PK SG TH TJ TL TM TW UZ VN".split(" "));
const middleEast = new Set("AE BH IL IQ IR JO KW LB OM PS QA SA SY TR YE".split(" "));
const americas = new Set("AG AI AR AW BB BL BM BO BQ BR BS BZ CA CL CO CR CU CW DM DO EC FK GD GF GL GP GT GY HN HT JM KN KY LC MF MQ MS MX NI PA PE PM PR PY SR SV SX TC TT US UY VC VE VG VI".split(" "));
const oceania = new Set("AS AU CC CK CX FJ FM GU HM IO KI MH MP NC NF NR NU NZ PF PG PN PW SB TK TO TV UM VU WF WS".split(" "));

const languageOverrides: Record<string, { primary: string[]; common: string[] }> = {
  NG: { primary: ["en", "pcm"], common: ["yo", "ig", "ha", "tiv", "idu", "efi", "ibb", "ijw", "urh", "iso", "bin", "esan", "nupe", "kan", "ful", "gwo", "jukun", "berom", "its", "igala", "ebira", "ana", "oro", "kal", "ogo", "ikw", "margi", "kilba", "bachama", "tangale", "bura", "chamba", "mumuye", "kuteb", "eggon", "mada"] },
  GH: { primary: ["en", "aka", "tw", "ee", "gaa"], common: ["ha"] },
  ZA: { primary: ["zu", "xh", "af", "en", "st", "tn"], common: ["nso", "ts", "ss", "ve"] },
  CN: { primary: ["zh"], common: ["yue", "ug", "bo", "mn"] },
  CA: { primary: ["en", "fr"], common: ["zh", "pa", "es", "ar", "tl", "hi", "pt"] },
  US: { primary: ["en"], common: ["es", "zh", "tl", "vi", "ar", "fr", "ko"] },
  GB: { primary: ["en"], common: ["cy", "ga", "pa", "ur", "pl"] },
  FR: { primary: ["fr"], common: ["ar", "ber", "pt", "es"] },
  DE: { primary: ["de"], common: ["tr", "ar", "pl", "ru"] },
  ES: { primary: ["es"], common: ["ca", "eu", "gl"] },
  BR: { primary: ["pt-br"], common: ["es", "gn"] },
  MX: { primary: ["es-mx"], common: ["en"] },
  KE: { primary: ["sw", "en"], common: ["kik", "luo", "kln", "mas"] },
  TZ: { primary: ["sw"], common: ["en"] },
  ET: { primary: ["am"], common: ["om", "ti", "so"] },
  RW: { primary: ["rw", "en", "fr"], common: ["sw"] },
  CD: { primary: ["fr"], common: ["ln", "kg", "sw", "lu"] },
  SN: { primary: ["fr", "wo"], common: ["ful"] },
  CI: { primary: ["fr"], common: ["dyu", "bm"] },
  ML: { primary: ["fr", "bm"], common: ["ful"] },
  IN: { primary: ["hi", "en"], common: ["bn", "te", "mr", "ta", "ur", "gu", "kn", "ml", "pa"] },
  PK: { primary: ["ur", "en"], common: ["pa", "ps"] },
  BD: { primary: ["bn"], common: ["en"] },
  JP: { primary: ["ja"], common: ["en"] },
  KR: { primary: ["ko"], common: ["en"] },
  ID: { primary: ["id"], common: ["en"] },
  MY: { primary: ["ms"], common: ["en", "zh", "ta"] },
  PH: { primary: ["tl", "en"], common: [] },
  SA: { primary: ["ar"], common: ["en", "ur"] },
  AE: { primary: ["ar"], common: ["en", "hi", "ur", "ml"] },
  IL: { primary: ["he", "ar"], common: ["en", "ru"] },
  TR: { primary: ["tr"], common: ["ku", "ar"] },
  AU: { primary: ["en"], common: ["zh", "ar", "vi", "hi"] },
  NZ: { primary: ["en"], common: ["mi", "sm"] },
};

const displayNames = new Intl.DisplayNames(["en"], { type: "region" });

export const countryCatalog: CountryCatalogEntry[] = countryCodes
  .map((code) => {
    const override = languageOverrides[code];
    return {
      code,
      name: displayNames.of(code) || code,
      region: getRegion(code),
      primaryLanguages: normalizeLanguageList(override?.primary ?? ["en"]),
      commonLocalLanguages: normalizeLanguageList(override?.common ?? []),
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

export function getCountryByCodeOrName(value: string) {
  const normalized = value.trim().toLowerCase();
  return countryCatalog.find(
    (country) => country.code.toLowerCase() === normalized || country.name.toLowerCase() === normalized,
  );
}

export function getRecommendedLanguageCodes(countryValue: string) {
  const country = getCountryByCodeOrName(countryValue);
  return country
    ? Array.from(new Set([...country.primaryLanguages, ...country.commonLocalLanguages]))
    : [];
}

export function getRecommendedLanguageNames(countryValue: string) {
  return getRecommendedLanguageCodes(countryValue).map(getLanguageName);
}

function getRegion(code: string): CountryRegion {
  if (africa.has(code)) return "Africa";
  if (middleEast.has(code)) return "Middle East";
  if (europe.has(code)) return "Europe";
  if (asia.has(code)) return "Asia";
  if (americas.has(code)) return "Americas";
  if (oceania.has(code)) return "Oceania";
  return "Other";
}
