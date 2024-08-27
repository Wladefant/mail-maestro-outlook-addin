import { Prompt } from "../components/Common/PromptHistory/types";
import { MagicTemplateResponse } from "../store/reducers/MagicTemplateReducer";
import * as Sentry from "@sentry/browser";

export type UserPromptData = {
  email: string;
  prompt: string;
  recipientsName?: string;
  magicTemplate?: MagicTemplateResponse;
  htmlPrompt?: string;
};

export function storeUserPrompt(userPromptData: UserPromptData): void {
  const { email, prompt, recipientsName, magicTemplate, htmlPrompt } = userPromptData;
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();
  const currentDateTime = new Date().toISOString();

  const userPrompt = {
    date: currentDate,
    time: currentTime,
    datetime: currentDateTime,
    recipientsName,
    prompt,
    magicTemplate,
    htmlPrompt,
  };

  const existingPrompts = localStorage.getItem(`promptHistory_${email}`);
  let dataArray: Array<Prompt> = existingPrompts ? JSON.parse(existingPrompts) : [];

  dataArray.push(userPrompt);

  localStorage.setItem(`promptHistory_${email}`, JSON.stringify(dataArray));
}

export function getUserPrompts(email: string): Array<Prompt> {
  const existingPrompts = localStorage.getItem(`promptHistory_${email}`);
  let dataArray: Array<Prompt> = existingPrompts ? JSON.parse(existingPrompts) : [];

  return dataArray;
}

export function updatePromptHistory(email: string, prompt: Prompt): void {
  const existingPrompts = localStorage.getItem(`promptHistory_${email}`);
  let dataArray: Array<Prompt> = existingPrompts ? JSON.parse(existingPrompts) : [];

  // Find the prompt to update and replace it with the new one
  // This is done by comparing the date and time or datetime of the prompt
  const updatedPrompts = dataArray.map((item) => {
    if (
      (item.date === prompt.date && item.time === prompt.time) ||
      (item?.datetime && prompt?.datetime && item?.datetime === prompt?.datetime)
    ) {
      return prompt;
    }
    return item;
  });

  localStorage.setItem(`promptHistory_${email}`, JSON.stringify(updatedPrompts));
}

/**
 * Sets an item in local storage with an expiry time.
 */
export function setWithExpiry(key: string, value: any, ttl: number) {
  const now = new Date();
  // `item` is an object which contains the original value
  // as well as the time when it's supposed to expire
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };
  try {
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    Sentry.captureMessage("Error: Failed to set item in localStorage", "error");
    console.error("Failed to set item in localStorage:", error);
    return;
  }
}

/**
 * Gets an item from local storage with an expiry time.
 */
export function getWithExpiry(key: string) {
  const itemStr = localStorage.getItem(key);
  // if the item doesn't exist, return null
  if (!itemStr) {
    return null;
  }
  const item = JSON.parse(itemStr);
  const now = new Date();
  // compare the expiry time of the item with the current time
  if (now.getTime() > item.expiry) {
    // If the item is expired, delete the item from storage
    // and return null
    localStorage.removeItem(key);
    return null;
  }
  return item;
}
