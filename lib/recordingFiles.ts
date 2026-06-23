import path from "node:path";

export const maxRecordingBytes = 100 * 1024 * 1024;
export const maxRecordingLabel = "100MB";
export const recordingAccept = ".mp3,.mp4,.wav,.m4a";

const supportedRecordingTypes: Record<string, string[]> = {
  ".mp3": ["audio/mpeg", "audio/mp3", "audio/x-mp3"],
  ".mp4": ["video/mp4", "audio/mp4"],
  ".wav": ["audio/wav", "audio/x-wav", "audio/wave", "audio/vnd.wave"],
  ".m4a": ["audio/mp4", "audio/m4a", "audio/x-m4a", "video/mp4"],
};

export type RecordingFileValidation =
  | { ok: true; extension: string }
  | { ok: false; message: string };

export function validateRecordingFile(file: File): RecordingFileValidation {
  if (!file.size) {
    return { ok: false, message: "Choose a non-empty sermon recording." };
  }

  if (file.size > maxRecordingBytes) {
    return {
      ok: false,
      message: `Recording exceeds the ${maxRecordingLabel} upload limit.`,
    };
  }

  const extension = path.extname(file.name).toLowerCase();
  const expectedTypes = supportedRecordingTypes[extension];

  if (!expectedTypes) {
    return {
      ok: false,
      message: "Unsupported file type. Upload MP3, MP4, WAV, or M4A.",
    };
  }

  if (file.type && !expectedTypes.includes(file.type.toLowerCase())) {
    return {
      ok: false,
      message: `The selected ${extension.slice(1).toUpperCase()} file has an invalid media type.`,
    };
  }

  return { ok: true, extension };
}

export function getRecordingStorageLocation(
  churchId: string,
  recordingId: string,
  extension: string,
) {
  const directory = path.join(process.cwd(), "public", "recordings", churchId);
  const fileName = `${recordingId}${extension}`;

  return {
    directory,
    absolutePath: path.join(directory, fileName),
    publicUrl: `/recordings/${encodeURIComponent(churchId)}/${fileName}`,
  };
}

export function resolveRecordingFileUrl(fileUrl: string) {
  if (!fileUrl.startsWith("/recordings/")) {
    throw new Error("Recording file path is invalid.");
  }

  const publicRoot = path.resolve(process.cwd(), "public");
  const relativePath = decodeURIComponent(fileUrl).replace(/^\/+/, "");
  const absolutePath = path.resolve(publicRoot, relativePath);

  if (!absolutePath.startsWith(`${publicRoot}${path.sep}`)) {
    throw new Error("Recording file path is outside public storage.");
  }

  return absolutePath;
}

export function isVideoRecording(fileName: string) {
  return path.extname(fileName).toLowerCase() === ".mp4";
}

export function getRecordingMimeType(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();

  return {
    ".mp3": "audio/mpeg",
    ".mp4": "video/mp4",
    ".wav": "audio/wav",
    ".m4a": "audio/mp4",
  }[extension] ?? "application/octet-stream";
}
