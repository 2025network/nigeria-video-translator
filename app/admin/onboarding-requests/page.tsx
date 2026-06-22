import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Inbox, Mail, Phone } from "lucide-react";
import { CopyEmbedButton } from "../churches/CopyEmbedButton";
import { AdminNav } from "../AdminNav";
import {
  getOnboardingRequests,
  onboardingStatuses,
} from "@/lib/onboardingRepository";

type OnboardingRequestsPageProps = {
  searchParams?: Promise<{
    approved?: string;
    approveError?: string;
    statusError?: string;
    statusUpdated?: string;
    churchId?: string;
    churchName?: string;
    email?: string;
    password?: string;
    emailSent?: string;
    emailWarning?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Onboarding Requests",
};

export const dynamic = "force-dynamic";

export default async function OnboardingRequestsPage({
  searchParams,
}: OnboardingRequestsPageProps) {
  const params = await searchParams;
  const requests = await getOnboardingRequests();
  const approvalError = params?.approveError;
  const statusError = params?.statusError;
  const statusUpdated = params?.statusUpdated === "1";
  const churchLoginUrl = getChurchLoginUrl();
  const createdChurch =
    params?.approved === "1" && params.churchId && params.email
      ? {
          churchId: params.churchId,
          churchName: params.churchName ?? "Created church",
          email: params.email,
          password: params.password,
          loginUrl: churchLoginUrl,
          emailSent: params.emailSent === "1",
          emailWarning: params.emailWarning,
        }
      : null;
  const credentialsText = createdChurch?.password
    ? [
        "SermonBridge church login credentials",
        `Church: ${createdChurch.churchName}`,
        `Login URL: ${createdChurch.loginUrl}`,
        `Email: ${createdChurch.email}`,
        `Temporary password: ${createdChurch.password}`,
      ].join("\n")
    : "";

  return (
    <main className="min-h-screen bg-[#06110d] py-10 text-white">
      <div className="section-shell">
        <AdminNav />

        <section className="mt-8 rounded-lg border border-emerald-300/16 bg-white/[0.045] p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
                Church onboarding
              </p>
              <h1 className="mt-2 text-3xl font-semibold">
                Onboarding requests
              </h1>
              <p className="mt-3 max-w-2xl leading-7 text-emerald-50/70">
                Review churches that requested full SermonBridge platform
                access. Update the status as conversations move forward.
              </p>
            </div>
            <Link
              href="/church-onboarding"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-emerald-300/20 px-4 text-sm font-semibold text-emerald-50 transition hover:bg-white/8"
            >
              View public form
            </Link>
          </div>

          {createdChurch ? (
            <div className="mt-6 rounded-lg border border-emerald-300/24 bg-emerald-300/10 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-400 text-[#04120c]">
                      <CheckCircle2 className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-300">
                        Church created successfully
                      </p>
                      <h2 className="mt-1 text-2xl font-semibold">
                        {createdChurch.churchName}
                      </h2>
                    </div>
                  </div>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-emerald-50/70">
                    {createdChurch.emailSent
                      ? "Login details and the temporary password were emailed to the church."
                      : "The church account was created, but email delivery needs attention."}
                  </p>
                  {createdChurch.emailWarning ? (
                    <p className="mt-3 rounded-md border border-amber-300/28 bg-amber-300/10 p-3 text-sm font-semibold text-amber-50">
                      Email was not delivered ({createdChurch.emailWarning}). The temporary password is shown below once so the admin can contact the church safely.
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  {createdChurch.password ? (
                    <CopyEmbedButton
                      embedCode={credentialsText}
                      label="Copy credentials"
                      copiedLabel="Credentials copied"
                    />
                  ) : null}
                  <Link
                    href="/admin/onboarding-requests"
                    className="inline-flex min-h-10 items-center justify-center rounded-md border border-emerald-300/26 px-4 text-sm font-semibold text-emerald-100 transition hover:bg-white/8"
                  >
                    Back to onboarding requests
                  </Link>
                  <Link
                    href={`/admin/churches/${createdChurch.churchId}`}
                    className="inline-flex min-h-10 items-center justify-center rounded-md bg-emerald-400 px-4 text-sm font-semibold text-[#04120c] transition hover:bg-emerald-300"
                  >
                    View church
                  </Link>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <Credential label="Church name" value={createdChurch.churchName} />
                <Credential label="Church login email" value={createdChurch.email} />
                {createdChurch.password ? (
                  <Credential
                    label="Generated temporary password"
                    value={createdChurch.password}
                  />
                ) : null}
                <Credential label="Church login URL" value={createdChurch.loginUrl} />
                <Credential
                  label="Email delivery"
                  value={createdChurch.emailSent ? "Sent" : "Needs attention"}
                />
              </div>
            </div>
          ) : null}

          {approvalError ? (
            <div className="mt-6 rounded-md border border-amber-300/30 bg-amber-300/10 p-4 text-sm font-semibold text-amber-50">
              {approvalError}
            </div>
          ) : null}

          {statusError ? (
            <div className="mt-6 rounded-md border border-amber-300/30 bg-amber-300/10 p-4 text-sm font-semibold text-amber-50">
              {statusError}
            </div>
          ) : null}

          {statusUpdated ? (
            <div className="mt-6 rounded-md border border-emerald-300/24 bg-emerald-300/10 p-4 text-sm font-semibold text-emerald-50">
              Request status updated.
            </div>
          ) : null}

          {requests.length === 0 ? (
            <div className="mt-8 rounded-lg border border-dashed border-emerald-300/24 bg-[#07140f] p-10 text-center">
              <Inbox className="mx-auto h-10 w-10 text-emerald-300" />
              <h2 className="mt-4 text-xl font-semibold">No requests yet</h2>
              <p className="mt-2 text-emerald-50/68">
                New church onboarding form submissions will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-4">
              {requests.map((request) => (
                <article
                  key={request.id}
                  className="rounded-lg border border-emerald-300/14 bg-[#07140f] p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-semibold">
                          {request.churchName}
                        </h2>
                        <StatusBadge status={request.status} />
                      </div>
                      <p className="mt-2 text-sm text-emerald-50/64">
                        {request.city}, {request.country} · Submitted{" "}
                        {request.createdAt.toLocaleDateString()}
                      </p>
                    </div>

                    <form
                      action={`/admin/onboarding-requests/${request.id}/status`}
                      method="post"
                      className="flex flex-wrap gap-2"
                    >
                      <select
                        name="status"
                        defaultValue={request.status}
                        className="h-11 rounded-md border border-emerald-300/18 bg-[#06150f] px-3 text-sm font-semibold text-white outline-none focus:border-emerald-300"
                      >
                        {onboardingStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-400 px-4 text-sm font-semibold text-[#04120c] transition hover:bg-emerald-300"
                      >
                        Update
                      </button>
                    </form>
                  </div>

                  {request.status === "NEW" || request.status === "CONTACTED" ? (
                    <form
                      action={`/admin/onboarding-requests/${request.id}/approve`}
                      method="post"
                      className="mt-4"
                    >
                      <button
                        type="submit"
                        className="inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-400 px-4 text-sm font-semibold text-[#04120c] transition hover:bg-emerald-300"
                      >
                        Approve & Create Church
                      </button>
                    </form>
                  ) : null}

                  <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <InfoCard label="Contact" value={request.contactName} />
                    <InfoCard
                      label="Email"
                      value={request.email}
                      icon={<Mail className="h-4 w-4" />}
                    />
                    <InfoCard
                      label="Phone"
                      value={request.phone}
                      icon={<Phone className="h-4 w-4" />}
                    />
                    <InfoCard label="Location" value={`${request.city}, ${request.country}`} />
                    <InfoCard
                      label="Website or livestream"
                      value={request.websiteUrl || "Not provided"}
                    />
                  </div>

                  {request.message ? (
                    <div className="mt-4 rounded-md border border-emerald-300/12 bg-white/[0.035] p-4">
                      <p className="text-sm font-semibold text-emerald-300">
                        Message
                      </p>
                      <p className="mt-2 whitespace-pre-wrap leading-7 text-emerald-50/76">
                        {request.message}
                      </p>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Credential({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-emerald-300/16 bg-[#07140f] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
        {label}
      </p>
      <p className="mt-2 break-words font-mono text-sm text-white">{value}</p>
    </div>
  );
}

function getChurchLoginUrl() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");

  return siteUrl ? `${siteUrl}/church/login` : "/church/login";
}

function InfoCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-emerald-300/12 bg-white/[0.035] p-4">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
        {icon}
        {label}
      </p>
      <p className="mt-2 break-words font-semibold text-emerald-50">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "APPROVED"
      ? "bg-emerald-400 text-[#04120c]"
      : status === "REJECTED"
        ? "bg-red-400/18 text-red-100"
        : status === "CONTACTED"
          ? "bg-sky-400/18 text-sky-100"
          : "bg-amber-300/18 text-amber-100";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${tone}`}>
      {status}
    </span>
  );
}
