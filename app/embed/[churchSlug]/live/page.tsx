import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { getChurchBySlug, toChurchView } from "@/lib/churchRepository";
import { LiveTranslationWidget } from "./LiveTranslationWidget";

type EmbedLivePageProps = {
  params: Promise<{
    churchSlug: string;
  }>;
};

export const metadata = {
  title: "Live Translation Widget",
};

export default async function EmbedLivePage({ params }: EmbedLivePageProps) {
  const { churchSlug } = await params;
  const church = await getChurchBySlug(churchSlug);

  if (!church) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#06110d] p-4 text-white">
        <section className="max-w-md rounded-lg border border-emerald-300/16 bg-white/[0.055] p-6 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-emerald-300" />
          <h1 className="mt-4 text-2xl font-semibold">Widget not found</h1>
          <p className="mt-3 text-sm leading-6 text-emerald-50/68">
            This church slug does not exist yet. Add a church in the admin workspace or open one of the seeded church widgets.
          </p>
          <Link
            href="/admin/churches"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-400 px-4 text-sm font-semibold text-[#04120c]"
          >
            Open admin
          </Link>
        </section>
      </main>
    );
  }

  return <LiveTranslationWidget church={toChurchView(church)} />;
}

