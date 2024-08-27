export const languageOptions: Record<string, string>[] = [
  { key: "en-gb", text: "English (UK)" },
  { key: "en-us", text: "English (US)" },
  { key: "de", text: "German" },
  { key: "es", text: "Spanish" },
  { key: "fr", text: "French" },
  { key: "it", text: "Italian" },
  { key: "ms", text: "Malay" },
  { key: "pt-br", text: "Portuguese (BR)" },
  { key: "pt-pt", text: "Portuguese (PT)" },
  { key: "sv", text: "Swedish" },
  { key: "nl", text: "Dutch" },
  { key: "de-ch", text: "Swiss German (Beta)" },
  { key: "tr", text: "Turkish" },
  { key: "is-is", text: "Icelandic" },
  { key: "da", text: "Danish" },
];

export const extendedLanguageOptions: Record<string, string>[] = [{ key: "xx", text: "Auto" }];

export const completedListOfLanguageOptions = languageOptions.concat(extendedLanguageOptions);
