import hash from "hash.js";
import { htmlToText } from "html-to-text";

export function replaceSubstring(str: string, replacement: string, startIndex: number, endIndex: number): string {
  if (startIndex < 0 || endIndex > str.length || startIndex > endIndex) {
    throw new Error("Invalid start or end index");
  }

  const partBefore = str.substring(0, startIndex);
  const partAfter = str.substring(endIndex + 1);
  const replacedString = partBefore + replacement + partAfter;

  return replacedString;
}

export function containsLineBreaks(inputString: string): boolean {
  if (!inputString) {
    return false;
  }
  // Check for Unix-like line breaks (\n)
  if (inputString.includes("\n")) {
    return true;
  }

  // Check for Windows line breaks (\r\n)
  if (inputString.includes("\r\n")) {
    return true;
  }

  return false;
}

export function insertLineBreakAtPosition(inputString: string, position: number): string {
  if (position < 0 || position > inputString.length) {
    return inputString;
  }

  const beforeBreak = inputString.substring(0, position);
  const afterBreak = inputString.substring(position);

  return beforeBreak + "\n" + afterBreak;
}

export function getTextWithDoubleLinebreaks(text: string) {
  if (!text) {
    return "";
  }

  const lines = text.split("\n");
  const numberOflines = lines.length;

  const textToCopy = lines
    .map((line: string, index: number) => {
      if (index === numberOflines - 1) {
        return line;
      }
      return line + "\n\n";
    })
    .join("");

  return textToCopy;
}

export function addDoubleNewlines(input: string): string {
  const lines = input.split("\n");
  const result = lines.join("\n\n");
  return result;
}

export const replaceSingleLinebreaksWithDouble = (str: string): string => {
  const tempPlaceholder = "<<TEMP_PLACEHOLDER>>";

  // Replace double linebreaks with a temporary placeholder
  str = str.replace(/\n\n/g, tempPlaceholder);

  // Replace single linebreaks with double linebreaks
  str = str.replace(/\n/g, "\n\n");

  // Replace the temporary placeholder with double linebreaks
  str = str.replace(new RegExp(tempPlaceholder, "g"), "\n\n");
  return str;
};

export const toTitleCase = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const slugify = (str: string): string => {
  return str
    .trim()
    .toLowerCase()
    .normalize("NFD") // Normalize diacritic marks
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritic marks
    .replace(/[^a-z0-9 -]/g, "") // Remove invalid chars
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/-+/g, "-"); // Replace multiple - with single -
};

export const removeLineBreaksAndOtherMarkup = (str: string): string => {
  str = htmlToText(str);
  str = str.toLowerCase();
  str = str.replace(/\s+/g, " ").trim();
  str = str.replace(/https?:\/\/[^\s]+/g, "");
  return str;
};

export function hashString(inputString: string): string {
  const preparedString = removeLineBreaksAndOtherMarkup(inputString);
  const sha256 = hash.sha256();
  sha256.update(preparedString);
  return sha256.digest("hex");
}

export const getDomainFromEmail = (email: string): string => {
  const match = email.match(/@(.+)/);
  return match ? match[1].toLowerCase() : "";
};
