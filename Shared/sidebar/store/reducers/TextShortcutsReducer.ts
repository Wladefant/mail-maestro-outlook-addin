import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchUserTextShortcuts } from "../actions/textShortcutsActions";
import { RootState } from "../store";
import { Delta } from "quill";
import { Screen } from "./AppReducer";

export type TextShortcut = {
  id: string;
  tag: string;
  snippet: string;
};

interface TextShortcutsState {
  textShortcuts: TextShortcut[];
  isLoading: boolean;
  showDialog: boolean;
  showEditingDialog: boolean;
  currentCursorIndex: number;
  deltaChange: Delta | null;
  previousScreen: Screen | null;
}

const initialState: TextShortcutsState = {
  textShortcuts: [],
  isLoading: false,
  showDialog: false,
  showEditingDialog: false,
  currentCursorIndex: 0,
  deltaChange: null,
  previousScreen: null,
};

const textShortcutsSlice = createSlice({
  name: "textShortcuts",
  initialState,
  reducers: {
    setTextShortcuts: (state, action: PayloadAction<TextShortcut[]>) => {
      state.textShortcuts = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setShowDialog: (state, action: PayloadAction<boolean>) => {
      state.showDialog = action.payload;
    },
    setShowEditingDialog: (state, action: PayloadAction<boolean>) => {
      state.showEditingDialog = action.payload;
    },
    addTextShortcut: (state, action: PayloadAction<TextShortcut>) => {
      state.textShortcuts.push(action.payload);
    },
    editTextShortcut: (state, action: PayloadAction<TextShortcut>) => {
      const index = state.textShortcuts.findIndex((textShortcut) => textShortcut.id === action.payload.id);
      if (index > -1) {
        state.textShortcuts[index] = action.payload;
      }
    },
    setCurrentCursorIndex: (state, action: PayloadAction<number>) => {
      state.currentCursorIndex = action.payload;
    },
    setDeltaChange: (state, action: PayloadAction<Delta | null>) => {
      state.deltaChange = action.payload;
    },
    setPreviousScreen: (state, action: PayloadAction<Screen | null>) => {
      state.previousScreen = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserTextShortcuts.fulfilled, (state, action: PayloadAction<TextShortcut[]>) => {
        if (action.payload) {
          state.textShortcuts = action.payload;
          state.isLoading = false;
        }
      })
      .addCase(fetchUserTextShortcuts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserTextShortcuts.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const {
  setTextShortcuts,
  setIsLoading,
  setShowDialog,
  addTextShortcut,
  editTextShortcut,
  setShowEditingDialog,
  setCurrentCursorIndex,
  setDeltaChange,
  setPreviousScreen,
} = textShortcutsSlice.actions;

export const selectTextShortcuts = (state: RootState) => state.textShortcuts.textShortcuts;
export const selectIsLoading = (state: RootState) => state.textShortcuts.isLoading;
export const selectShowDialog = (state: RootState) => state.textShortcuts.showDialog;
export const selectShowEditingDialog = (state: RootState) => state.textShortcuts.showEditingDialog;
export const selectCurrentCursorIndex = (state: RootState) => state.textShortcuts.currentCursorIndex;
export const selectDeltaChange = (state: RootState) => state.textShortcuts.deltaChange;
export const selectPreviousScreen = (state: RootState) => state.textShortcuts.previousScreen;

export default textShortcutsSlice.reducer;
