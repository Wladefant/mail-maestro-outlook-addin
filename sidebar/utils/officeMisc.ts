import { isMac } from "@fluentui/react";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import * as Sentry from "@sentry/browser";
import ReactGA from "react-ga4";
import { fetchUserDetails } from "../../../Shared/sidebar/store/actions/authAction";
import { RootState } from "../../../Shared/sidebar/store/store";
import { ADDIN_ACTIONS } from "../../../Shared/sidebar/utils/constants";
import { GA4_EVENTS } from "../../../Shared/sidebar/utils/events";
import { splitOutlookNativeDraft, splitOutlookWebDraft } from "../../../Shared/sidebar/utils/html";
import { canCallEwsAsync, replacePWithLiTags } from "./office";
import { DIALOG_MESSAGES } from "../../../Shared/dialog/utils/constants";
import { getCalendarEventsEWSRequest } from "./ewsRequests";
import { AttachmentDetails } from "../../../Shared/sidebar/store/reducers/AttachmentsReducer";
import { isAttachmentProcessable } from "../../../Shared/sidebar/utils/attachments";
import { WINDOWS_TIMEZONE_MAP } from "../../../Shared/sidebar/utils/calendar";
import { MagicTemplate } from "../../../Shared/sidebar/store/reducers/MagicTemplateReducer";
import { SettingsModule } from "../../../Shared/dialog/components/Screens/Settings";

export const isNativeApp = () => Office.context.mailbox.diagnostics.hostName === "Outlook";

export const getPlatformSetting = async (key: string): Promise<any> => {
  return await Office.context.roamingSettings.get(key);
};

export const setPlatformSetting = async (key: string, value: any) => {
  return new Promise<void>((resolve): void => {
    const _settings = Office.context.roamingSettings;
    _settings.set(key, value);
    // Save roaming settings to the mailbox, so that they'll be available in the next session.
    _settings.saveAsync(() => {
      resolve();
    });
  });
};

export const getHostName = () => Office.context.mailbox?.diagnostics?.hostName;
export const getHostVersion = () => Office.context.mailbox.diagnostics.hostVersion;
export const getPlatform = () => Office.context.platform;
export const getConversationId = () => Office.context.mailbox.item!.conversationId;
export const getItem = (_itemId?: string) => Office.context.mailbox.item;

export const getSubject = (item: any): Promise<string> => {
  return new Promise((resolve) => {
    if (item?.subject?.getAsync != null) {
      // in WRITE_VIEW
      item.subject.getAsync((result: any) => {
        resolve(result.value);
      });
    } else {
      // in READ_VIEW
      resolve(item?.subject as string);
    }
  });
};

export const getRecipients = (item: any): any => {
  if (item) {
    return {
      from: item?.from || null,
      to: item?.to || [],
      cc: item?.cc || [],
    };
  }
  return { from: null, to: [], cc: [] };
};

export const getName = () => Office.context.mailbox.userProfile.displayName;
export const getEmail = () => Office.context.mailbox.userProfile.emailAddress;
export const getEmailReceivedDate = async (_itemId: any) =>
  Office.context.mailbox.item!.dateTimeCreated.toISOString() || "";
export const getTimeZone = () => WINDOWS_TIMEZONE_MAP[Office.context.mailbox.userProfile.timeZone];

export function processMessage(
  arg: any,
  dialogMetadata: {
    action: string;
    isReply: boolean;
    authToken: string;
    emailThread: string;
    templateToEdit?: MagicTemplate;
    settingsModule?: SettingsModule;
  },
  dialog: any,
  event: any,
) {
  const { action, authToken, emailThread, isReply, templateToEdit, settingsModule } = dialogMetadata;
  const messageFromArgument = JSON.parse(arg.message);
  if (messageFromArgument.action === DIALOG_MESSAGES.FIRST_RUN_CLICKED) {
    setPlatformSetting("onboarded", true);
    if (action === ADDIN_ACTIONS.ONBOARDING_ONLY) {
      dialog.close();
      event(false);
    }
  } else if (messageFromArgument.action === DIALOG_MESSAGES.DIALOG_INITIALIZED) {
    const messageToDialog = JSON.stringify({
      action: DIALOG_MESSAGES.DIALOG_INITIALIZED,
      payload: {
        name: getName(),
        email: getEmail(),
        token: authToken,
        emailThread,
        isReply,
        action,
        draftId: "",
        templateToEdit,
        settingsModule,
      },
    });
    dialog.messageChild(messageToDialog);
  } else if (messageFromArgument.action === DIALOG_MESSAGES.CLOSE_SETTINGS_DIALOG) {
    console.log("closing");
    dialog.close();
    event();
  }
}

