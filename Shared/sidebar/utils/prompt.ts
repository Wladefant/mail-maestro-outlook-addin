import moment from "moment";
import { Prompt } from "../components/Common/PromptHistory/types";
import { compareDates, getISODateString } from "./datetime";

export function comparePrompts(a: Prompt, b: Prompt, order: "asc" | "desc"): number {
  if (a.pinned && !b.pinned) return -1;
  if (!a.pinned && b.pinned) return 1;

  const dateA = a.datetime || getISODateString(a.date, a.time);
  const dateB = b.datetime || getISODateString(b.date, b.time);

  return compareDates(dateA, dateB, order);
}

export function sortPrompts(prompts: Prompt[], order: "asc" | "desc"): Prompt[] {
  return prompts.sort((a, b) => comparePrompts(a, b, order));
}

export function addDateTimeIfNeeded(prompt: Prompt): Prompt {
  if (!prompt.datetime) {
    const datetime = getISODateString(prompt.date, prompt.time);
    return { ...prompt, datetime };
  }
  return prompt;
}

export function formatDate(prompt: Prompt): Prompt {
  const userLocale = navigator.languages ? navigator.languages[0] : navigator.language;
  moment.locale(userLocale);

  let datetime = prompt.datetime;
  if (!datetime) {
    datetime = getISODateString(prompt.date, prompt.time);
  }
  return {
    ...prompt,
    formattedDate: moment(datetime).format("L"),
    time: moment(datetime).format("LT"),
  };
}
