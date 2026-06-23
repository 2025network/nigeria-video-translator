import { prisma } from "./db";
import {
  catalogLanguageCodes,
  normalizeLanguageList,
} from "./languageCatalog";

export const recordingStatuses = [
  "UPLOADED",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
] as const;

export type RecordingStatus = (typeof recordingStatuses)[number];

export type TimedTranscriptSegment = {
  start: number;
  end: number;
  text: string;
};

const recordingInclude = {
  branch: true,
  translations: {
    orderBy: { createdAt: "asc" as const },
  },
};

export async function getRecordingsForChurch(churchId: string) {
  return prisma.sermonRecording.findMany({
    where: { churchId },
    include: recordingInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getRecordingForChurch(id: string, churchId: string) {
  return prisma.sermonRecording.findFirst({
    where: { id, churchId },
    include: recordingInclude,
  });
}

export async function createRecording(input: {
  id: string;
  churchId: string;
  branchId?: string | null;
  title: string;
  sourceLanguage: string;
  targetLanguages: string[];
  fileUrl: string;
  originalFileName: string;
}) {
  return prisma.sermonRecording.create({
    data: {
      ...input,
      branchId: input.branchId || null,
      targetLanguages: serializeRecordingLanguages(input.targetLanguages),
      status: "UPLOADED",
    },
  });
}

export async function updateRecordingStatus(
  id: string,
  status: RecordingStatus,
  errorMessage: string | null = null,
) {
  return prisma.sermonRecording.update({
    where: { id },
    data: { status, errorMessage },
  });
}

export async function saveRecordingTranscript(
  id: string,
  transcriptText: string,
  segments: TimedTranscriptSegment[],
) {
  const [recording] = await prisma.$transaction([
    prisma.sermonRecording.update({
      where: { id },
      data: {
        transcriptText,
        timedTranscriptJson: segments.length ? JSON.stringify(segments) : null,
        status: "PROCESSING",
        errorMessage: null,
      },
    }),
    prisma.sermonRecordingTranslation.deleteMany({
      where: { recordingId: id },
    }),
  ]);

  return recording;
}

export async function markRecordingTranslationProcessing(
  recordingId: string,
  languageCode: string,
) {
  return prisma.sermonRecordingTranslation.upsert({
    where: { recordingId_languageCode: { recordingId, languageCode } },
    create: {
      recordingId,
      languageCode,
      translatedText: "",
      status: "PROCESSING",
    },
    update: {
      translatedText: "",
      subtitleUrl: null,
      status: "PROCESSING",
      errorMessage: null,
    },
  });
}

export async function completeRecordingTranslation(input: {
  recordingId: string;
  languageCode: string;
  translatedText: string;
  subtitleUrl?: string | null;
}) {
  return prisma.sermonRecordingTranslation.update({
    where: {
      recordingId_languageCode: {
        recordingId: input.recordingId,
        languageCode: input.languageCode,
      },
    },
    data: {
      translatedText: input.translatedText,
      subtitleUrl: input.subtitleUrl || null,
      status: "COMPLETED",
      errorMessage: null,
    },
  });
}

export async function failRecordingTranslation(
  recordingId: string,
  languageCode: string,
  errorMessage: string,
) {
  return prisma.sermonRecordingTranslation.update({
    where: { recordingId_languageCode: { recordingId, languageCode } },
    data: {
      status: "FAILED",
      errorMessage,
    },
  });
}

export async function getRecordingDashboardStats(churchId: string) {
  const [total, completed, processing] = await Promise.all([
    prisma.sermonRecording.count({ where: { churchId } }),
    prisma.sermonRecording.count({ where: { churchId, status: "COMPLETED" } }),
    prisma.sermonRecording.count({ where: { churchId, status: "PROCESSING" } }),
  ]);

  return { total, completed, processing };
}

export async function isChurchBranch(churchId: string, branchId: string) {
  const branch = await prisma.churchBranch.findFirst({
    where: { id: branchId, churchId, disabledAt: null },
    select: { id: true },
  });

  return Boolean(branch);
}

export function serializeRecordingLanguages(values: string[]) {
  return normalizeLanguageList(values)
    .filter((value) => catalogLanguageCodes.includes(value))
    .join(",");
}

export function parseRecordingLanguages(value?: string | null) {
  return normalizeLanguageList(
    (value ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  ).filter((item) => catalogLanguageCodes.includes(item));
}

export function parseTimedTranscript(value?: string | null): TimedTranscriptSegment[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is TimedTranscriptSegment => {
      if (!item || typeof item !== "object") return false;
      const segment = item as Partial<TimedTranscriptSegment>;
      return (
        typeof segment.start === "number" &&
        typeof segment.end === "number" &&
        typeof segment.text === "string" &&
        segment.end >= segment.start
      );
    });
  } catch {
    return [];
  }
}
