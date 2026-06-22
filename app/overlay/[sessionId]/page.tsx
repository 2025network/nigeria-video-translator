import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getLanguageByCode,
  normalizeLanguageValue,
} from "@/lib/languageCatalog";
import { parseSessionLanguages } from "@/lib/sermonSessionRepository";
import {
  getPublicDisplayMessages,
  getPublicDisplaySession,
} from "@/lib/smartDisplayRepository";
import {
  LivestreamOverlay,
  type OverlayPosition,
  type OverlaySize,
  type OverlayTheme,
} from "./LivestreamOverlay";

type OverlayPageProps = {
  params: Promise<{ sessionId: string }>;
  searchParams?: Promise<{
    lang?: string;
    clean?: string;
    position?: string;
    size?: string;
    theme?: string;
  }>;
};

const positions: OverlayPosition[] = ["top", "middle", "bottom"];
const sizes: OverlaySize[] = ["small", "medium", "large", "xlarge"];
const themes: OverlayTheme[] = ["light", "dark", "outline"];

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: OverlayPageProps): Promise<Metadata> {
  const { sessionId } = await params;
  const session = await getPublicDisplaySession(sessionId);

  return session
    ? {
        title: `${session.title} Livestream Overlay`,
        description: `Live translated subtitles from ${session.church.churchName}.`,
        robots: { index: false, follow: false },
      }
    : { title: "Overlay Session Not Found" };
}

export default async function LivestreamOverlayPage({
  params,
  searchParams,
}: OverlayPageProps) {
  const [{ sessionId }, query] = await Promise.all([params, searchParams]);
  const session = await getPublicDisplaySession(sessionId);

  if (!session) {
    notFound();
  }

  const sessionLanguages = parseSessionLanguages(session.listenerLanguages);
  const requestedCode = normalizeLanguageValue(query?.lang || "");
  const fallbackCode = normalizeLanguageValue(sessionLanguages[0] || "en");
  const initialLanguageCode = getLanguageByCode(requestedCode)
    ? requestedCode
    : getLanguageByCode(fallbackCode)
      ? fallbackCode
      : "en";
  const position = readOption(query?.position, positions, "bottom");
  const size = readOption(query?.size, sizes, "large");
  const theme = readOption(query?.theme, themes, "outline");
  const initialMessages = await getPublicDisplayMessages(
    session.id,
    initialLanguageCode,
    1,
  );

  return (
    <>
      <style>{"html, body { background: transparent !important; }"}</style>
      <LivestreamOverlay
        initialSession={{
          id: session.id,
          title: session.title,
          status: session.status,
          churchName: session.church.churchName,
          branchName: session.branch?.name ?? null,
        }}
        initialLanguageCode={initialLanguageCode}
        initialMessage={initialMessages.at(-1)
          ? {
              id: initialMessages.at(-1)!.id,
              translatedText: initialMessages.at(-1)!.translatedText,
              createdAt: initialMessages.at(-1)!.createdAt.toISOString(),
            }
          : null}
        cleanMode={query?.clean === "true"}
        initialPosition={position}
        initialSize={size}
        initialTheme={theme}
      />
    </>
  );
}

function readOption<T extends string>(
  value: string | undefined,
  options: T[],
  fallback: T,
) {
  return options.includes(value as T) ? (value as T) : fallback;
}
