type TranscriptionInput = {
  audioPath: string;
  videoName: string;
};

export async function transcribeSpeech({
  audioPath,
  videoName,
}: TranscriptionInput): Promise<string> {
  const normalizedName = videoName.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");

  return [
    `Mock transcript for ${normalizedName}.`,
    "The speaker welcomes viewers and introduces the purpose of the recorded video.",
    "Key details are explained clearly so the message can be translated for church audiences.",
    `Audio source prepared at ${audioPath}.`,
  ].join(" ");
}

