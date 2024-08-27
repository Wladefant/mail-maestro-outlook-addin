export function toSnakeCase(str: string): string {
  return str.toLowerCase().trim().replace(/\s+/g, "_");
}

//Format the template string variables to snake_case
// "Our {{Company Name}} is located in {{Country Name}}." -->
// "Our {{company_name}} is located in {{country_name}}."
export function formatTemplate(str: string): string {
  if (!str) {
    return "";
  }

  const regex = /{{\s*([^}]+)\s*}}/g;

  return str.replace(regex, (_match, innerText) => {
    const snakeCaseText = innerText.toLowerCase().trim().replace(/\s+/g, "_");

    return `{{${snakeCaseText}}}`;
  });
}

export function snakeCaseToSentenceCase(str: string): string {
  const words = str.split("_");

  const sentenceCase = words
    .map((word, index) =>
      index === 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase(),
    )
    .join(" ");

  return sentenceCase;
}
