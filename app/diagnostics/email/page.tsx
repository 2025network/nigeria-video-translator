import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MailCheck, Send, XCircle } from "lucide-react";
import { AdminNav } from "@/app/admin/AdminNav";
import { requireAdminSession } from "@/lib/auth";
import { getEmailDiagnostics } from "@/lib/emailService";

type EmailDiagnosticsPageProps = {
  searchParams?: Promise<{
    sent?: string;
    error?: string;
    code?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Email Diagnostics",
};

export const dynamic = "force-dynamic";

export default async function EmailDiagnosticsPage({
  searchParams,
}: EmailDiagnosticsPageProps) {
  await requireAdminSession();
  const params = await searchParams;
  const diagnostics = getEmailDiagnostics();

  return (
    <main className="min-h-screen bg-[#06110d] py-10 text-white">
      <div className="section-shell">
        <AdminNav />

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-emerald-400 text-[#04120c]">
              <MailCheck className="h-6 w-6" />
            </div>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Email diagnostics
            </p>
            <h1 className="mt-2 text-3xl font-semibold">SMTP delivery status</h1>
            <p className="mt-3 leading-7 text-emerald-50/70">
              Review the non-secret mail configuration and send a real test message before relying on account emails.
            </p>

            <div className="mt-6 grid gap-3">
              <DiagnosticItem label="SMTP configured" value={diagnostics.configured ? "Yes" : "No"} ok={diagnostics.configured} />
              <DiagnosticItem label="From name" value={diagnostics.fromName} ok={Boolean(diagnostics.fromName)} />
              <DiagnosticItem label="From email" value={diagnostics.fromEmail} ok={diagnostics.configured} />
              {!diagnostics.configured ? (
                <div className="rounded-md border border-amber-300/24 bg-amber-300/10 p-4 text-sm leading-6 text-amber-50">
                  Missing configuration: {diagnostics.missing.join(", ") || "Unknown"}. SMTP passwords are never displayed.
                </div>
              ) : null}
            </div>
          </div>

          <section className="h-fit rounded-lg border border-emerald-300/16 bg-white/[0.045] p-6">
            <h2 className="text-2xl font-semibold">Send test email</h2>
            <p className="mt-2 text-sm leading-6 text-emerald-50/68">
              This sends one real message through the configured SMTP server.
            </p>

            {params?.sent === "1" ? (
              <p className="mt-5 rounded-md border border-emerald-300/24 bg-emerald-300/10 p-4 text-sm font-semibold text-emerald-50">
                Test email sent successfully.
              </p>
            ) : null}
            {params?.error ? (
              <p className="mt-5 rounded-md border border-amber-300/28 bg-amber-300/10 p-4 text-sm font-semibold text-amber-50">
                Test email was not sent. {formatError(params.error, params.code)}
              </p>
            ) : null}

            <form method="post" action="/diagnostics/email/test" className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-emerald-100">
                Recipient email
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="min-h-12 rounded-md border border-emerald-300/18 bg-[#07140f] px-4 text-white outline-none placeholder:text-emerald-50/35 focus-visible:focus-ring"
                />
              </label>
              <button
                type="submit"
                disabled={!diagnostics.configured}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-400 px-5 font-semibold text-[#04120c] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Send className="h-5 w-5" />
                Send Test Email
              </button>
            </form>

            <Link href="/diagnostics" className="mt-5 inline-flex text-sm font-semibold text-emerald-200 hover:underline">
              Back to startup diagnostics
            </Link>
          </section>
        </section>
      </div>
    </main>
  );
}

function DiagnosticItem({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  const Icon = ok ? CheckCircle2 : XCircle;

  return (
    <div className="flex items-start justify-between gap-4 rounded-md border border-emerald-300/14 bg-[#07140f] p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300">{label}</p>
        <p className="mt-2 break-words font-semibold text-white">{value}</p>
      </div>
      <Icon className={`h-5 w-5 shrink-0 ${ok ? "text-emerald-300" : "text-amber-300"}`} />
    </div>
  );
}

function formatError(error: string, code?: string) {
  if (error === "recipient") return "Enter a valid recipient email address.";
  if (error === "configuration") return "Complete the SMTP environment variables first.";
  return `Check the SMTP settings and server logs${code ? ` (${code})` : ""}.`;
}
