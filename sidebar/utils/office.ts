import { OfficeModes } from "../hooks/usePlatformMetadata";
import { DraftAction } from "../../../Shared/sidebar/store/reducers/AppReducer";
import { createEwsGetConversationsSOAP, sentEmailsEWSRequest } from "./ewsRequests";
import { PLATFROM_TYPES } from "../../../Shared/sidebar/utils/constants";
import { isMac } from "@fluentui/react";
import { updateEmailStatuses } from "../../../Shared/sidebar/apis/draft";
import { getHostName, getItem } from "./officeMisc";
import * as Sentry from "@sentry/react";
import { FontPreferences } from "../../../Shared/sidebar/components/Screens/FontPreferences/types";
import {
  getConversationFromGraphAPIByConversationId,
  getGrahpAPITokenSilently,
  getMessageFromGraphAPIByItemId,
} from "./graphAPI";
import { getAssitedByMailMaestroSignature } from "../../../Shared/sidebar/utils/draft";
import { UserProfile } from "../../../Shared/sidebar/store/reducers/AuthReducer";

export const isMobileApp = () => {
  const hostName = getHostName();
  return hostName === "OutlookIOS" || hostName === "OutlookAndroid";
};

export const getPlatformType = () => {
  const hostName = getHostName();

  if (hostName === "Outlook") {
    if (isMac()) {
      return PLATFROM_TYPES.OutlookMac;
    }
    return PLATFROM_TYPES.OutlookWindows;
  }
  if (hostName === "newOutlookWindows") {
    return PLATFROM_TYPES.OutlookWindowsNew;
  }
  return PLATFROM_TYPES[hostName as keyof typeof PLATFROM_TYPES];
};

export const pasteToOutlook = async (
  officeMode: OfficeModes | null,
  draftAction: DraftAction,
  emailBodyDraft: string,
  draftId: string,
  requestId: string,
  authToken: string,
  subject?: string,
  fontPreferences?: FontPreferences,
  userDetails?: UserProfile,
) => {
  let mailMaestroOutput = emailBodyDraft;
  if (fontPreferences?.family || fontPreferences?.size || fontPreferences?.color) {
    let styleText = "";
    if (fontPreferences?.family) {
      styleText += `font-family: ${fontPreferences.family};`;
    }
    if (fontPreferences?.size) {
      styleText += `font-size: ${fontPreferences.size}pt;`;
    }
    if (fontPreferences?.color) {
      styleText += `color: ${fontPreferences.color};`;
    }
    if (styleText) {
      mailMaestroOutput = `<div style="${styleText}">${mailMaestroOutput}</div>`;
    }
  }
  if (officeMode === OfficeModes.WRITE_VIEW) {
    if (draftAction === DraftAction.IMPROVE) {
      getItem()!.body.setAsync(mailMaestroOutput, {
        coercionType: "html",
      });
    } else {
      getItem()!.body.setSelectedDataAsync(mailMaestroOutput, {
        coercionType: "html",
      });
      if (subject) {
        subject = subject.replace("Subject: ", "");
        subject = subject.replace('"', "");
        getItem()!.subject.setAsync(subject);
      }
    }

    // Append "Assisted by MailMaestro" in onSent event
    // This is done to avoid the signature being removed in Outlook by the user
    // if it is on free plan
    if (userDetails?.subscription.maestro_promo) {
      getItem()!.body.appendOnSendAsync(getAssitedByMailMaestroSignature(userDetails.ganalytics_id), {
        coercionType: "html",
      });
    }
  }
  if (officeMode === OfficeModes.READ_VIEW) {
    getItem()!.displayReplyAllForm({
      htmlBody: mailMaestroOutput,
    });
  }
  await updateEmailStatuses(
    {
      draft_id: draftId,
      draft_status: "completed",
      request_id: requestId,
      request_status: "accepted",
    },
    authToken,
  );
};

export const getPreviousThread = async (conversationId: string | null, officeMode: OfficeModes) => {
  const graphAPIToken = await getGrahpAPITokenSilently();
  let mailThread: string | null = null;
  if (graphAPIToken) {
    mailThread = await getConversationFromGraphAPIByConversationId(conversationId as string);
  }
  if (!mailThread) {
    mailThread = await getConversationFromOutlookLegacyByConversationId(conversationId, officeMode);
  }
  return mailThread;
};

