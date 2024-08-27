import { DraftAction, Recipient } from "../store/reducers/AppReducer";
import { MagicTemplateResponse } from "../store/reducers/MagicTemplateReducer";
import { formatAPIStructure } from "../utils/api";
import { combineRecipients } from "../utils/draft";
import * as Sentry from "@sentry/browser";
import axios from "axios";
import { isEmptyObject } from "../utils/object";

export type EmailStatuses = {
  draft_id?: string;
  draft_status?: "aborted" | "completed" | "copied";
  request_rating?: number;
} & {
  request_id?: string;
  request_status?: "accepted" | "viewed" | "rejected";
  request_rating?: number;
} & (
    | { draft_id: string; draft_status: string; request_rating?: number }
    | { request_id: string; request_status: string; request_rating?: number }
    | { request_id: string; request_rating?: number }
  );

export type draftFetchData = {
  tone: string;
  length: string;
  promptInput: string;
  language: string;
  senderName: string;
  isReply: boolean;
  senderAddress: string;
  authToken: string;
  draftId: string;
  emailThread?: string;
  iteration?: number;
  templateId?: string;
  templateResponses?: MagicTemplateResponse["responses"] | undefined | null;
  useEmailContext?: boolean;
  mode?: string;
  initialUserDraft?: string;
  from?: Recipient | null;
  recipients: Recipient[];
  ccRecipients: Recipient[];
  recipientsName?: string;
};

export const getEndpoint = (draftAction: DraftAction | null) => {
  return `emails/${draftAction?.replace("_", "-") || ""}`;
};

export async function fetchDraftResponse(fetchData: draftFetchData, draftAction: DraftAction | null) {
  const {
    tone,
    length,
    promptInput,
    language,
    senderName,
    isReply,
    senderAddress,
    authToken,
    draftId,
    emailThread,
    iteration,
    templateId,
    templateResponses,
    useEmailContext = true,
    mode,
    initialUserDraft,
    from,
    recipients,
    ccRecipients,
    recipientsName,
  } = fetchData;

  const apiRecipients = combineRecipients(from, senderAddress, recipients, ccRecipients);

  const apiEndpoint = `${process.env.BACKEND_URL}${getEndpoint(draftAction)}`;
  const apiParams = {
    is_reply: isReply,
    ...(isReply && { mail_body: emailThread }),
    sender: senderName,
    language: language,
    sender_address: senderAddress,
    tone: tone,
    output_length: length,
    draft_id: draftId,
    iteration,
    ...(templateId
      ? {
          magic_template: {
            id: templateId,
            fields: templateResponses,
          },
        }
      : { prompt_input: promptInput }),
    stream: true,
    use_previous_context: useEmailContext,
    manifest_version: process.env.MANIFEST_VERSION,
    mode,
    initial_outlook_draft: initialUserDraft,
    recipients: apiRecipients,
    recipients_line: recipientsName,
  };

  if (isEmptyObject(apiParams)) {
    console.error("Error: apiParams is an empty object.");
    Sentry.captureMessage("Error: apiParams is an empty object.", "error");
    throw new Error("apiParams is an empty object.");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Token ${authToken}`,
  };

  try {
    const response = await axios.post(apiEndpoint, apiParams, { headers });
    return response.data;
  } catch (error) {
    // Handle error. You can log it or throw it depending on your error handling strategy
    console.error("Error fetching draft response:", error);
    Sentry.captureMessage("Error in draft request", "error");
    throw new Error("Error in draft request.");
  }
}

export async function createEmailDraft(
  draftId: string,
  action: string,
  kind: string,
  authToken: string,
  mode?: string,
  platform_type?: string,
) {
  const apiEndpoint = `${process.env.BACKEND_URL}emails/drafts/`;

  const apiParams = {
    id: draftId,
    action: action.toUpperCase(),
    kind: kind.toUpperCase(),
    frontend_version: process.env.npm_package_version,
    manifest_version: process.env.MANIFEST_VERSION,
    mode,
    platform_type,
  };

  const settings = formatAPIStructure(apiParams, authToken);

  const fetchResponse = await fetch(apiEndpoint, settings);
  if (!fetchResponse.ok) {
    Sentry.captureMessage("Error in createEmailDraft", "error");
  }
  return await fetchResponse.json();
}

export async function updateEmailDraftStatus(draftId: string, status: string, authToken: string) {
  const apiEndpoint = `${process.env.BACKEND_URL}emails/drafts/${draftId}/`;
  const apiParams = {
    status,
    manifest_version: process.env.MANIFEST_VERSION,
  };

  const settings = formatAPIStructure(apiParams, authToken, "PATCH");

  const fetchResponse = await fetch(apiEndpoint, settings);
  if (!fetchResponse.ok) {
    Sentry.captureMessage("Error in updateEmailDraftStatus", "error");
  }
  await fetchResponse.json();
}

export async function updateEmailStatuses(emailStatuses: EmailStatuses, authToken: string | null) {
  const apiEndpoint = `${process.env.BACKEND_URL}emails/update-statuses`;
  const apiParams = emailStatuses;

  const settings = formatAPIStructure(apiParams, authToken ?? "", "POST");

  const fetchResponse = await fetch(apiEndpoint, settings);
  if (!fetchResponse.ok) {
    Sentry.captureMessage("Error in updateEmailStatuses", "error");
  }
  await fetchResponse.json();
}
