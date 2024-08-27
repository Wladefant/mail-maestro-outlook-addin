import { AnyAction, ThunkAction, createAction } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../store";
// @ts-ignore
import { OfficeModes } from "@platformSpecific/sidebar/hooks/usePlatformMetadata";
import {
  getPlatformType,
  getPreviousThread,
  isMobileApp,
  pasteToOutlook,
} from "@platformSpecific/sidebar/utils/office";
import { getItem, getRecipients, getSubject, isNativeApp } from "@platformSpecific/sidebar/utils/officeMisc";
import ReactGA from "react-ga4";
import { createEmailDraft, fetchDraftResponse, updateEmailStatuses } from "../../apis/draft";
import {
  addAssistedByMailMaestroSignature,
  findGeneratedDraftsByConversationId,
  findUserDraftByConversationId,
} from "../../utils/draft";
import { GA4_EVENTS } from "../../utils/events";
import { addBreakTagsBetweenPTags, convertHTMLToText, convertMarkdownToHTML } from "../../utils/html";
import { getUserPrompts, storeUserPrompt } from "../../utils/localStorage";
import { replaceTagsWithSnippets } from "../../utils/textShortcuts";
import { uuid4 } from "../../utils/uuid";
import {
  DraftAction,
  Screen,
  setAlertMessage,
  setCCRecipients,
  setDraftAction,
  setErrorDescription,
  setErrorTitle,
  setFrom,
  setIsReply,
  setItem,
  setItemId,
  setMode,
  setRecipients,
  setScreen,
  setShowAlert,
  setSubject,
} from "../reducers/AppReducer";
import {
  ControlChangeRequest,
  Draft,
  StoredUserDraft,
  addGeneratedDraftIdToCurrentDraft,
  addUserDraft,
  changeConversation,
  completeGeneratedDraftOption,
  officeDraftReceived,
  resetGeneratedDrafts,
  resetGeneratedDraftsIds,
  resetUserDraft,
  setAvailableDraftOptions,
  setConversationId,
  setCreditAlreadyUsedOnCurrentDraftId,
  setDraftId,
  setError,
  setLoading,
  setSelectedDraft,
  updateUserDraft,
} from "../reducers/DraftReducer";
import { setTemplateId } from "../reducers/MagicTemplateReducer";
import { setOneSentenceSummaryRequestId, setSummaryRequestId } from "../reducers/SummaryReducer";
import { updatePromptHistory } from "../reducers/promptHistoryReducer";
import { errorDescription, errorTitle } from "../../utils/errors";
import * as Sentry from "@sentry/browser";
import { UserProfile, decreaseDraftsLeft } from "../reducers/AuthReducer";

const SET_TONE_ACTION = "draft/SetTone";
export const setToneAction = createAction<ControlChangeRequest>(SET_TONE_ACTION);
const SET_LANGUAGE_ACTION = "draft/SetLanguage";
export const setLanguageAction = createAction<ControlChangeRequest>(SET_LANGUAGE_ACTION);
const SET_EMAIL_LENGTH_ACTION = "draft/SetEmailLength";
export const setEmailLengthAction = createAction<ControlChangeRequest>(SET_EMAIL_LENGTH_ACTION);
export const NEW_EMAIL_CONVERSATION_ID = "new-email";

export const createDraftAction =
  (
    action: DraftAction | null,
    userDraftData?: Partial<StoredUserDraft>,
  ): ThunkAction<void, RootState, unknown, AnyAction> =>
  async (dispatch: any, getState: () => RootState) => {
    const state = getState();
    const authToken = state.auth.token;
    const mode = state.app.mode;
    const platformType = getPlatformType() as string;
    const draftId = uuid4();
    const conversationId = state.draft.conversationId;
    const screen = state.app.screen;
    if (
      (action as DraftAction) !== DraftAction.TIMESLOTS_ACCEPT &&
      (action as DraftAction) !== DraftAction.RAPID_REPLY &&
      (action as DraftAction) !== DraftAction.REPLY_FAQ &&
      screen !== Screen.MagicTemplates
    ) {
      dispatch(setScreen(Screen.DraftInput));
    }
    if (authToken) {
      await createEmailDraft(draftId, action ?? "", action as DraftAction, authToken, mode ?? "", platformType);
    }

    dispatch(setDraftId(draftId));
    dispatch(setCreditAlreadyUsedOnCurrentDraftId(false));
    const userDraftToAdd = {
      draftId,
      conversationId: conversationId || NEW_EMAIL_CONVERSATION_ID,
      userDraft: "",
      draftAction: action === DraftAction.RAPID_REPLY ? DraftAction.REPLY : (action as DraftAction),
      ...(userDraftData && userDraftData),
      ...(action === DraftAction.RAPID_REPLY && {
        isFromRapidReply: true,
      }),
    };

    dispatch(addUserDraft(userDraftToAdd));
  };