export const getPreviousMessage = async (conversationId: string | null, officeMode: OfficeModes) => {
  const graphAPIToken = await getGrahpAPITokenSilently();
  let message: string | null = null;
  if (graphAPIToken) {
    message = await getMessageFromGraphAPIByItemId(conversationId as string);
  }
  if (!message) {
    message = await getConversationFromOutlookLegacyByConversationId(conversationId, officeMode);
  }
  return message;
};

export const getConversationFromOutlookLegacyByConversationId = async (
  _conversationId: string | null,
  officeMode: OfficeModes,
) => {
  let mailThread = "";
  if (officeMode === OfficeModes.READ_VIEW) {
    await new Promise<void>((resolve) => {
      getItem()!.body.getAsync("html", { asyncContext: "This is passed to the callback" }, function (result) {
        mailThread = result.value;
        resolve();
      });
    });
  }
  if (officeMode === OfficeModes.WRITE_VIEW) {
    let attempts = 0;
    while (attempts < 3 && (mailThread === "" || mailThread === null)) {
      const conversationId = getItem()!.conversationId;
      if (attempts === 1) {
        Sentry.captureMessage(`getPreviousThread first error on retries V2`, "warning");
      }
      mailThread = await getEmailThread(conversationId);
      attempts++;
      if (mailThread === "" || mailThread === null) {
        if (attempts < 3) {
          // Introducing a delay of 1 second between retries
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }
    if (attempts === 3 && (mailThread === "" || mailThread === null)) {
      Sentry.captureMessage(`getPreviousThread third error, failing all retries V2`, "warning");
    }
  }
  return mailThread;
};

export const replacePWithLiTags = (html: string) => {
  // parse the HTML string
  let parser = new DOMParser();
  let doc = parser.parseFromString(html, "text/html");

  // find and replace the elements
  let elements = Array.from(doc.getElementsByClassName("MsoListParagraph"));
  elements.forEach((element: Element) => {
    let htmlElement = element as HTMLElement;
    let li = doc.createElement("li");
    li.innerHTML = htmlElement.innerHTML;
    htmlElement.replaceWith(li);
  });

  // create a list to hold the current <ul>
  let ul: HTMLUListElement | null = null;
  // loop through all children of the body
  Array.from(doc.body.children).forEach((child: Element) => {
    let htmlChild = child as HTMLElement;
    if (htmlChild.tagName === "LI") {
      // if the child is a <li>, append it to the current <ul>,
      // or create a new <ul> if there isn't one
      ul = ul || doc.createElement("ul");
      doc.body.insertBefore(ul, htmlChild);
      ul.appendChild(htmlChild);
    } else {
      ul = null; // if the child is not a <li>, close the <ul>
    }
  });

  return Array.from(doc.body.children)
    .map((child) => child.outerHTML)
    .join("");
};

/*
    Check if we have permissions to do Exchange Web Services (EWS) requests

    Function gets an EWS token and checks if we have the
    needed scope.

    Return value is bool
 */
export const canCallEwsAsync = async () => {
  return new Promise((resolve) => {
    Office.context.mailbox.getCallbackTokenAsync({ isRest: true }, function (result) {
      try {
        const token = result.value;
        // parse the token and check for "scope" parameter.
        // If it is present we have access to EWS
        JSON.parse(atob(token.split(".")[1])).scp.split(" ")[0];
        resolve(true);
      } catch (e: any) {
        const error = new Error("Can't use EWS");
        // Attach the original error as context
        // @ts-ignore
        error.originalError = e.message;
        // @ts-ignore
        error.resultValue = result.value;
        // Capture the error with Sentry, adding extra context
        Sentry.captureException(error, {
          extra: {
            originalError: e.message,
            resultValue: result.value,
          },
        });
        // if something goes wrong return false
        resolve(false);
      }
    });
  });
};

/**
 * Check if a conversation exists in the mailbox
 *
 * Makes a SOAP request to the EWS API to check if a conversation exists
 * This is useful to check in WRITE_VIEW if a conversation exists or if it is a draft of
 * a new email
 *
 */
export const doesConversationExist = async (conversationId: string) => {
  return new Promise<boolean>((resolve) => {
    const soapRequest = createEwsGetConversationsSOAP(conversationId);
    if (!conversationId) {
      resolve(false);
    } else {
      Office.context.mailbox.makeEwsRequestAsync(soapRequest, function (asyncResult) {
        const parser = new DOMParser();
        const xml = parser.parseFromString(asyncResult.value, "text/xml");
        const responseCode = xml.querySelector("*|ResponseCode")?.textContent;
        if (responseCode && responseCode === "ErrorItemNotFound") {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    }
  });
};

/*
    Returns the full email thread for a conversationId

    It uses an EWS request if we have permissions
    If not it uses body.getAsync which is unreliable in the compose window
  */
export const getEmailThread = async (conversationId: string) => {
  // Don't ask for permission anymore. If it doesn't work we have a fallback
  // TODO: Monitor if this has any negative impact (i.e infinite loading)
  // const canUseEWS = await canCallEwsAsync();
  return new Promise<string>((resolve) => {
    const soapRequest = createEwsGetConversationsSOAP(conversationId);
    Office.context.mailbox.makeEwsRequestAsync(soapRequest, function (asyncResult) {
      const parser = new DOMParser();
      const xml = parser.parseFromString(asyncResult.value, "text/xml");
      // Find all elements with tag name "t:Body"
      const items = xml.getElementsByTagName("t:Body");
      // Extract the "body" attribute value of each element
      const bodies = Array.from(items).map((item) => item.textContent);
      // If last item is empty then we try to get the thread from Office lib
      if (!bodies[0]) {
        const responseCode = xml.querySelector("*|ResponseCode")?.textContent;
        const messageText = xml.querySelector("*|MessageText")?.textContent;
        Sentry.captureException(`getEmailThread: EWS request returned no result V2 - ${responseCode}`, {
          extra: {
            bodies,
            conversationId,
            responseCode,
            messageText,
            asyncResult: asyncResult.value,
          },
        });
        getItem()!.body.getAsync("html", { asyncContext: "This is passed to the callback" }, function (officeResult) {
          resolve(officeResult.value || "");
        });
      } else {
        resolve(bodies[0] || "");
      }
    });
  });
};

export const getSentEmails = async () => {
  const canUseEWS = await canCallEwsAsync();
  return new Promise<{ date: string; count: number }[]>((resolve) => {
    if (canUseEWS) {
      const soapRequest = sentEmailsEWSRequest;
      Office.context.mailbox.makeEwsRequestAsync(soapRequest, function (asyncResult) {
        if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
          const response = asyncResult.value;
          // var context = asyncResult.context;
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(response, "text/xml");

          // Extract the DateTimeSent elements
          const messages = xmlDoc.getElementsByTagName("t:Message");

          // Create a map to store the count of messages per day
          const countPerDay: { [key: string]: number } = {};

          // Traverse through all DateTimeSent elements
          for (let i = 0; i < messages.length; i++) {
            // Extract the DateTimeSent element
            const dateTimeSentNode = messages[i].getElementsByTagName("t:DateTimeSent")[0];

            // Extract the date (exclude the time)
            const date = dateTimeSentNode.textContent?.substr(0, 10);
            if (date) {
              // If the date is already a key in the map, increment the count. Otherwise, initialize it to 1
              if (date in countPerDay) {
                countPerDay[date]++;
              } else {
                countPerDay[date] = 1;
              }
            }
          }
          const reformattedcountPerDay = Object.entries(countPerDay).map(([date, count]) => {
            return { date, count };
          });
          resolve(reformattedcountPerDay);
          // Parse response (this is tricky, depends on what you're looking for)
          // You need to count messages per day here
        } else {
          var error = asyncResult.error;
          console.log(error);
          resolve([]);
        }
      });
    } else {
      resolve([]);
    }
  });
};

/*
    Returns the itemId of the current email

    It uses Office.context.mailbox.item.itemId if we are in read mode
    If we are in compose mode it uses Office.context.mailbox.item.getItemIdAsync
 */
export const getItemId = async (): Promise<string> => {
  return new Promise<string>((resolve) => {
    const itemId = getItem()?.itemId;
    if (itemId) {
      resolve(itemId);
    }
    getItem()?.getItemIdAsync((result: Office.AsyncResult<string>) => {
      resolve(result.value || "");
    });
  });
};

export const openNewEmail = async () => {
  console.log("Not used in Outlook");
};
