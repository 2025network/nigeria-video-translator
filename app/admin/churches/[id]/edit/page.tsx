import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getChurchById, toChurchView } from "@/lib/churchRepository";
import { AdminNav } from "../../../AdminNav";
import { updateChurchAction } from "../../actions";
import { ChurchForm } from "../../ChurchForm";

type EditChurchPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata = {
  title: "Edit Church",
};

export default async function EditChurchPage({ params }: EditChurchPageProps) {
  const { id } = await params;
  const church = await getChurchById(id);

  if (!church) {
    notFound();
  }

  const churchView = toChurchView(church);
  const updateWithId = updateChurchAction.bind(null, church.id);

  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="section-shell py-8">
        <AdminNav />
        <Link
          href={`/admin/churches/${church.id}`}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 hover:text-emerald-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to church
        </Link>
      </section>

      <section className="section-shell pb-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Edit church
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
            {church.churchName}
          </h1>
          <p className="mt-4 leading-7 text-emerald-50/72">
            Update church details, enabled languages, widget status, and embed configuration.
          </p>
        </div>

        <ChurchForm
          action={updateWithId}
          submitLabel="Update church"
          initialValues={churchView}
        />
      </section>
    </main>
  );
}
