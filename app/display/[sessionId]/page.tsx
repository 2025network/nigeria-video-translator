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
import { SmartDisplay } from "./SmartDisplay";

type DisplayPageProps = {
  params: Promise<{ sessionId: string }>;
  searchParams?: Promise<{ lang?: string; kiosk?: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: DisplayPageProps): Promise<Metadata> {
  const { sessionId } = await params;
  const session = await getPublicDisplaySession(sessionId);

  return session
    ? {
        title: `${session.title} Display`,
        description: `Smart Display translation for ${session.church.churchName}.`,
      }
    : { title: "Display Session Not Found" };
}

export default async function SmartDisplayPage({
  params,
  searchParams,
}: DisplayPageProps) {
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
  const initialMessages = await getPublicDisplayMessages(
    session.id,
    initialLanguageCode,
  );

  return (
    <SmartDisplay
      initialSession={{
        id: session.id,
        title: session.title,
        status: session.status,
        churchName: session.church.churchName,
        churchLogoUrl: session.church.logoUrl,
        branchName: session.branch?.name ?? null,
        updatedAt: session.updatedAt.toISOString(),
      }}
      initialLanguageCode={initialLanguageCode}
      initialMessages={initialMessages.map((message) => ({
        id: message.id,
        translatedText: message.translatedText,
        createdAt: message.createdAt.toISOString(),
      }))}
      kioskMode={query?.kiosk === "true"}
    />
  );
}
