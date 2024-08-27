import { Recipient } from "../store/reducers/AppReducer";
import { StoredGeneratedDraft, StoredUserDraft } from "../store/reducers/DraftReducer";

export const getAssitedByMailMaestroSignature = (userId?: string): string => {
  let signatureText = "Assisted by";
  let utmTags = "?utm_source=mailmaestro&utm_medium=email&utm_campaign=signature_assisted";
  if (!["0", "1", "2", "3", "4", "5", "6", "7"].includes(userId?.charAt(0) ?? "")) {
    signatureText = "Sent via";
    utmTags = `?utm_source=mailmaestro&utm_medium=email&utm_campaign=signature_sent`;
  }
  return `<p>${signatureText} <a href='https://www.maestrolabs.com${utmTags}'>MailMaestro</a></p>`;
};

export const addAssistedByMailMaestroSignature = (
  emailDraft: string,
  isLink: boolean,
  addSignature: boolean,
  userId?: string,
): any => {
  if (!addSignature) {
    return emailDraft;
  }

  let signatureText = "Assisted by";
  let utmTags = "?utm_source=mailmaestro&utm_medium=email&utm_campaign=signature_assisted";
  if (!["0", "1", "2", "3", "4", "5", "6", "7"].includes(userId?.charAt(0) ?? "")) {
    signatureText = "Sent via";
    utmTags = `?utm_source=mailmaestro&utm_medium=email&utm_campaign=signature_sent`;
  }

  return (emailDraft ?? "").concat(
    isLink
      ? `\n\n${signatureText} <a href='https://www.maestrolabs.com${utmTags}'>MailMaestro</a>`
      : `\n\n${signatureText} MailMaestro`,
  );
};

/* 
  This function is used to combine the recipients and ccRecipients into a single array of recipients
  The API expects the recipients to be in the following format:
  [
    {
      email: "emailAddress",
      name: "displayName",
      type: "TO|CC"
   },
   ...
  ] 
*/
export const combineRecipients = (
  from: Recipient | null | undefined,
  senderAddress: string,
  recipients: Recipient[],
  ccRecipients: Recipient[],
): any => {
  const apiRecipients = [];
  recipients?.forEach((recipient) => {
    // only add recipients that are not the user
    if (recipient.emailAddress !== senderAddress) {
      apiRecipients?.push({
        email: recipient.emailAddress,
        name: recipient.displayName,
        type: "TO",
      });
    }
  });
  // if from is not null, add it to the recipients
  if (from) {
    apiRecipients?.push({
      email: from.emailAddress,
      name: from.displayName,
      type: "TO",
    });
  }
  ccRecipients?.forEach((recipient) => {
    apiRecipients?.push({
      email: recipient.emailAddress,
      name: recipient.displayName,
      type: "CC",
    });
  });

  return apiRecipients;
};

export const highlighText = (text: string, initialIndex: number, finalIndex: number) => {
  return (
    text.slice(0, initialIndex) +
    `<span style="background-color: #E8E7FF; border-radius: 5px">` +
    text.slice(initialIndex, finalIndex) +
    "</span>" +
    text.slice(finalIndex)
  );
};

export const findUserDraftByConversationId = (userDrafts: StoredUserDraft[], conversationId: string) => {
  return userDrafts.find((draft) => draft.conversationId === conversationId && !draft.completed);
};

export const findGeneratedDraftsByConversationId = (
  generatedDrafts: StoredGeneratedDraft[],
  conversationId: string,
) => {
  const generatedDraftsByConversdationId = generatedDrafts.filter(
    (draft) => draft.conversationId === conversationId && !draft.completed,
  );
  if (generatedDraftsByConversdationId.length === 3) {
    return [
      generatedDraftsByConversdationId[0].requestId,
      generatedDraftsByConversdationId[1].requestId,
      generatedDraftsByConversdationId[2].requestId,
    ];
  }
  return [];
};
