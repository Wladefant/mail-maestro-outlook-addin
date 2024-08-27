import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { OfficeModes } from "@platformSpecific/sidebar/hooks/usePlatformMetadata";
import { RootState } from "../store";
import { Location } from "react-router-dom";

export enum Screen {
  Start = "start",
  DraftInput = "draftInput",
  DraftOutput = "draftOutput",
  Summary = "summary",
  AttachmentsSummary = "attachmentsSummary",
  Loading = "loading",
  TextShortcuts = "textShortcuts",
  Unauthenticate = "unauthenticate",
  SignInScreen = "signInScreen",
  Debug = "debug",
  MagicTemplates = "magicTemplates",
  FontPreferences = "fontPreferences",
  SubscriptionExpired = "subscriptionExpired",
}

export enum DraftAction {
  IMPROVE = "improve",
  REPLY = "reply",
  COMPOSE = "compose",
  TIMESLOTS_ACCEPT = "timeslots_extractor",
  RAPID_REPLY = "rapid_reply",
  FORWARD = "forward",
  REPLY_FAQ = "reply_faq",
}

export type Recipient = {
  emailAddress: string;
  displayName: string;
};

interface AppState {
  screen: Screen;
  item: any | null;
  mode: OfficeModes | null;
  isReply: boolean;
  subject: string;
  iteration: number;
  previousScreen?: Screen;
  draftAction: DraftAction | null;
  itemId: string | null;
  useEmailContext: boolean;
  from: Recipient | null;
  recipients: Recipient[];
  ccRecipients: Recipient[];
  zoomLevel: number;
  alertMessage: string | null;
  showAlert: boolean;
  errorTitle: string | null | JSX.Element;
  errorDescription: string | null | JSX.Element;
  previousLocation?: Location;
}

const initialState: AppState = {
  screen: Screen.Start,
  item: null,
  mode: null,
  isReply: false,
  subject: "",
  iteration: 1,
  draftAction: null,
  itemId: null,
  useEmailContext: true,
  from: null,
  recipients: [],
  ccRecipients: [],
  zoomLevel: 100,
  alertMessage: null,
  showAlert: false,
  errorTitle: null,
  errorDescription: null,
  previousLocation: undefined,
};

const AppSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setScreen(state, action: PayloadAction<Screen>) {
      state.previousScreen = state.screen;
      state.screen = action.payload;
    },
    setItem(state, action: PayloadAction<any>) {
      state.item = action.payload;
    },
    setMode(state, action: PayloadAction<OfficeModes>) {
      state.mode = action.payload;
    },
    setIsReply(state, action: PayloadAction<boolean>) {
      state.isReply = action.payload;
    },
    setSubject(state, action: PayloadAction<string>) {
      state.subject = action.payload;
    },
    setFrom(state, action: PayloadAction<Recipient>) {
      state.from = action.payload;
    },
    setRecipients(state, action: PayloadAction<Recipient[]>) {
      state.recipients = action.payload;
    },
    setCCRecipients(state, action: PayloadAction<Recipient[]>) {
      state.ccRecipients = action.payload;
    },
    incrementIteration: (state) => {
      state.iteration += 1;
    },
    setDraftAction(state, action: PayloadAction<DraftAction | null>) {
      state.draftAction = action.payload;
    },
    setItemId(state, action: PayloadAction<string>) {
      state.itemId = action.payload;
    },
    setUseEmailContext(state, action: PayloadAction<boolean>) {
      state.useEmailContext = action.payload;
    },
    setZoomLevel(state, action: PayloadAction<number>) {
      state.zoomLevel = action.payload;
    },
    setAlertMessage(state, action: PayloadAction<string | null>) {
      state.alertMessage = action.payload;
    },
    setShowAlert(state, action: PayloadAction<boolean>) {
      state.showAlert = action.payload;
    },
    setErrorTitle(state, action: PayloadAction<string | null | JSX.Element>) {
      state.errorTitle = action.payload;
    },
    setErrorDescription(state, action: PayloadAction<string | null | JSX.Element>) {
      state.errorDescription = action.payload;
    },
    setPreviousLocation(state, action: PayloadAction<Location>) {
      state.previousLocation = action.payload;
    },
  },
});

export const selectScreen = (state: RootState) => state.app.screen;
export const selectItem = (state: RootState) => state.app.item;
export const selectMode = (state: RootState) => state.app.mode;
export const selectIsReply = (state: RootState) => state.app.isReply;
export const selectSubject = (state: RootState) => state.app.subject;
export const selectIteration = (state: RootState) => state.app.iteration;
export const selectPreviousScreen = (state: RootState) => state.app.previousScreen;
export const selectDraftAction = (state: RootState) => state.app.draftAction;

export const selectUseEmailContext = (state: RootState) => state.app.useEmailContext;
export const selectItemId = (state: RootState) => state.app.itemId;
export const selectZoomLevel = (state: RootState) => state.app.zoomLevel;
export const selectAlertMessage = (state: RootState) => state.app.alertMessage;
export const selectShowAlert = (state: RootState) => state.app.showAlert;
export const selectErrorTitle = (state: RootState) => state.app.errorTitle;
export const selectErrorDescription = (state: RootState) => state.app.errorDescription;
export const selectPreviousLocation = (state: RootState) => state.app.previousLocation; // Add selector for previousLocation

export const {
  setIsReply,
  setScreen,
  setItem,
  setMode,
  setSubject,
  setFrom,
  setRecipients,
  setCCRecipients,
  incrementIteration,
  setDraftAction,
  setUseEmailContext,
  setItemId,
  setZoomLevel,
  setAlertMessage,
  setShowAlert,
  setErrorTitle,
  setErrorDescription,
  setPreviousLocation,
} = AppSlice.actions;

export default AppSlice.reducer;
