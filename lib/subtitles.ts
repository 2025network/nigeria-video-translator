type SubtitleInput = {
  transcript: string;
  translation: string;
  language: string;
};

export function generateSrt({ transcript, translation, language }: SubtitleInput): string {
  return [
    "1",
    "00:00:00,000 --> 00:00:05,000",
    transcript,
    "",
    "2",
    "00:00:05,000 --> 00:00:10,000",
    `[${language}] ${translation}`,
    "",
  ].join("\n");
}
