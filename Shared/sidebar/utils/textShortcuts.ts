import { TextShortcut } from "../store/reducers/TextShortcutsReducer";
import * as Sentry from "@sentry/browser";

export const replaceTagsWithSnippets = (inputString: string, textShortcuts: TextShortcut[]): string => {
  let modifiedString = inputString;

  if (!textShortcuts.length || !inputString) return modifiedString;

  textShortcuts.forEach(({ tag, snippet }) => {
    try {
      const regex = new RegExp(`${tag} `, "gi");
      modifiedString = modifiedString.replace(regex, `${snippet} `);
    } catch (e) {
      Sentry.captureException(`Invalid regular expression for tag: ${tag}`);
      // Skip this tag
    }
  });

  return modifiedString;
};

export const replaceShortcutsInContent = (content: string, textShortcuts: TextShortcut[]): string => {
  let modifiedContent = content;

  for (const shortcut of textShortcuts) {
    try {
      const regex = new RegExp(escapeRegExp(shortcut.tag), "g");
      modifiedContent = modifiedContent.replace(regex, shortcut.snippet);
    } catch (e) {
      Sentry.captureException(`Invalid regular expression for tag: ${shortcut.tag}`);
      // Skip this tag
    }
  }

  return modifiedContent;
};

export const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // escaping special characters for regex
};