export const draftMessageAction =
  (): ThunkAction<void, RootState, unknown, AnyAction> => async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    dispatch(resetGeneratedDraftsIds());
    const currentUserDraft = state.draft.userDraftHistory.find(
      (draft) =>
        draft.draftId === state.draft.draftId &&
        !draft.completed &&
        (state.draft.conversationId ? draft.conversationId === state.draft.conversationId : true),
    );
    const draftId = currentUserDraft?.draftId;
    const recipientsName = currentUserDraft?.recipientsName;
    const tone = state.draft.tone;
    const language = state.draft.language;
    const emailLength = state.draft.emailLength;
    const authToken = state.auth.token;
    const senderEmail = state.auth.userDetails?.email;
    const senderName = state.auth.userDetails?.first_name;
    const isReply = state.app.isReply;
    const iteration = state.app.iteration;
    const numberOfGeneratedOptions = 3;
    const numberOfGeneratedOptionsForStaticTemplates = 1;
    const draftAction = state.app.draftAction;
    const user = state.auth.userDetails;
    const templateId = state.magicTemplate.templateId;
    const selectedTemplate = state.magicTemplate.magicTemplates.find((template) => template.id === templateId);
    const templateResponses = state.magicTemplate.magicTemplateResponses.find(
      (response) => response.magicTemplateId === templateId,
    )?.responses;
    const useEmailContext = state.app.useEmailContext;
    const mode = state.app.mode;
    const conversationId = state.draft.conversationId;
    const from = state.app.from;
    const recipients = state.app.recipients;
    const ccRecipients = state.app.ccRecipients;
    const creditAlreadyUsedOnCurrentDraftId = state.draft.creditAlreadyUsedOnCurrentDraftId;
    let availableDraftOptions = numberOfGeneratedOptions;

    const isStaticTemplate = selectedTemplate?.static ?? false;

    if (draftAction === DraftAction.IMPROVE) {
      // We want to track how often users copy the initial draft from outlook
      // versus how often they start with an empty and write everything in the sidebar
      if (!currentUserDraft?.initialDraft) {
        ReactGA.event(GA4_EVENTS.IMPROVE_STARTED_WITH_EMPTY_DRAFT, {
          draftID: draftId,
          userID: user?.ganalytics_id,
        });
      } else {
        ReactGA.event(GA4_EVENTS.IMPROVE_STARTED_WITH_NON_EMPTY_DRAFT, {
          draftID: draftId,
          userID: user?.ganalytics_id,
        });
      }
    }
    dispatch(setAvailableDraftOptions(numberOfGeneratedOptions));
    dispatch(setSelectedDraft(null));
    dispatch(setScreen(Screen.Loading));
    dispatch(setLoading(true));
    const emailThread = (await getPreviousThread(conversationId, mode as OfficeModes)) ?? "";

    const formattedUserDraft = convertHTMLToText(currentUserDraft?.userDraft as string);

    if (draftAction !== DraftAction.IMPROVE && draftAction !== DraftAction.REPLY_FAQ) {
      const magicTemplateResponse = state.magicTemplate.magicTemplateResponses.find(
        (response) => response.magicTemplateId === templateId,
      );
      storeUserPrompt({
        email: user?.email as string,
        prompt: formattedUserDraft,
        htmlPrompt: currentUserDraft?.userDraft as string,
        recipientsName: recipientsName as string,
        ...(magicTemplateResponse && {
          magicTemplate: magicTemplateResponse,
        }),
      });
      dispatch(updatePromptHistory(getUserPrompts(user?.email as string)));
    }
    if (
      currentUserDraft?.userDraft ||
      currentUserDraft?.templateId ||
      currentUserDraft?.draftAction === DraftAction.TIMESLOTS_ACCEPT ||
      currentUserDraft?.draftAction === DraftAction.REPLY_FAQ
    ) {
      const promises = Array.from(
        { length: isStaticTemplate ? numberOfGeneratedOptionsForStaticTemplates : numberOfGeneratedOptions },
        async () => {
          const response = await fetchDraftResponse(
            {
              tone,
              length: emailLength,
              language,
              promptInput: formattedUserDraft,
              senderName: senderName as string,
              senderAddress: senderEmail as string,
              draftId: draftId || "",
              emailThread,
              authToken: authToken || "",
              isReply,
              iteration,
              ...(templateId && { templateId, templateResponses }),
              useEmailContext,
              mode: mode || undefined,
              initialUserDraft: currentUserDraft?.initialDraft || undefined,
              from,
              recipients: recipients,
              ccRecipients: ccRecipients,
              recipientsName: recipientsName as string,
            },
            draftAction,
          );

          return response;
        },
      );

      let failedPromisesCount = 0;
      let settledPromisesCount = 0;
      const settlePromise = async (promise: Promise<Partial<Draft>>) => {
        try {
          const result = await promise;
          const updatedState = getState();
          const currentDraftId = updatedState.draft.draftId;

          //We check if the draftId of the request which initiate the process of generating drafts
          //is the same as the current draftId. If not, we don't update the state
          //This is to avoid updating the state from not the latest requests after conversation change
          if (currentDraftId !== draftId) {
            return {
              requestId: null,
              draftId: null,
            };
          }
          await dispatch(completeGeneratedDraftOption(result as Draft));

          return {
            requestId: result.request_id,
            draftId: draftId,
          };
        } catch (error) {
          availableDraftOptions = availableDraftOptions - 1;
          await dispatch(setAvailableDraftOptions(availableDraftOptions));
          failedPromisesCount++;
          return {
            requestId: null,
            draftId: null,
          };
        } finally {
          settledPromisesCount++;
        }
      };

      if (!creditAlreadyUsedOnCurrentDraftId) {
        dispatch(decreaseDraftsLeft());
        dispatch(setCreditAlreadyUsedOnCurrentDraftId(true));
      }

      promises.forEach(async (promise) => {
        const { requestId, draftId } = await settlePromise(promise);
        const updatedState = getState();
        const { screen } = updatedState.app;
        const updatedGeneratedDraftsIds = updatedState.draft.generatedDraftsIds;

        //All promises settled and no draftId means that item/conversation changed while loading drafts
        //We don't do anything in this case for this moment
        /* if (settledPromisesCount === promises.length && !draftId) {
          dispatch(setErrorTitle(errorTitle));
          dispatch(setErrorDescription(errorDescription()));
          dispatch(setScreen(Screen.DraftInput));
          Sentry.captureMessage(`All draft requests failed.`, "error");
        } */

        if (draftId) {
          if (requestId && updatedGeneratedDraftsIds.includes(requestId) && screen === Screen.Loading) {
            dispatch(setScreen(Screen.DraftOutput));
          }
          if (settledPromisesCount === promises.length) {
            if (failedPromisesCount === 3) {
              dispatch(setError("Cannot load draft options. Please try again."));
              console.error("Cannot load draft options. Please try again.");
              //Temporary, to be changed for a error screen
              dispatch(resetGeneratedDrafts());
              dispatch(resetUserDraft());
              dispatch(setTemplateId(null));
              dispatch(setErrorTitle(errorTitle));
              dispatch(setErrorDescription(errorDescription()));
              dispatch(setScreen(Screen.DraftInput));
              Sentry.captureMessage(`All draft requests failed.`, "error");
            }
            dispatch(setLoading(false));
          }
        }
      });
    }
  };

