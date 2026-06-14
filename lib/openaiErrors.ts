export const demoTranslationMessage =
  "Real AI translation is temporarily unavailable. Demo translation is being shown.";

export type OpenAIErrorDetails = {
  code: string;
  message: string;
  quotaUnavailable: boolean;
};

export function getOpenAIErrorDetails(error: unknown): OpenAIErrorDetails {
  const errorRecord = error as {
    status?: number;
    code?: string | null;
    type?: string | null;
    message?: string;
    error?: {
      code?: string | null;
      message?: string;
      type?: string | null;
    };
  };
  const status = errorRecord.status;
  const rawCode =
    errorRecord.code ??
    errorRecord.error?.code ??
    errorRecord.type ??
    errorRecord.error?.type ??
    (typeof status === "number" ? String(status) : "openai_error");
  const rawMessage =
    errorRecord.error?.message ??
    errorRecord.message ??
    "OpenAI request failed with an unknown error.";
  const code = String(rawCode);
  const quotaUnavailable =
    code === "insufficient_quota" ||
    rawMessage.toLowerCase().includes("insufficient_quota") ||
    rawMessage.toLowerCase().includes("quota");

  if (status === 401) {
    return {
      code,
      message: "API key invalid or unauthorized.",
      quotaUnavailable: false,
    };
  }

  if (quotaUnavailable) {
    return {
      code: "insufficient_quota",
      message: demoTranslationMessage,
      quotaUnavailable: true,
    };
  }

  return {
    code,
    message: rawMessage,
    quotaUnavailable: false,
  };
}

