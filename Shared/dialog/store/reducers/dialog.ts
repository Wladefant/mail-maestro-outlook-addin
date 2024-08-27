import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SettingsModule } from "../../components/Screens/Settings";

export enum DialogScreen {
  FIRSTRUN = "FIRSTRUN",
  SIGNOFFANDSIGNATURE = "SIGNOFFANDSIGNATURE",
  MAGICTEMPLATEBUILDER = "MAGICTEMPLATEBUILDER",
  CUSTOMINSTRUCTIONS = "CUSTOMINSTRUCTIONS",
  SETTINGS = "SETTINGS",
}

interface DialogState {
  action: string | null;
  draftId: string | null;
  email: string | null;
  emailThread: string | null;
  isReply: boolean | null;
  name: string | null;
  token: string | null;
  screen: DialogScreen | null;
  settingsModule: SettingsModule | null;
}

const initialState: DialogState = {
  action: null,
  draftId: null,
  email: null,
  emailThread: null,
  isReply: null,
  name: null,
  token: null,
  screen: null,
  settingsModule: null,
};

export const dialogSlice = createSlice({
  name: "dialog",
  initialState,
  reducers: {
    setDialogData: (state, action: PayloadAction<DialogState>) => {
      state.action = action.payload.action;
      state.draftId = action.payload.draftId;
      state.email = action.payload.email;
      state.emailThread = action.payload.emailThread;
      state.isReply = action.payload.isReply;
      state.name = action.payload.name;
      state.token = action.payload.token;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    setDialogScreen: (state, action: PayloadAction<DialogScreen | null>) => {
      state.screen = action.payload;
    },
    setSettingsModule: (state, action: PayloadAction<SettingsModule>) => {
      state.settingsModule = action.payload;
    },
  },
});

export const { setDialogData, setToken, setDialogScreen, setSettingsModule } = dialogSlice.actions;

export const selectToken = (state: any) => state.dialog.token;
export const selectDialogScreen = (state: any) => state.dialog.screen;
export const selectSettingsModule = (state: any) => state.dialog.settingsModule;

export default dialogSlice.reducer;
