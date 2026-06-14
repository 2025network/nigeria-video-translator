import { NextResponse } from "next/server";
import {
  createWidgetUsageEvent,
  widgetUsageEventTypes,
  type WidgetUsageEventType,
} from "@/lib/widgetUsageRepository";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const churchSlug = readString(payload, "churchSlug").trim();
  const branchSlug = readString(payload, "branchSlug").trim();
  const eventType = readString(payload, "eventType").trim();
  const selectedLanguage = readString(payload, "selectedLanguage").trim();

  if (!churchSlug) {
    return NextResponse.json({ error: "churchSlug is required." }, { status: 400 });
  }

  if (!isWidgetUsageEventType(eventType)) {
    return NextResponse.json({ error: "Unsupported eventType." }, { status: 400 });
  }

  await createWidgetUsageEvent({
    churchSlug,
    branchSlug: branchSlug || undefined,
    eventType,
    selectedLanguage: selectedLanguage || undefined,
  });

  return NextResponse.json({ ok: true });
}

function readString(payload: unknown, key: string) {
  if (!payload || typeof payload !== "object" || !(key in payload)) {
    return "";
  }

  const value = (payload as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

function isWidgetUsageEventType(value: string): value is WidgetUsageEventType {
  return widgetUsageEventTypes.includes(value as WidgetUsageEventType);
}
