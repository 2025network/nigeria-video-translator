import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { getBranchByChurchAndSlug } from "@/lib/branchRepository";
import { toChurchView } from "@/lib/churchRepository";
import { LiveTranslationWidget } from "../../live/LiveTranslationWidget";

type BranchEmbedLivePageProps = {
  params: Promise<{
    churchSlug: string;
    branchSlug: string;
  }>;
};

export const metadata = {
  title: "Branch Live Translation Widget",
};

export default async function BranchEmbedLivePage({ params }: BranchEmbedLivePageProps) {
  const { churchSlug, branchSlug } = await params;
  const branch = await getBranchByChurchAndSlug(churchSlug, branchSlug);

  if (!branch || branch.disabledAt) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#06110d] p-4 text-white">
        <section className="max-w-md rounded-lg border border-emerald-300/16 bg-white/[0.055] p-6 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-emerald-300" />
          <h1 className="mt-4 text-2xl font-semibold">Branch widget not available</h1>
          <p className="mt-3 text-sm leading-6 text-emerald-50/68">
            This branch live translation widget does not exist or has been disabled.
          </p>
          <Link
            href={`/embed/${churchSlug}/live`}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-400 px-4 text-sm font-semibold text-[#04120c]"
          >
            Open main church widget
          </Link>
        </section>
      </main>
    );
  }

  const churchView = toChurchView(branch.church);

  return (
    <LiveTranslationWidget
      church={{
        ...churchView,
        churchName: `${branch.name} · ${churchView.churchName}`,
      }}
      widgetContext={{
        branchSlug: branch.slug,
      }}
    />
  );
}
