export const stripHTMLTags = (input: string) => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = input;

  return tempDiv.textContent || tempDiv.innerText || "";
};

export function isValidInput(str: string | undefined | null) {
  // Default to empty string if str is undefined or null
  const content = stripHTMLTags(str ?? "").replace(/\s/g, "");

  // Check if the resulting string has at least three characters
  return content.length >= 3;
}