export const pasteToOutlookAction = () => async (dispatch: any, getState: () => RootState) => {
  const state = getState();
  const draftId = state.draft.draftId;
  const currentUserDraft = state.draft.userDraftHistory.find(
    (draft) =>
      draft.draftId === state.draft.draftId &&
      !draft.completed &&
      (state.draft.conversationId ? draft.conversationId === state.draft.conversationId : true),
  );
  const selectedDraftRequestId = state.draft.selectedDraftRequestId;
  const selectedDraft = state.draft.generatedDraftHistory.find((draft) => draft.requestId === selectedDraftRequestId);
  const authToken = state.auth.token;
  const userDetails = state.auth.userDetails;
  const mode = state.app.mode;
  const draftAction = state.app.draftAction;
  const isNative = isNativeApp();
  const fontPreferences = state.auth.userDetails?.profile.font_preferences;

  let mailMaestroOutputWithSignature = selectedDraft?.draft.mail_body as string;

  // Before pasting to outlook we need to add the previous thread and the
  // signature and convert to HTML
  mailMaestroOutputWithSignature = convertMarkdownToHTML(mailMaestroOutputWithSignature);
  if (!isNative) {
    mailMaestroOutputWithSignature = addBreakTagsBetweenPTags(mailMaestroOutputWithSignature);
  }

  if (mode === OfficeModes.WRITE_VIEW && draftAction === DraftAction.IMPROVE) {
    if (currentUserDraft?.previousThread || currentUserDraft?.signature) {
      mailMaestroOutputWithSignature =
        mailMaestroOutputWithSignature + "<br/>" + currentUserDraft?.previousThread + currentUserDraft?.signature;
    }
  }

  pasteToOutlook(
    mode,
    draftAction as DraftAction,
    mailMaestroOutputWithSignature,
    draftId as string,
    selectedDraft?.draft.request_id as string,
    authToken as string,
    selectedDraft?.draft.mail_subject as string,
    fontPreferences,
    userDetails as UserProfile,
  );
  dispatch(resetUserDraft());
  dispatch(resetGeneratedDrafts());
  dispatch(setTemplateId(""));
  dispatch(setScreen(Screen.Start));
};

