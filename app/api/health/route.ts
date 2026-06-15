import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  let databaseReachable = false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    databaseReachable = true;
  } catch {
    databaseReachable = false;
  }

  return NextResponse.json({
    ok: databaseReachable,
    app: "SermonBridge",
    currentTime: new Date().toISOString(),
    databaseReachable,
  });
}
