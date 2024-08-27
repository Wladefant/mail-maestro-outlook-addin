import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import ReactGA from "react-ga4";
import { toneOptions } from "../../components/Common/UserInput/components/EmailStyleSelector/types";
import { completedListOfLanguageOptions } from "../../components/Common/UserInput/components/LanguageSelector/types";
import { EmailLength, EmailLengthValues } from "../../components/Common/UserInput/components/LengthSelector/types";
import { EventResponse } from "../../hooks/usePusher";
import { GA4_EVENTS } from "../../utils/events";
import { replaceSingleLinebreaksWithDouble } from "../../utils/string";
import { setEmailLengthAction, setLanguageAction, setToneAction } from "../actions/draftActions";
import { RootState } from "../store";
import { DraftAction } from "./AppReducer";
import { convertHTMLToText } from "../../utils/html";
import { trimArrayToMaxElements } from "../../utils/array";
import { createSelector } from "reselect";

export interface ControlChangeRequest {
  userId: string;
  [key: string]: string;
}

export type StoredUserDraft = {
  draftId: string;
  conversationId?: string;
  userDraft: string;
  initialDraft?: string;
  completed?: boolean;
  draftAction: DraftAction;
  previousThread?: string;
  signature?: string;
  templateId?: string;
  recipientsName?: string;
  isFromRapidReply?: boolean;
};

export type StoredGeneratedDraft = {
  draftId: string;
  conversationId?: string;
  requestId: string;
  draft: Draft;
  completed?: boolean;
};

export interface Draft {
  mail_body: string;
  mail_subject?: string;
  request_id: string;
  frame_index?: number;
  finished?: boolean;
  edited?: boolean;
  formatted_html_body?: string;
  formatted_string_body?: string;
  references?: string[];
}

interface DraftState {
  draftId: string | null;
  userDraftHistory: StoredUserDraft[];
  generatedDraftHistory: StoredGeneratedDraft[];
  generatedDraftsIds: string[];
  selectedDraftRequestId: string | null;
  error: string | null;
  isLoading: boolean;
  tone: string;
  language: string;
  emailLength: EmailLength;
  availableDraftOptions: number;
  recipientsName: string | null;
  conversationId: string | null;
  showDraftOptions: boolean;
  creditAlreadyUsedOnCurrentDraftId: boolean;
}

const initialState: DraftState = {
  draftId: null,
  userDraftHistory: [],
  generatedDraftHistory: [],
  generatedDraftsIds: [],
  selectedDraftRequestId: null,
  error: null,
  isLoading: false,
  tone: toneOptions[1].key as string,
  language: "xx",
  emailLength: EmailLengthValues.Short,
  availableDraftOptions: 3,
  recipientsName: null,
  conversationId: null,
  showDraftOptions: false,
  creditAlreadyUsedOnCurrentDraftId: false,
};