export const copyToClipboardAction = () => async (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState();
  const draftId = state.draft.draftId;
  const selectedDraftRequestId = state.draft.selectedDraftRequestId;
  const selectedDraft = state.draft.generatedDraftHistory.find((draft) => draft.requestId === selectedDraftRequestId);
  const authToken = state.auth.token;
  const userDetails = state.auth.userDetails;
  const draftWithSignature = addAssistedByMailMaestroSignature(
    selectedDraft?.draft.mail_body as string,
    false,
    userDetails?.subscription?.maestro_promo as boolean,
    userDetails?.ganalytics_id as string,
  );

  if (authToken) {
    updateEmailStatuses(
      {
        draft_id: draftId || "",
        draft_status: "copied",
        request_id: selectedDraft?.draft.request_id as string,
        request_status: "accepted",
      },
      authToken,
    );
  }

  if (isMobileApp()) {
    // navigator clipboard api does not work in outlook mobile app
    // we use a workaround to copy the text to the clipboard
    // see: https://stackoverflow.com/a/60292243
    const textArea = document.createElement("textarea");
    try {
      textArea.value = draftWithSignature;

      // Move textarea out of the viewport so it's not visible
      textArea.style.position = "absolute";
      textArea.style.left = "-999999px";

      document.body.prepend(textArea);
      textArea.select();

      document.execCommand("copy");
    } catch (error) {
      console.error(error);
    } finally {
      textArea.remove();
    }
  } else {
    navigator.clipboard.writeText(draftWithSignature);
  }
  dispatch(resetUserDraft());
  dispatch(resetGeneratedDrafts());
  dispatch(setTemplateId(""));
  dispatch(setScreen(Screen.Start));
  dispatch(setAlertMessage("Copied to clipboard"));
  dispatch(setShowAlert(true));
};

export const setSelectedDraftAction = (index: number) => (dispatch: any, getState: () => RootState) => {
  const state = getState();
  const generatedDraftsIds = state.draft.generatedDraftsIds;
  const selectedDraftRequestId = generatedDraftsIds[index];
  dispatch(setSelectedDraft(selectedDraftRequestId));
};

export const setUserDraftForInputAction = (userDraft: string) => (dispatch: any, getState: () => RootState) => {
  const state = getState();
  const textShortcuts = state.textShortcuts.textShortcuts;
  const draftId = state.draft.draftId;
  const gaId = state.auth.userDetails?.ganalytics_id;
  const userDraftToStore = replaceTagsWithSnippets(userDraft, textShortcuts);
  if (userDraftToStore !== userDraft) {
    ReactGA.event(GA4_EVENTS.TEXT_SHORTCUT_REPLACED, {
      draftID: draftId,
      userID: gaId,
    });
  }
  dispatch(updateUserDraft(userDraftToStore));
};

