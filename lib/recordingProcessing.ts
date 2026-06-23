import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import { getLanguageName } from "./languageCatalog";
import { resolveRecordingFileUrl, getRecordingMimeType } from "./recordingFiles";
import type { TimedTranscriptSegment } from "./recordingRepository";
import { translateForListenerLanguage } from "./liveSessionTranslation";

const recordingTranslationChunkSize = 8_000;

export class RecordingProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RecordingProcessingError";
  }
}

export async function transcribeRecording(input: {
  fileUrl: string;
  originalFileName: string;
  sourceLanguage: string;
}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new RecordingProcessingError(
      "OpenAI transcription is not configured. Add OPENAI_API_KEY on the server.",
    );
  }

  const absolutePath = resolveRecordingFileUrl(input.fileUrl);
  const buffer = await readFile(absolutePath);
  const file = new File([buffer], input.originalFileName, {
    type: getRecordingMimeType(input.originalFileName),
  });
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const configuredModel =
    process.env.OPENAI_RECORDING_TRANSCRIPTION_MODEL ||
    process.env.OPENAI_TRANSCRIPTION_MODEL ||
    "whisper-1";
  const language = /^[a-z]{2}$/i.test(input.sourceLanguage)
    ? input.sourceLanguage.toLowerCase()
    : undefined;

  try {
    if (configuredModel === "whisper-1") {
      const response = await client.audio.transcriptions.create({
        file,
        model: configuredModel,
        response_format: "verbose_json",
        timestamp_granularities: ["segment"],
        ...(language ? { language } : {}),
      });
      const transcript = response.text.trim();

      if (!transcript) {
        throw new RecordingProcessingError(
          "No speech was detected in this recording.",
        );
      }

      const segments = (response.segments ?? [])
        .map((segment) => ({
          start: segment.start,
          end: segment.end,
          text: segment.text.trim(),
        }))
        .filter((segment) => segment.text && segment.end >= segment.start);

      return { transcript, segments, model: configuredModel };
    }

    const response = await client.audio.transcriptions.create({
      file,
      model: configuredModel,
      ...(language ? { language } : {}),
    });
    const transcript = response.text.trim();

    if (!transcript) {
      throw new RecordingProcessingError(
        "No speech was detected in this recording.",
      );
    }

    return {
      transcript,
      segments: [] as TimedTranscriptSegment[],
      model: configuredModel,
    };
  } catch (error) {
    if (error instanceof RecordingProcessingError) throw error;
    throw new RecordingProcessingError(
      getSafeProcessingMessage(error, "Recording transcription failed."),
    );
  }
}

export async function translateRecording(input: {
  transcript: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new RecordingProcessingError(
      "OpenAI translation is not configured. Add OPENAI_API_KEY on the server.",
    );
  }

  if (input.sourceLanguageCode === input.targetLanguageCode) {
    return input.transcript;
  }

  const languageName = getLanguageName(input.targetLanguageCode);
  const chunks = splitRecordingTranscript(input.transcript);
  const translations: string[] = [];

  for (const chunk of chunks) {
    const result = await translateForListenerLanguage(chunk, languageName);

    if (result.mode !== "real") {
      throw new RecordingProcessingError(
        `${languageName} translation could not be completed by the configured service.`,
      );
    }

    translations.push(result.translatedText.trim());
  }

  return translations.filter(Boolean).join("\n\n");
}

export async function writeRecordingSubtitle(input: {
  churchId: string;
  recordingId: string;
  languageCode: string;
  translatedText: string;
  segments: TimedTranscriptSegment[];
}) {
  if (!input.segments.length) return null;

  const directory = path.join(
    process.cwd(),
    "public",
    "recordings",
    input.churchId,
    "subtitles",
  );
  const fileName = `${input.recordingId}-${input.languageCode}.srt`;
  const absolutePath = path.join(directory, fileName);
  const subtitle = buildTimedSrt(input.segments, input.translatedText);

  await mkdir(directory, { recursive: true });
  await writeFile(absolutePath, subtitle, "utf8");

  return `/recordings/${encodeURIComponent(input.churchId)}/subtitles/${fileName}`;
}

function splitRecordingTranscript(transcript: string) {
  const normalized = transcript.trim();
  if (normalized.length <= recordingTranslationChunkSize) return [normalized];

  const chunks: string[] = [];
  let remaining = normalized;

  while (remaining.length > recordingTranslationChunkSize) {
    const window = remaining.slice(0, recordingTranslationChunkSize);
    const sentenceBreak = Math.max(
      window.lastIndexOf(". "),
      window.lastIndexOf("? "),
      window.lastIndexOf("! "),
      window.lastIndexOf("\n"),
    );
    const splitAt = sentenceBreak > recordingTranslationChunkSize * 0.55
      ? sentenceBreak + 1
      : window.lastIndexOf(" ");
    const safeSplit = splitAt > 0 ? splitAt : recordingTranslationChunkSize;

    chunks.push(remaining.slice(0, safeSplit).trim());
    remaining = remaining.slice(safeSplit).trim();
  }

  if (remaining) chunks.push(remaining);
  return chunks;
}

function buildTimedSrt(
  segments: TimedTranscriptSegment[],
  translatedText: string,
) {
  const usesWords = /\s/.test(translatedText.trim());
  const tokens = usesWords
    ? translatedText.trim().split(/\s+/)
    : Array.from(translatedText.trim());
  const weights = segments.map((segment) => Math.max(1, segment.text.length));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let cursor = 0;
  let cumulativeWeight = 0;

  return segments
    .map((segment, index) => {
      cumulativeWeight += weights[index];
      const projectedEnd = index === segments.length - 1
        ? tokens.length
        : Math.round((cumulativeWeight / totalWeight) * tokens.length);
      const end = Math.max(cursor + 1, Math.min(tokens.length, projectedEnd));
      const text = tokens.slice(cursor, end).join(usesWords ? " " : "").trim();
      cursor = end;

      return [
        String(index + 1),
        `${formatSrtTime(segment.start)} --> ${formatSrtTime(segment.end)}`,
        text || translatedText.trim(),
      ].join("\n");
    })
    .join("\n\n")
    .concat("\n");
}

function formatSrtTime(seconds: number) {
  const totalMilliseconds = Math.max(0, Math.round(seconds * 1000));
  const milliseconds = totalMilliseconds % 1000;
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const valueSeconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(valueSeconds).padStart(2, "0"),
  ].join(":").concat(",", String(milliseconds).padStart(3, "0"));
}

export function getSafeProcessingMessage(error: unknown, fallback: string) {
  if (error instanceof RecordingProcessingError) return error.message;
  if (error instanceof Error && error.message.trim()) return error.message.slice(0, 600);
  return fallback;
}
