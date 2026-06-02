export type OutputLanguage = "en" | "zh" | "id" | "ms";

export function detectInputLanguage(text: string): OutputLanguage {
  const value = text.trim();
  if (!value) return "en";

  if (/[\u4e00-\u9fff]/.test(value)) return "zh";

  const lower = value.toLowerCase();

  const indonesianHints = [
    "risiko",
    "pengguna",
    "pinjaman",
    "rekening",
    "nasabah",
    "penipuan",
    "kepatuhan",
    "transfer",
    "dompet digital",
    "pelanggan",
  ];

  const malayHints = [
    "risiko",
    "pengguna",
    "pinjaman",
    "akaun",
    "pelanggan",
    "penipuan",
    "pematuhan",
    "pemindahan",
    "e-dompet",
    "wang",
  ];

  const idScore = indonesianHints.filter((word) => lower.includes(word)).length;
  const msScore = malayHints.filter((word) => lower.includes(word)).length;

  if (idScore >= 2 && idScore > msScore) return "id";
  if (msScore >= 2) return "ms";

  return "en";
}

export function getGeminiLanguageInstruction(language: OutputLanguage): string {
  const sharedTerms = "KYC, AML/CFT, STR, OTP, API, fraud scoring, shadow mode, step-up authentication";

  switch (language) {
    case "zh":
      return `Respond entirely in Simplified Chinese. Keep the tone professional and suitable for a fintech risk/compliance manager. You may keep industry terms such as ${sharedTerms} in English where they are clearer than translation.`;
    case "id":
      return `Respond entirely in Indonesian. Keep the tone professional and suitable for a fintech risk/compliance manager. You may keep industry terms such as ${sharedTerms} in English where they are clearer than translation.`;
    case "ms":
      return `Respond entirely in Malay. Keep the tone professional and suitable for a fintech risk/compliance manager. You may keep industry terms such as ${sharedTerms} in English where they are clearer than translation.`;
    case "en":
    default:
      return "Respond entirely in English using professional fintech risk and compliance language.";
  }
}
