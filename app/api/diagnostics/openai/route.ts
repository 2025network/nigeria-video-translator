import { NextResponse } from "next/server";
import { runOpenAIDiagnostics } from "@/lib/openaiDiagnostics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const diagnostics = await runOpenAIDiagnostics();

  return NextResponse.json(diagnostics);
}

