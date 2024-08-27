import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Prompt } from "../../components/Common/PromptHistory/types";
import { RootState } from "../store";
import { trimArrayToMaxElements } from "../../utils/array";

interface PromptHistoryState {
  storedPrompts: Prompt[];
  dialogOpen: boolean;
}

const initialState: PromptHistoryState = {
  storedPrompts: [],
  dialogOpen: false,
};

const MAX_PROMPT_HISTORY_NUMBER = 20;

const promptHistorySlice = createSlice({
  name: "promptHistory",
  initialState,
  reducers: {
    updatePromptHistory: (state, action: PayloadAction<Prompt[]>) => {
      state.storedPrompts = action.payload;
      state.storedPrompts = trimArrayToMaxElements(state.storedPrompts, MAX_PROMPT_HISTORY_NUMBER);
    },
    setDialogState: (state, action: PayloadAction<boolean>) => {
      state.dialogOpen = action.payload;
    },
    getPromptHistory: (state, action: PayloadAction<string>) => {
      const email = action.payload;
      const storedPromptHistory = localStorage.getItem(`promptHistory_${email}`);
      if (storedPromptHistory) {
        state.storedPrompts = JSON.parse(storedPromptHistory);
      } else {
        state.storedPrompts = [];
      }
    },
  },
});

export const { updatePromptHistory, getPromptHistory, setDialogState } = promptHistorySlice.actions;

export const selectPromptDialogOpen = (state: RootState) => state.promptHistory.dialogOpen;

export const selectPromptHistory = (state: RootState) => state.promptHistory.storedPrompts;

export default promptHistorySlice.reducer;