export const draftSlice = createSlice({
  name: "draft",
  initialState,
  reducers: {
    setDraftId(state, action: PayloadAction<string | null>) {
      state.draftId = action.payload;
    },
    setUserDraftHistory(state, action: PayloadAction<StoredUserDraft[]>) {
      state.userDraftHistory = action.payload;
    },
    setGeneratedDraftHistory(state, action: PayloadAction<StoredGeneratedDraft[]>) {
      state.generatedDraftHistory = action.payload;
    },
    setGeneratedDraftsIds(state, action: PayloadAction<string[]>) {
      state.generatedDraftsIds = action.payload;
    },
    addUserDraft(state, action: PayloadAction<StoredUserDraft>) {
      const alreadyStoredUserDraft = state.userDraftHistory.find(
        (draft) =>
          !draft.completed &&
          draft.draftId === state.draftId &&
          (state.conversationId ? draft.conversationId === state.conversationId : true),
      );
      if (!alreadyStoredUserDraft && state.draftId && action.payload.draftId === state.draftId) {
        state.userDraftHistory.push(action.payload);
        state.userDraftHistory = trimArrayToMaxElements(state.userDraftHistory);
      }
    },
    updateUserDraft(state, action: PayloadAction<string>) {
      const currentUserDraft = state.userDraftHistory.find(
        (draft) =>
          draft.draftId === state.draftId &&
          !draft.completed &&
          (state.conversationId ? draft.conversationId === state.conversationId : true),
      );

      if (currentUserDraft) {
        currentUserDraft.userDraft = action.payload;
      }
    },
    updateUserDraftTemplateId(state, action: PayloadAction<string>) {
      const currentUserDraft = state.userDraftHistory.find(
        (draft) =>
          draft.draftId === state.draftId &&
          !draft.completed &&
          (state.conversationId ? draft.conversationId === state.conversationId : true),
      );

      if (currentUserDraft) {
        currentUserDraft.templateId = action.payload;
      }
    },
    updateUserDraftRecipientsName(state, action: PayloadAction<string>) {
      const currentUserDraft = state.userDraftHistory.find(
        (draft) =>
          draft.draftId === state.draftId &&
          !draft.completed &&
          (state.conversationId ? draft.conversationId === state.conversationId : true),
      );

      if (currentUserDraft) {
        currentUserDraft.recipientsName = action.payload;
      }
    },
    addGeneratedDraftIdToCurrentDraft(state, action: PayloadAction<string>) {
      if (!state.generatedDraftsIds.includes(action.payload)) {
        state.generatedDraftsIds.push(action.payload);
      }
      state.generatedDraftsIds = trimArrayToMaxElements(state.generatedDraftsIds);
    },
    resetGeneratedDraftsIds(state) {
      state.generatedDraftsIds = [];
    },
    setSelectedDraft(state, action: PayloadAction<string | null>) {
      state.selectedDraftRequestId = action.payload;
    },
    changeConversation(state) {
      const displayedGeneratedDrafts = state.generatedDraftHistory.filter(
        (draft) =>
          state.generatedDraftsIds.includes(draft.requestId) &&
          (draft.conversationId ? draft.conversationId === state.conversationId : true),
      );
      /* In case of changing conversation while loading drafts, we remove those drafts not finished */
      if (!displayedGeneratedDrafts.every((draft) => draft.draft.finished)) {
        state.generatedDraftHistory = state.generatedDraftHistory.filter(
          (draft) => !state.generatedDraftsIds.includes(draft.requestId),
        );
      }
      state.generatedDraftHistory = state.generatedDraftHistory.filter((draft) => !draft.completed);
      state.userDraftHistory = state.userDraftHistory.filter(
        (draft) =>
          (draft.userDraft !== "" || draft.templateId || draft.draftAction === DraftAction.TIMESLOTS_ACCEPT) &&
          !draft.completed,
      );
    },
    resetGeneratedDrafts(state) {
      const displayedGeneratedDrafts = state.generatedDraftHistory.filter(
        (draft) =>
          state.generatedDraftsIds.includes(draft.requestId) &&
          (draft.conversationId ? draft.conversationId === state.conversationId : true),
      );
      displayedGeneratedDrafts.forEach((draft) => {
        draft.completed = true;
      });
      state.generatedDraftHistory = state.generatedDraftHistory.filter((draft) => !draft.completed);
      state.generatedDraftsIds = initialState.generatedDraftsIds;
      state.selectedDraftRequestId = initialState.selectedDraftRequestId;

      // We check for the current user draft and set isFromRapidReply to false just in case
      // because we only use that property when creating a new draft to avoid
      // showing the input draft screen when using rapid reply feature.
      const currentUserDraft = state.userDraftHistory.find(
        (draft) =>
          draft.draftId === state.draftId &&
          !draft.completed &&
          (draft.conversationId ? draft.conversationId === state.conversationId : true),
      );
      if (currentUserDraft) {
        currentUserDraft.isFromRapidReply = false;
      }
    },
    resetUserDraft(state) {
      const currentUserDraft = state.userDraftHistory.find(
        (draft) =>
          draft.draftId === state.draftId &&
          !draft.completed &&
          (draft.conversationId ? draft.conversationId === state.conversationId : true),
      );
      if (currentUserDraft) {
        currentUserDraft.completed = true;
      }

      state.userDraftHistory = state.userDraftHistory.filter(
        (draft) =>
          ((draft.userDraft !== "" && draft.userDraft !== "<p><br></p>") ||
            draft.templateId ||
            draft.draftAction === DraftAction.TIMESLOTS_ACCEPT) &&
          !draft.completed,
      );
      state.error = initialState.error;
      state.isLoading = initialState.isLoading;

      state.recipientsName = initialState.recipientsName;
    },
    updateSelectedDraftMarkdownBody(state, action: PayloadAction<string>) {
      const selectedDraft = state.generatedDraftHistory.find(
        (draft) => draft.requestId === state.selectedDraftRequestId,
      );

      if (selectedDraft) {
        selectedDraft.draft.mail_body = action.payload;
      }
    },
    updateSelectedDraftHtmlBody(state, action: PayloadAction<string>) {
      const selectedDraft = state.generatedDraftHistory.find(
        (draft) => draft.requestId === state.selectedDraftRequestId,
      );

      if (selectedDraft) {
        selectedDraft.draft.formatted_html_body = action.payload;
      }
    },
    updateSelectedDraftStringBody(state, action: PayloadAction<string>) {
      const selectedDraft = state.generatedDraftHistory.find(
        (draft) => draft.requestId === state.selectedDraftRequestId,
      );

      if (selectedDraft) {
        selectedDraft.draft.formatted_string_body = action.payload;
      }
    },
    updateSelectedDraftEdition(state) {
      const selectedDraft = state.generatedDraftHistory.find(
        (draft) => draft.requestId === state.selectedDraftRequestId,
      );

      if (selectedDraft) {
        selectedDraft.draft.edited = true;
      }
    },
    completeGeneratedDraftOption(state, action: PayloadAction<Partial<Draft>>) {
      const draftIndex = state.generatedDraftHistory.findIndex(
        (request) => request.requestId === action.payload.request_id,
      );

      if (draftIndex && !state.generatedDraftsIds.includes(action.payload?.request_id as string)) {
        state.generatedDraftsIds.push(action.payload?.request_id as string);
        state.generatedDraftHistory = trimArrayToMaxElements(state.generatedDraftHistory);
      }

      if (draftIndex >= 0) {
        state.generatedDraftHistory[draftIndex].draft.mail_body = replaceSingleLinebreaksWithDouble(
          action.payload.mail_body as string,
        );
        state.generatedDraftHistory[draftIndex].draft.mail_subject = action.payload.mail_subject as string;
        state.generatedDraftHistory[draftIndex].draft.finished = true;
        state.generatedDraftHistory[draftIndex].draft.references = action.payload.references;
      } else {
        state.generatedDraftHistory.push({
          draftId: state.draftId as string,
          requestId: action.payload.request_id as string,
          conversationId: state.conversationId as string,
          draft: {
            mail_body: replaceSingleLinebreaksWithDouble(action.payload.mail_body as string),
            mail_subject: action.payload.mail_subject as string,
            request_id: action.payload.request_id as string,
            finished: true,
            edited: false,
            formatted_html_body: "",
            formatted_string_body: "",
            references: action.payload.references,
          },
        });
        state.generatedDraftHistory = trimArrayToMaxElements(state.generatedDraftHistory);
      }
    },
    addFrameToDraft(
      state,
      action: PayloadAction<{
        eventResponse: EventResponse;
        conversationId?: string;
      }>,
    ) {
      const alreadyStoredDraft = state.generatedDraftHistory.find(
        (draft) => draft.requestId === action.payload.eventResponse.request_id,
      );
      if (!alreadyStoredDraft) {
        state.generatedDraftHistory.push({
          draftId: state.draftId as string,
          requestId: action.payload.eventResponse.request_id,
          conversationId: action.payload.conversationId,
          draft: {
            mail_body: "",
            mail_subject: "",
            request_id: action.payload.eventResponse.request_id,
            frame_index: action.payload.eventResponse.frame_index,
            finished: false,
            edited: false,
            formatted_html_body: "",
            formatted_string_body: "",
          },
        });
        state.generatedDraftHistory = trimArrayToMaxElements(state.generatedDraftHistory);
        state.generatedDraftsIds.push(action.payload.eventResponse.request_id);
        state.generatedDraftsIds = trimArrayToMaxElements(state.generatedDraftsIds);
      }

      const draftIndex = state.generatedDraftHistory.findIndex(
        (request) => request.requestId === action.payload.eventResponse.request_id,
      );

      if (draftIndex >= 0) {
        const isFromCorrectDraft = state.draftId === action.payload.eventResponse.draft_id;
        const requestIsAlreadyFinished = state.generatedDraftHistory[draftIndex].draft.finished || false;
        const currentFrameIndex = state.generatedDraftHistory[draftIndex].draft.frame_index || 0;
        if (
          isFromCorrectDraft &&
          !requestIsAlreadyFinished &&
          action.payload.eventResponse.frame_index >= currentFrameIndex &&
          state.generatedDraftHistory[draftIndex]
        ) {
          state.generatedDraftHistory[draftIndex].draft.mail_body = replaceSingleLinebreaksWithDouble(
            action.payload.eventResponse.content,
          );
          state.generatedDraftHistory[draftIndex].draft.finished = action.payload.eventResponse.last_frame;
          state.generatedDraftHistory[draftIndex].draft.frame_index = action.payload.eventResponse.frame_index;
        }
      }
    },
    setTone: (state, action: PayloadAction<string>) => {
      state.tone = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setEmailLength: (state, action: PayloadAction<EmailLength>) => {
      state.emailLength = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAvailableDraftOptions: (state, action: PayloadAction<number>) => {
      state.availableDraftOptions = action.payload;
    },
    officeDraftReceived(
      state,
      action: PayloadAction<{
        draftFromOffice: string;
        signature: string;
        previousThread: string;
      }>,
    ) {
      const currentUserDraft = state.userDraftHistory.find(
        (draft) => draft.draftId === state.draftId && !draft.completed,
      );

      if (currentUserDraft && !currentUserDraft.userDraft) {
        currentUserDraft.userDraft = action.payload.draftFromOffice;
        currentUserDraft.initialDraft = convertHTMLToText(action.payload.draftFromOffice);
        currentUserDraft.signature = action.payload.signature;
        currentUserDraft.previousThread = action.payload.previousThread;
      }
    },
    updateRecipientsName(state, action: PayloadAction<string>) {
      state.recipientsName = action.payload;
    },
    setConversationId(state, action: PayloadAction<string | null>) {
      state.conversationId = action.payload;
    },
    setShowDraftOptions(state, action: PayloadAction<boolean>) {
      state.showDraftOptions = action.payload;
    },
    setCreditAlreadyUsedOnCurrentDraftId(state, action: PayloadAction<boolean>) {
      state.creditAlreadyUsedOnCurrentDraftId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setToneAction, (state, action: PayloadAction<ControlChangeRequest>) => {
        ReactGA.event(GA4_EVENTS.SET_TONE, {
          draftID: state.draftId,
          userID: action.payload.userId,
        });
        state.tone = action.payload.tone;
      })
      .addCase(setLanguageAction, (state, action: PayloadAction<ControlChangeRequest>) => {
        ReactGA.event(GA4_EVENTS.SET_LANGUAGE, {
          draftID: state.draftId,
          userID: action.payload.userId,
        });
        state.language = action.payload.language;
      })
      .addCase(setEmailLengthAction, (state, action: PayloadAction<ControlChangeRequest>) => {
        ReactGA.event(GA4_EVENTS.SET_EMAIL_LENGTH, {
          draftID: state.draftId,
          userID: action.payload.userId,
        });
        state.emailLength = action.payload.emailLength as EmailLength;
      });
  },
});

export const selectUserDrafts = (state: RootState) => state.draft.userDraftHistory;
export const selectCurrentUserDraft = (state: RootState) => {
  const conversationId = state.draft.conversationId;

  const currentUserDraft = state.draft.userDraftHistory.find(
    (draft) =>
      !draft.completed &&
      draft.draftId === state.draft.draftId &&
      (conversationId ? draft.conversationId === conversationId : true),
  );
  if (currentUserDraft) {
    return currentUserDraft;
  }
  return null;
};
export const selectRequestIdFromSelectedGeneratedDraft = (state: RootState) => state.draft.selectedDraftRequestId;
export const selectGeneratedDrafts = (state: RootState) => state.draft.generatedDraftHistory;
export const selectDisplayedGeneratedDraftsRequestIds = (state: RootState) => state.draft.generatedDraftsIds;

const selectGeneratedDraftsIds = (state: RootState) => state.draft.generatedDraftsIds;
const selectGeneratedDraftHistory = (state: RootState) => state.draft.generatedDraftHistory;
export const selectDisplayedGeneratedDrafts = createSelector(
  [selectGeneratedDraftsIds, selectGeneratedDraftHistory],
  (generatedDraftsIds, generatedDraftHistory) => {
    const orderMap = new Map(generatedDraftsIds.map((id, index) => [id, index]));

    const filteredDrafts = generatedDraftHistory.filter((draft) => generatedDraftsIds.includes(draft.requestId));

    return filteredDrafts.sort((a, b) => {
      const indexA = orderMap.get(a.requestId);
      const indexB = orderMap.get(b.requestId);

      if (indexA === undefined || indexB === undefined) {
        return 0;
      }

      return indexA - indexB;
    });
  },
);

export const selectDisplayedGeneratedDraftByIndex = (index: number) => (state: RootState) => {
  const requestId = state.draft.generatedDraftsIds[index];
  const selectedDraft = state.draft.generatedDraftHistory.find(
    (draft) =>
      draft.requestId === requestId &&
      !draft.completed &&
      (state.draft.conversationId ? draft.conversationId === state.draft.conversationId : true),
  );

  if (selectedDraft) {
    return selectedDraft;
  }
  return null;
};
export const selectRequestIdIndexOfSelectedGeneratedDraft = (state: RootState) => {
  const selectedDraft = state.draft.generatedDraftHistory.find(
    (draft) =>
      draft.requestId === state.draft.selectedDraftRequestId &&
      !draft.completed &&
      (state.draft.conversationId ? draft.conversationId === state.draft.conversationId : true),
  );

  if (selectedDraft) {
    return state.draft.generatedDraftsIds.indexOf(selectedDraft.requestId);
  }
  return null;
};
export const selectSelectedGeneratedDraft = (state: RootState) => {
  const selectedDraft = state.draft.generatedDraftHistory.find(
    (draft) => draft.requestId === state.draft.selectedDraftRequestId,
  );

  if (selectedDraft) {
    return selectedDraft;
  }
  return null;
};
export const selectAvailableDraftOptions = (state: RootState) => state.draft.availableDraftOptions;
export const selectIsLoading = (state: RootState) => state.draft.isLoading;
export const selectDisableDraftButtons = (state: RootState) => {
  const selectedDraft = state.draft.generatedDraftHistory.find(
    (draft) => draft.requestId === state.draft.selectedDraftRequestId,
  );

  if (selectedDraft) {
    return !selectedDraft.draft.finished;
  }
  return false;
};
export const selectDraftId = (state: RootState) => state.draft.draftId;
export const selectRecipientsName = (state: RootState) => state.draft.recipientsName;
export const selectConversationId = (state: RootState) => state.draft.conversationId;
export const selectShowDraftOptions = (state: RootState) => state.draft.showDraftOptions;

export const {
  setDraftId,
  addUserDraft,
  addGeneratedDraftIdToCurrentDraft,
  setSelectedDraft,
  resetUserDraft,
  resetGeneratedDrafts,
  updateSelectedDraftMarkdownBody,
  updateSelectedDraftHtmlBody,
  updateSelectedDraftStringBody,
  updateSelectedDraftEdition,
  completeGeneratedDraftOption,
  addFrameToDraft,
  setTone,
  setLanguage,
  setEmailLength,
  setError,
  setLoading,
  setAvailableDraftOptions,
  officeDraftReceived,
  updateRecipientsName,
  updateUserDraft,
  resetGeneratedDraftsIds,
  setConversationId,
  changeConversation,
  updateUserDraftTemplateId,
  updateUserDraftRecipientsName,
  setUserDraftHistory,
  setGeneratedDraftHistory,
  setGeneratedDraftsIds,
  setShowDraftOptions,
  setCreditAlreadyUsedOnCurrentDraftId,
} = draftSlice.actions;

export default draftSlice.reducer;