export const openTaskPaneByOption = (
  option: string,
  token: string,
  dialogMetadata: {
    templateToEdit?: MagicTemplate;
    settingsModule?: SettingsModule;
  },
  size: { height: number; width: number },
  dispatch: ThunkDispatch<RootState, void, AnyAction>,
  handleClose: () => void,
) => {
  const { height: targetPixelHeight, width: targetPixelWidth } = size;
  const height = Math.round((targetPixelHeight / window.screen.height) * 100);
  const width = Math.round((targetPixelWidth / window.screen.width) * 100);

  ReactGA.event(GA4_EVENTS.SETTINGS_CLICKED);

  Office.context.ui.displayDialogAsync(
    `${process.env.BASE_URL}taskpane.html?${option}`,
    { height, width },
    async function (asyncResult: any) {
      const dialog = asyncResult.value;
      dialog.addEventHandler(Office.EventType.DialogMessageReceived, (args: any) =>
        // re-use the processMessage function from the commands
        processMessage(
          args,
          {
            action: ADDIN_ACTIONS.CHANGE_SETTINGS,
            isReply: true,
            authToken: token || "",
            emailThread: "",
            templateToEdit: dialogMetadata?.templateToEdit,
            settingsModule: dialogMetadata?.settingsModule,
          },
          dialog,
          () => {
            handleClose();
            dispatch(fetchUserDetails(token)).unwrap();
          }, // abuse the "event" parameter to reload the user details on dialog close
        ),
      );
    },
  );
};

/*
 * Open the onboarding dialog
 * When onboarding is complete, the dialog will send a message to the add-in
 * and we set the onboarding flag in the settings as well as the isFirstRun state
 */
export const startOnboarding = (callback: Function, token: string, onBoardingCompleted: () => void) => {
  const targetPixelHeight = 740;
  const targetPixelWidth = 800;
  const height = Math.round((targetPixelHeight / window.screen.height) * 100);
  const width = Math.round((targetPixelWidth / window.screen.width) * 100);
  Office.context.ui.displayDialogAsync(
    `${process.env.BASE_URL}taskpane.html?firstRun`,
    { height, width },
    async function (asyncResult: any) {
      const dialog = asyncResult.value;
      callback(dialog);
      dialog.addEventHandler(Office.EventType.DialogMessageReceived, (args: any) =>
        // re-use the processMessage function from the commands
        processMessage(
          args,
          {
            action: ADDIN_ACTIONS.ONBOARDING_ONLY,
            isReply: true,
            authToken: token || "",
            emailThread: "",
          },
          dialog,
          onBoardingCompleted, // abuse the "event" parameter to pass onBoardingCompleted function
        ),
      );
    },
  );
};

export const getOfficeEmailData: () => Promise<{
  userInput: string;
  prevThread: string;
  signature: string;
  fullHtml: string;
}> = async () => {
  return new Promise((resolve) => {
    const host = getHostName();
    Office.context.mailbox.item!.body.getAsync(
      "html",
      { asyncContext: "This is passed to the callback" },
      function (result) {
        // This part is for the case when we get the full thread instead of only the written draft
        // It happens often on mac and windows clients and "sometimes" on web.
        // The idea is to remove the previous part thread and put it back to the generated text later.
        let prevThread = "";
        let messageToImprove = "";
        let signature = "";
        if (host === "OutlookWebApp" || host === "newOutlookWindows") {
          // web way to split body from previous emails
          ({ prevThread, messageToImprove, signature } = splitOutlookWebDraft(result.value));
        } else if (host === "Outlook") {
          // MacOS and Win11 way
          ({ prevThread, messageToImprove, signature } = splitOutlookNativeDraft(result.value));

          if (isMac()) {
            messageToImprove = replacePWithLiTags(messageToImprove);
          }
        }

        resolve({
          userInput: messageToImprove,
          prevThread,
          signature,
          fullHtml: result.value,
        });
      },
    );
  });
};

