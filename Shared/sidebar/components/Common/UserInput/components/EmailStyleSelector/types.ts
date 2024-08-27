export enum Tone {
  Professional = "Professional",
  ProfessionalInformal = "Professional Informal",
  Casual = "Casual",
  Urgent = "Urgent",
  Appreciative = "Appreciative",
  Funny = "Funny",
  Professional_Friendly = "Professional Friendly",
  Easter_Egg = "easter_egg",
}

export const toneOptions: Record<string, string>[] = [
  { key: Tone.Professional, text: Tone.Professional },
  { key: Tone.Professional_Friendly, text: Tone.Professional_Friendly },
  { key: Tone.ProfessionalInformal, text: Tone.ProfessionalInformal },
  { key: Tone.Casual, text: Tone.Casual },
  { key: Tone.Urgent, text: Tone.Urgent },
  { key: Tone.Appreciative, text: Tone.Appreciative },
  { key: Tone.Funny, text: Tone.Funny },
  { key: Tone.Easter_Egg, text: Tone.Easter_Egg },
];
