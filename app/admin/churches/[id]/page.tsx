import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Edit3, ExternalLink } from "lucide-react";
import { getChurchById, toChurchView } from "@/lib/churchRepository";
import { getChurchEmbedCode, getChurchEmbedUrl } from "@/lib/demoChurches";
import { AdminNav } from "../../AdminNav";
import { deleteChurchAction } from "../actions";
import { CopyEmbedButton } from "../CopyEmbedButton";

type ChurchDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata = {
  title: "Church Detail",
};

export default async function ChurchDetailPage({ params }: ChurchDetailPageProps) {
  const { id } = await params;
  const church = await getChurchById(id);

  if (!church) {
    notFound();
  }

  const churchView = toChurchView(church);
  const embedCode = getChurchEmbedCode(church.slug);
  const embedUrl = getChurchEmbedUrl(church.slug);
  const deleteWithId = deleteChurchAction.bind(null, church.id);

  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="section-shell py-8">
        <AdminNav />
        <Link
          href="/admin/churches"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 hover:text-emerald-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to churches
        </Link>
      </section>

      <section className="section-shell pb-16">
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Church detail
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
              {church.churchName}
            </h1>
            <p className="mt-4 text-emerald-50/72">
              Embed slug: <span className="font-semibold text-emerald-100">{church.slug}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/churches/${church.id}/edit`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-white/8 px-4 text-sm font-semibold text-white hover:bg-white/12"
            >
              <Edit3 className="h-4 w-4" />
              Edit church
            </Link>
            <Link
              href={embedUrl}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-white/8 px-4 text-sm font-semibold text-white hover:bg-white/12"
            >
              <ExternalLink className="h-4 w-4" />
              Open widget
            </Link>
            <CopyEmbedButton embedCode={embedCode} />
            <form action={deleteWithId}>
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-red-300/24 px-4 text-sm font-semibold text-red-100 hover:bg-red-950/24"
              >
                Delete church
              </button>
            </form>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="grid h-fit gap-4 rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
            <h2 className="text-2xl font-semibold">Church information</h2>
            <Info label="Country" value={church.country} />
            <Info label="Status" value={church.status} />
            <Info label="Default spoken language" value={church.defaultSpokenLanguage} />
            <Info label="YouTube Live URL" value={church.youtubeLiveUrl} />
            <Info label="Enabled translation countries" value={churchView.enabledTranslationCountries.join(", ")} />
            <Info label="Active languages" value={churchView.enabledLanguages.join(", ")} />
          </section>

          <section className="grid gap-4 rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-semibold">Generated iframe embed code</h2>
              <CopyEmbedButton embedCode={embedCode} />
            </div>
            <pre className="max-h-52 overflow-auto rounded-md border border-emerald-300/14 bg-[#07140f] p-4 text-xs leading-6 text-emerald-50/78">
              {embedCode}
            </pre>
          </section>
        </div>

        <section className="mt-6 rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Live widget preview</h2>
              <p className="mt-2 text-sm text-emerald-50/68">
                This is the same compact experience a church can embed on its own site.
              </p>
            </div>
            <Link href={embedUrl} className="text-sm font-semibold text-emerald-200 hover:underline">
              {embedUrl}
            </Link>
          </div>
          <iframe
            src={embedUrl}
            title={`${church.churchName} live translation widget preview`}
            className="h-[720px] w-full rounded-lg border border-emerald-300/16 bg-[#07140f]"
          />
        </section>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-emerald-300/14 bg-[#07140f] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300">
        {label}
      </p>
      <p className="mt-2 break-words text-sm leading-6 text-emerald-50/78">{value}</p>
    </div>
  );
}
