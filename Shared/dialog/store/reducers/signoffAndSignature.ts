import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { SignoffAndSignatureTypes } from "../../components/Screens/SignoffAndSignature/types";

export enum SignoffAndSignatureScreen {
  LIST = "LIST",
  FORM = "FORM",
}

interface SignOffAndSignatureState {
  screen: SignoffAndSignatureScreen | null;
  signatures: SignoffAndSignatureTypes[];
  showEditingForm: boolean;
  isLoading: boolean;
}

const initialState: SignOffAndSignatureState = {
  screen: null,
  signatures: [],
  showEditingForm: false,
  isLoading: false,
};

export const signoffAndSignatureSlice = createSlice({
  name: "signoffAndSignature",
  initialState,
  reducers: {
    setScreen: (state, action: PayloadAction<SignoffAndSignatureScreen | null>) => {
      state.screen = action.payload;
    },
    setSignatures: (state, action: PayloadAction<SignoffAndSignatureTypes[]>) => {
      state.signatures = action.payload;
    },
    setShowEditingForm: (state, action: PayloadAction<boolean>) => {
      state.showEditingForm = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setScreen, setSignatures, setShowEditingForm, setIsLoading } = signoffAndSignatureSlice.actions;

export const selectScreen = (state: RootState) => state.signoffAndSignature.screen;
export const selectSignatures = (state: RootState) => state.signoffAndSignature.signatures;
export const selectShowEditingForm = (state: RootState) => state.signoffAndSignature.showEditingForm;
export const selectIsLoading = (state: RootState) => state.signoffAndSignature.isLoading;

export default signoffAndSignatureSlice.reducer;