export const getOutlookToken = async (callback: Function) => {
  Office.context.mailbox.getUserIdentityTokenAsync(async (result) => {
    if (result.status !== Office.AsyncResultStatus.Succeeded) {
      console.error(`Token retrieval failed with message: ${result.error.message}`);
      Sentry.captureMessage(`Token retrieval failed with message: ${result.error.message}`, "error");
      // TODO: We return the erros message as token here
      //  This is a temporary solution to avoid breaking the app as long as MS doesn't fix the issue
      //  with getting the token for gmail, outlook.com, hotmail domains
      callback(result.error.message);
      //return;
    } else {
      callback(result.value);
    }
  });
};

export const getAttachmentContentById = (
  attachmentId: string,
  _messageId: string,

  callback: Function,
) => {
  Office.context.mailbox.item?.getAttachmentContentAsync(attachmentId, (result: any) => {
    if (result.status == "succeeded") {
      callback(result.value.content);
    } else {
      callback(null);
    }
  });
};

export const getEWS = (soapRequest: string, callback: Function) => {
  Office.context.mailbox.makeEwsRequestAsync(soapRequest, function (asyncResult) {
    callback(asyncResult);
  });
};

export const sendMessageToParent = (action: string, message: any) => {
  Office.context.ui.messageParent(
    JSON.stringify({
      action,
      payload: message,
    }),
  );
};

export const getPlatformCalendarEvents = async (start: string, end: string) => {
  const canUseEWS = await canCallEwsAsync();
  return new Promise<{ start: string; end: string; subject: string; isFreeSlot: boolean }[]>((resolve, reject) => {
    if (canUseEWS) {
      const soapRequest = getCalendarEventsEWSRequest(start, end);
      getEWS(soapRequest, (asyncResult: any) => {
        if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(asyncResult.value, "text/xml");

          const body = xmlDoc.documentElement.getElementsByTagName("s:Body")[0];
          const findItemResponse = body.getElementsByTagName("m:FindItemResponse")[0];
          const responseMessages = findItemResponse.getElementsByTagName("m:ResponseMessages")[0];
          const findItemResponseMessage = responseMessages.getElementsByTagName("m:FindItemResponseMessage")[0];
          const rootFolder = findItemResponseMessage.getElementsByTagName("m:RootFolder")[0];
          const items = rootFolder.getElementsByTagName("t:Items")[0];
          const calendarItems = items.getElementsByTagName("t:CalendarItem");

          let extractedData: {
            subject: string;
            isFreeSlot: boolean;
            start: string;
            end: string;
          }[] = [];

          for (let i = 0; i < calendarItems.length; i++) {
            const item = calendarItems[i];
            const subject = item.getElementsByTagName("t:Subject")[0]?.textContent || "";
            const start = item.getElementsByTagName("t:Start")[0]?.textContent || "";
            const end = item.getElementsByTagName("t:End")[0]?.textContent || "";
            const isFreeSlot = item.getElementsByTagName("t:LegacyFreeBusyStatus")[0]?.textContent === "Free";

            extractedData.push({ subject, start, end, isFreeSlot });
          }
          resolve(extractedData);
        } else {
          reject("Error getting calendar events");
        }
      });
    } else {
      reject("EWS not available for user");
    }
  });
};

export const getPlatformAttachments = (_messageId?: string): AttachmentDetails[] => {
  let item = getItem();
  let attachmentsList: AttachmentDetails[] = [];

  // Check if the email has attachments
  if (item?.attachments && item.attachments.length > 0) {
    // Loop through each attachment
    for (let i = 0; i < item.attachments.length; i++) {
      let attachment = item.attachments[i];
      // Skip inline attachments
      if (attachment.isInline) continue;
      // Push details to the list
      attachmentsList.push({
        name: attachment.name,
        id: attachment.id,
        size: attachment.size,
        contentType: attachment.contentType,
        processable: isAttachmentProcessable(attachment),
      });
    }
  }

  return attachmentsList;
};

export const signOutFromPlatform = async () => {
  console.log("Not implemented");
};
