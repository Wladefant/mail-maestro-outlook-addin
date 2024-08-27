import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TextShortcut } from "../../../sidebar/store/reducers/TextShortcutsReducer";
import { fetchUserTextShortcuts } from "../actions/textShortcuts";
import { RootState } from "../store";

interface TextShortcutsState {
  textShortcuts: TextShortcut[];
  isLoading: boolean;
  showEditingForm: boolean;
}

const initialState: TextShortcutsState = {
  textShortcuts: [],
  isLoading: false,
  showEditingForm: false,
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
    setShowEditingForm: (state, action: PayloadAction<boolean>) => {
      state.showEditingForm = action.payload;
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

export const { setTextShortcuts, setIsLoading, addTextShortcut, editTextShortcut, setShowEditingForm } =
  textShortcutsSlice.actions;

export const selectTextShortcuts = (state: RootState) => state.textShortcuts.textShortcuts;
export const selectIsLoading = (state: RootState) => state.textShortcuts.isLoading;
export const selectShowEditingForm = (state: RootState) => state.textShortcuts.showEditingForm;

export default textShortcutsSlice.reducer;
