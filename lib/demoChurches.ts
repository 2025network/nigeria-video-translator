export type ChurchStatus = "Active" | "Inactive";

export type DemoChurch = {
  id: string;
  churchName: string;
  slug: string;
  country: string;
  youtubeLiveUrl: string;
  defaultSpokenLanguage: string;
  enabledTranslationCountries: string[];
  enabledLanguages: string[];
  status: ChurchStatus;
};

export const nigeriaChurchLanguages = [
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
];

export const translationCountries = [
  "Nigeria",
  "Ghana",
  "United Kingdom",
  "United States",
  "Canada",
  "South Africa",
];

export const demoChurches: DemoChurch[] = [
  {
    id: "christ-embassy-lagos",
    churchName: "Christ Embassy Lagos",
    slug: "christ-embassy-lagos",
    country: "Nigeria",
    youtubeLiveUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
    defaultSpokenLanguage: "English",
    enabledTranslationCountries: ["Nigeria", "United Kingdom", "United States"],
    enabledLanguages: ["English", "Nigerian Pidgin", "Yoruba", "Igbo", "Hausa"],
    status: "Active",
  },
  {
    id: "rccg-abuja",
    churchName: "RCCG Abuja",
    slug: "rccg-abuja",
    country: "Nigeria",
    youtubeLiveUrl: "https://www.youtube.com/live/jfKfPfyJRdk",
    defaultSpokenLanguage: "English",
    enabledTranslationCountries: ["Nigeria", "Canada", "United Kingdom"],
    enabledLanguages: ["English", "Nigerian Pidgin", "Hausa", "Tiv", "Idoma"],
    status: "Active",
  },
  {
    id: "winners-chapel-port-harcourt",
    churchName: "Winners Chapel Port Harcourt",
    slug: "winners-chapel-port-harcourt",
    country: "Nigeria",
    youtubeLiveUrl: "https://youtu.be/21X5lGlDOfg",
    defaultSpokenLanguage: "English",
    enabledTranslationCountries: ["Nigeria", "Ghana", "South Africa"],
    enabledLanguages: ["English", "Nigerian Pidgin", "Igbo", "Edo", "Urhobo"],
    status: "Inactive",
  },
];

export function getChurchById(id: string) {
  return demoChurches.find((church) => church.id === id);
}

export function getChurchBySlug(slug: string) {
  return (
    demoChurches.find((church) => church.slug === slug) ??
    (slug === "grace-city" ? demoChurches[0] : undefined)
  );
}

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function getChurchEmbedUrl(slug: string) {
  return `${getSiteUrl()}/embed/${slug}/live`;
}

export function getChurchEmbedCode(slug: string) {
  return `<iframe src="${getChurchEmbedUrl(slug)}" width="100%" height="720" style="border:0;border-radius:16px;" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
}

export function getFloatingWidgetScriptCode(slug: string) {
  return `<script src="${getSiteUrl()}/widget.js" data-church="${slug}"></script>`;
}

export function getYouTubeEmbedUrl(url: string) {
  const videoId = getYouTubeVideoId(url);

  return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
}

function getYouTubeVideoId(url: string) {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtu.be")) {
      return parsedUrl.pathname.replace("/", "");
    }

    if (parsedUrl.pathname.includes("/embed/")) {
      return parsedUrl.pathname.split("/embed/")[1]?.split("/")[0] ?? "";
    }

    if (parsedUrl.pathname.includes("/live/")) {
      return parsedUrl.pathname.split("/live/")[1]?.split("/")[0] ?? "";
    }

    if (parsedUrl.pathname === "/live") {
      return parsedUrl.searchParams.get("v") ?? "";
    }

    return parsedUrl.searchParams.get("v") ?? "";
  } catch {
    return "";
  }
}