export const restoreDrafts = (): ThunkAction<void, RootState, unknown, AnyAction> => async (dispatch, getState) => {
  const {
    draft: { conversationId, draftId, generatedDraftHistory, userDraftHistory },
    auth: { userDetails },
    app: { screen },
  } = getState();

  if (conversationId) {
    const generatedDraftIdsByConversationId = findGeneratedDraftsByConversationId(
      generatedDraftHistory,
      conversationId,
    );

    if (generatedDraftIdsByConversationId.length > 0) {
      const draftIdFromGeneratedDrafts = generatedDraftHistory.find(
        (draft) => draft.requestId === generatedDraftIdsByConversationId[0],
      )?.draftId;
      await dispatch(resetGeneratedDraftsIds());
      await dispatch(setSelectedDraft(null));
      await dispatch(setDraftId(draftIdFromGeneratedDrafts as string));

      for (const draftId of generatedDraftIdsByConversationId) {
        await dispatch(addGeneratedDraftIdToCurrentDraft(draftId));
      }

      await dispatch(setScreen(Screen.DraftOutput));
      ReactGA.event(GA4_EVENTS.GENERATED_EMAIL_RESTORED, {
        draftID: draftId,
        userID: userDetails?.ganalytics_id,
      });
    } else {
      const userDraftFromConversation = findUserDraftByConversationId(userDraftHistory, conversationId);

      if (userDraftFromConversation) {
        if (
          (userDraftFromConversation.draftAction as DraftAction) !== DraftAction.TIMESLOTS_ACCEPT &&
          !userDraftFromConversation.isFromRapidReply &&
          screen !== Screen.MagicTemplates &&
          (userDetails?.subscription?.type !== "FREE" || (userDetails?.subscription?.drafts_left ?? 0) > 0)
        ) {
          await dispatch(setScreen(Screen.DraftInput));
        }
        await dispatch(setDraftId(userDraftFromConversation.draftId));
        await dispatch(setDraftAction(userDraftFromConversation.draftAction));
        if (userDraftFromConversation.templateId) {
          await dispatch(setTemplateId(userDraftFromConversation.templateId));
        }
        ReactGA.event(GA4_EVENTS.USER_DRAFT_RESTORED, {
          draftID: draftId,
          userID: userDetails?.ganalytics_id,
        });
      }
    }
  }
};

export const selectNewConversation =
  (
    newConversationId: string | null,
    newItemId: string | null | undefined,
    newMode?: OfficeModes,
    isReply?: boolean,
  ): ThunkAction<void, RootState, unknown, AnyAction> =>
  async (dispatch, getState: () => RootState) => {
    const state = getState();
    const conversationId = state.draft.conversationId;
    const itemId = state.app.itemId;
    const screen = state.app.screen;

    if (newConversationId !== conversationId) {
      const item = await getItem(newItemId as string);
      dispatch(setItem(item));
      const subject = await getSubject(item);
      dispatch(setSubject(subject));

      const recipients = await getRecipients(item);

      dispatch(setFrom(recipients?.from || null));
      dispatch(setRecipients(recipients?.to || []));
      dispatch(setCCRecipients(recipients?.cc || []));

      const conversationIdToStore = newConversationId || NEW_EMAIL_CONVERSATION_ID;
      dispatch(setConversationId(conversationIdToStore));
      const isReplyCalc = isReply !== undefined ? isReply : !!newConversationId;
      dispatch(setIsReply(isReplyCalc));
      if (newMode) {
        dispatch(setMode(newMode));
      }

      // Don't reset screen if we are in debug mode or we are in a new conversation
      if (screen !== Screen.Debug && conversationId !== NEW_EMAIL_CONVERSATION_ID) {
        dispatch(setScreen(Screen.Start));
      }
      dispatch(setSummaryRequestId(null));
      dispatch(setOneSentenceSummaryRequestId(null));
      dispatch(setDraftAction(null));
      dispatch(setDraftId(null));
      dispatch(setTemplateId(null));
      dispatch(changeConversation());
    }

    if (newItemId !== itemId) {
      dispatch(setItemId(newItemId as string));
    }
  };

export const handleDraftFromOutlook =
  (inputFromOutlook: string, prevThread: string, signature: string): ThunkAction<void, RootState, unknown, AnyAction> =>
  async (dispatch: any, getState: () => RootState) => {
    const state = getState();
    const currentUserDraft = state.draft.userDraftHistory.find(
      (draft) =>
        draft.draftId === state.draft.draftId &&
        !draft.completed &&
        (state.draft.conversationId ? draft.conversationId === state.draft.conversationId : true),
    );
    const draftAction = state.app.draftAction;

    if (inputFromOutlook && !currentUserDraft?.userDraft && draftAction === DraftAction.IMPROVE) {
      const formattedInput = convertHTMLToText(inputFromOutlook);
      //Store empty draft instead of corresponding html empty draft to show placeholder
      const inputToStore = formattedInput === "" ? formattedInput : inputFromOutlook;
      dispatch(
        officeDraftReceived({
          draftFromOffice: inputToStore,
          previousThread: prevThread,
          signature: signature,
        }),
      );
    }
    if (inputFromOutlook && draftAction !== DraftAction.IMPROVE) {
      dispatch(
        officeDraftReceived({
          draftFromOffice: "",
          previousThread: "",
          signature: "",
        }),
      );
    }
  };
