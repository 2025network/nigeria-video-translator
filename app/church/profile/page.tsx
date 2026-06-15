import type { Metadata } from "next";
import {
  Building2,
  Camera,
  CheckCircle2,
  Globe2,
  ImageIcon,
  MapPin,
  Phone,
  Share2,
  UserRound,
  Video,
} from "lucide-react";
import { getCurrentChurchView } from "@/lib/currentChurch";
import { ChurchNav } from "../ChurchNav";
import { updateChurchProfileAction } from "./actions";

type ChurchProfilePageProps = {
  searchParams?: Promise<{
    saved?: string;
    error?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Church Profile",
};

export default async function ChurchProfilePage({
  searchParams,
}: ChurchProfilePageProps) {
  const [church, params] = await Promise.all([getCurrentChurchView(), searchParams]);
  const saved = params?.saved === "1";
  const missing = params?.error === "missing";

  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="section-shell py-8">
        <ChurchNav />
      </section>

      <section className="section-shell pb-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Church profile
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
            Manage public church details
          </h1>
          <p className="mt-4 leading-7 text-emerald-50/72">
            Keep your SermonBridge profile ready for members who open your live
            translation widget from your website, WordPress page, or app.
          </p>
        </div>

        {saved ? (
          <div className="mb-6 rounded-lg border border-emerald-300/24 bg-emerald-300/10 p-4 text-sm font-semibold text-emerald-50">
            Profile saved successfully.
          </div>
        ) : null}

        {missing ? (
          <div className="mb-6 rounded-lg border border-amber-300/30 bg-amber-300/10 p-4 text-sm font-semibold text-amber-50">
            Church name, country, and city are required.
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <form
            action={updateChurchProfileAction}
            className="grid gap-5 rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5"
          >
            <section className="grid gap-4">
              <SectionHeading
                icon={<Building2 className="h-5 w-5" />}
                title="Core details"
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Church name" name="churchName" defaultValue={church.churchName} required />
                <Field label="Pastor name" name="pastorName" defaultValue={church.pastorName ?? ""} />
                <Field label="Phone number" name="phone" defaultValue={church.phone ?? ""} type="tel" />
                <Field label="Website URL" name="websiteUrl" defaultValue={church.websiteUrl ?? ""} type="url" />
              </div>
              <label className="grid gap-2 text-sm font-semibold text-emerald-100">
                Description
                <textarea
                  name="description"
                  defaultValue={church.description ?? ""}
                  rows={5}
                  className="min-h-32 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 py-3 text-base font-normal text-white outline-none transition placeholder:text-emerald-50/35 focus:border-emerald-300"
                  placeholder="A short introduction for your church profile."
                />
              </label>
            </section>

            <section className="grid gap-4">
              <SectionHeading icon={<ImageIcon className="h-5 w-5" />} title="Media" />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Church logo URL" name="logoUrl" defaultValue={church.logoUrl ?? ""} type="url" />
                <Field label="Banner image URL" name="bannerUrl" defaultValue={church.bannerUrl ?? ""} type="url" />
              </div>
            </section>

            <section className="grid gap-4">
              <SectionHeading icon={<Globe2 className="h-5 w-5" />} title="Social links" />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Facebook URL" name="facebookUrl" defaultValue={church.facebookUrl ?? ""} type="url" />
                <Field label="YouTube URL" name="youtubeUrl" defaultValue={church.youtubeUrl ?? ""} type="url" />
                <Field label="Instagram URL" name="instagramUrl" defaultValue={church.instagramUrl ?? ""} type="url" />
              </div>
            </section>

            <section className="grid gap-4">
              <SectionHeading icon={<MapPin className="h-5 w-5" />} title="Location" />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Country" name="country" defaultValue={church.country} required />
                <Field label="City" name="city" defaultValue={church.city ?? ""} required />
              </div>
              <Field label="Address" name="address" defaultValue={church.address ?? ""} />
            </section>

            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-emerald-400 px-5 font-semibold text-[#04120c] transition hover:bg-emerald-300"
            >
              Save profile
            </button>
          </form>

          <aside className="grid h-fit gap-5">
            <section className="overflow-hidden rounded-lg border border-emerald-300/16 bg-white/[0.045]">
              <div
                className="h-44 bg-cover bg-center"
                style={{
                  backgroundImage: church.bannerUrl
                    ? `url(${church.bannerUrl})`
                    : "linear-gradient(135deg, rgba(52,211,153,0.34), rgba(6,17,13,1))",
                }}
              />
              <div className="p-5">
                <div className="-mt-14 flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-emerald-300/24 bg-[#07140f]">
                  {church.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={church.logoUrl}
                      alt={`${church.churchName} logo`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Building2 className="h-9 w-9 text-emerald-300" />
                  )}
                </div>
                <h2 className="mt-5 text-2xl font-semibold">{church.churchName}</h2>
                <p className="mt-2 text-sm leading-6 text-emerald-50/68">
                  {church.description || "Add a short description so members recognize your church profile."}
                </p>
              </div>
            </section>

            <section className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
              <h2 className="text-2xl font-semibold">Profile information</h2>
              <div className="mt-5 grid gap-3">
                <Info icon={<UserRound className="h-4 w-4" />} label="Pastor" value={church.pastorName} />
                <Info icon={<Phone className="h-4 w-4" />} label="Phone" value={church.phone} />
                <Info icon={<MapPin className="h-4 w-4" />} label="Location" value={[church.address, church.city, church.country].filter(Boolean).join(", ")} />
                <Info icon={<Globe2 className="h-4 w-4" />} label="Website" value={church.websiteUrl} />
                <Info icon={<Share2 className="h-4 w-4" />} label="Facebook" value={church.facebookUrl} />
                <Info icon={<Video className="h-4 w-4" />} label="YouTube" value={church.youtubeUrl} />
                <Info icon={<Camera className="h-4 w-4" />} label="Instagram" value={church.instagramUrl} />
              </div>
            </section>

            <section className="rounded-lg border border-emerald-300/16 bg-emerald-300/10 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 text-emerald-300" />
                <p className="text-sm leading-6 text-emerald-50/78">
                  All languages are available by default. Churches can later
                  enable or highlight preferred listener languages from the
                  language page.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-emerald-300">
      {icon}
      <h2 className="text-lg font-semibold text-emerald-50">{title}</h2>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-emerald-100">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="min-h-12 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 text-base font-normal text-white outline-none transition placeholder:text-emerald-50/35 focus:border-emerald-300"
      />
    </label>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-md border border-emerald-300/12 bg-[#07140f] p-4">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300">
        {icon}
        {label}
      </p>
      <p className="mt-2 break-words text-sm leading-6 text-emerald-50/78">
        {value || "Not added yet"}
      </p>
    </div>
  );
}
