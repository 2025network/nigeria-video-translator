import type React from "react";
import { CheckCircle2, Server, Settings, XCircle } from "lucide-react";
import packageJson from "../../package.json";
import { resolveFfmpegDiagnostics } from "@/lib/ffmpeg";
import { OpenAIConnectivityTest } from "./OpenAIConnectivityTest";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Diagnostics",
};

type DiagnosticItemProps = {
  label: string;
  value: string;
  ok?: boolean;
  detail?: string;
};

export default function DiagnosticsPage() {
  const openAiDetected = Boolean(process.env.OPENAI_API_KEY);
  const ffmpegDiagnostics = resolveFfmpegDiagnostics();
  const ffmpegDetected = Boolean(
    ffmpegDiagnostics.selectedPath && ffmpegDiagnostics.selectedPathExists,
  );
  const hasBuildScript = packageJson.scripts?.build === "next build";
  const hasStartScript = packageJson.scripts?.start === "next start";
  const hostingerCompatible = hasBuildScript && hasStartScript;

  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="section-shell py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Diagnostics
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
            Startup diagnostics
          </h1>
          <p className="mt-5 leading-7 text-emerald-50/72">
            This page loads basic startup checks immediately. Real OpenAI text and TTS requests only run when you click the test button.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <Panel title="AI services" icon={<Settings className="h-6 w-6" />}>
            <DiagnosticItem
              label="OPENAI_API_KEY detected"
              value={openAiDetected ? "Yes" : "No"}
              ok={openAiDetected}
              detail="The key value is never displayed. Connectivity is tested only when you click the button below."
            />
            <OpenAIConnectivityTest />
          </Panel>

          <Panel title="Platform readiness" icon={<Server className="h-6 w-6" />}>
            <DiagnosticItem
              label="FFmpeg detected"
              value={ffmpegDetected ? "Yes" : "No"}
              ok={ffmpegDetected}
              detail={ffmpegDiagnostics.selectedPath ?? "No FFmpeg executable path resolved."}
            />
            <DiagnosticItem
              label="Hostinger compatibility status"
              value={hostingerCompatible ? "Ready" : "Needs attention"}
              ok={hostingerCompatible}
              detail={
                hostingerCompatible
                  ? "package.json has build: next build and start: next start."
                  : "Check package.json build and start scripts before deployment."
              }
            />
            <DiagnosticItem
              label="FFmpeg source"
              value={ffmpegDiagnostics.source}
              ok={ffmpegDetected}
              detail={`Static path installed: ${ffmpegDiagnostics.ffmpegStaticInstalled ? "Yes" : "No"}`}
            />
          </Panel>
        </div>
      </section>
    </main>
  );
}

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-5">
      <div className="flex items-center gap-3 text-emerald-300">
        {icon}
        <h2 className="text-xl font-semibold text-white">{title}</h2>
      </div>
      <div className="mt-5 grid gap-4">{children}</div>
    </section>
  );
}

function DiagnosticItem({ label, value, ok, detail }: DiagnosticItemProps) {
  const Icon = ok ? CheckCircle2 : XCircle;

  return (
    <div className="rounded-md border border-emerald-300/14 bg-[#07140f] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-300">
            {label}
          </p>
          <p className="mt-2 break-words text-2xl font-semibold text-white">{value}</p>
        </div>
        <Icon className={`mt-1 h-6 w-6 ${ok ? "text-emerald-300" : "text-red-300"}`} />
      </div>
      {detail ? <p className="mt-3 break-words text-sm leading-6 text-emerald-50/68">{detail}</p> : null}
    </div>
  );
}
