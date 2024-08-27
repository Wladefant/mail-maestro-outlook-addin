import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface CustomInstructionsState {
  customInstructions: string;
  error: string | null;
  isLoading: boolean;
}

const initialState: CustomInstructionsState = {
  customInstructions: "",
  error: null,
  isLoading: false,
};

export const customInstructionsSlice = createSlice({
  name: "customInstructions",
  initialState,
  reducers: {
    setCustomInstructions: (state, action: PayloadAction<string>) => {
      state.customInstructions = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCustomInstructions, setError, setIsLoading } = customInstructionsSlice.actions;

export const selectCustomInstructions = (state: RootState) => state.customInstructions.customInstructions;
export const selectError = (state: RootState) => state.customInstructions.error;
export const selectIsLoading = (state: RootState) => state.customInstructions.isLoading;

export default customInstructionsSlice.reducer;
