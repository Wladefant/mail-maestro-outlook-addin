import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MagicTemplate } from "../../../sidebar/store/reducers/MagicTemplateReducer";
import { RootState } from "../store";

const defaultTemplateVariables = [
  { id: "5", name: "Recipient name" },
  { id: "1", name: "Company name" },
  { id: "2", name: "Date" },
  { id: "4", name: "Additional information" },
];

export type MagicTemplateBuilderVariable = {
  id: string;
  name: string;
};

export enum MagicTemplateBuilderVariablesScreen {
  LIST = "LIST",
  FORM = "FORM",
}

interface MagicTemplateBuilderState {
  magicTemplateVariables: MagicTemplateBuilderVariable[];
  magicTemplateVariablesScreen: MagicTemplateBuilderVariablesScreen;
  newVariableName: string;
  templateTitle: string;
  templateToEdit: MagicTemplate | null;
  error: string | null;
  isValidToSave: boolean;
  templateContent: string;
  templateSubject: string;
  variableToInsert: string;
  variableToRemove: string;
}

const initialState: MagicTemplateBuilderState = {
  magicTemplateVariables: defaultTemplateVariables,
  magicTemplateVariablesScreen: MagicTemplateBuilderVariablesScreen.LIST,
  newVariableName: "",
  templateTitle: "",
  templateToEdit: null,
  error: null,
  isValidToSave: false,
  templateContent: "",
  templateSubject: "",
  variableToInsert: "",
  variableToRemove: "",
};

export const magicTemplateBuilderSlice = createSlice({
  name: "magicTemplateBuilder",
  initialState,
  reducers: {
    setMagicTemplateVariables: (state, action: PayloadAction<MagicTemplateBuilderVariable[]>) => {
      state.magicTemplateVariables = action.payload;
    },
    setMagicTemplateVariableScreen: (state, action: PayloadAction<MagicTemplateBuilderVariablesScreen>) => {
      state.magicTemplateVariablesScreen = action.payload;
    },
    setNewVariableName: (state, action: PayloadAction<string>) => {
      state.newVariableName = action.payload;
    },
    addMagicTemplateVariable: (state, action: PayloadAction<MagicTemplateBuilderVariable>) => {
      state.magicTemplateVariables.push(action.payload);
    },
    removeMagicTemplateVariableById: (state, action: PayloadAction<number | string>) => {
      state.magicTemplateVariables = state.magicTemplateVariables.filter((variable) => variable.id !== action.payload);
    },
    setTemplateTitle: (state, action: PayloadAction<string>) => {
      state.templateTitle = action.payload;
    },
    setMagicTemplateToEdit: (state, action: PayloadAction<MagicTemplate | null>) => {
      state.templateToEdit = action.payload;
      if (state.templateToEdit) {
        state.templateToEdit.template = action.payload?.template + " ";
      }
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetMagicTemplatesBuilderState: (state) => {
      state.magicTemplateVariables = defaultTemplateVariables;
      state.magicTemplateVariablesScreen = MagicTemplateBuilderVariablesScreen.LIST;
      state.newVariableName = "";
      state.templateTitle = "";
      state.templateToEdit = null;
      state.error = null;
      state.isValidToSave = false;
      state.templateContent = "";
      state.variableToInsert = "";
      state.variableToRemove = "";
    },
    setIsValidToSave: (state, action: PayloadAction<boolean>) => {
      state.isValidToSave = action.payload;
    },
    setTemplateContent: (state, action: PayloadAction<string>) => {
      state.templateContent = action.payload;
    },
    setTemplateSubject: (state, action: PayloadAction<string>) => {
      state.templateSubject = action.payload;
    },
    setVariableToInsert: (state, action: PayloadAction<string>) => {
      state.variableToInsert = action.payload;
    },
    setVariableToRemove: (state, action: PayloadAction<string>) => {
      state.variableToRemove = action.payload;
    },
  },
});

export const {
  addMagicTemplateVariable,
  setMagicTemplateVariables,
  setMagicTemplateVariableScreen,
  setNewVariableName,
  removeMagicTemplateVariableById,
  setTemplateTitle,
  setMagicTemplateToEdit,
  setError,
  resetMagicTemplatesBuilderState,
  setIsValidToSave,
  setTemplateContent,
  setTemplateSubject,
  setVariableToInsert,
  setVariableToRemove,
} = magicTemplateBuilderSlice.actions;

export const selectMagicTemplateVariables = (state: RootState) => state.magicTemplateBuilder.magicTemplateVariables;
export const selectMagicTemplateVariablesScreen = (state: RootState) =>
  state.magicTemplateBuilder.magicTemplateVariablesScreen;
export const selectNewVariableName = (state: RootState) => state.magicTemplateBuilder.newVariableName;
export const selectTemplateTitle = (state: RootState) => state.magicTemplateBuilder.templateTitle;
export const selectMagicTemplateToEdit = (state: RootState) => state.magicTemplateBuilder.templateToEdit;
export const selectError = (state: RootState) => state.magicTemplateBuilder.error;
export const selectIsValidToSave = (state: RootState) => state.magicTemplateBuilder.isValidToSave;
export const selectTemplateContent = (state: RootState) => state.magicTemplateBuilder.templateContent;
export const selectVariableToInsert = (state: RootState) => state.magicTemplateBuilder.variableToInsert;
export const selectVariableToRemove = (state: RootState) => state.magicTemplateBuilder.variableToRemove;
export const selectTemplateSubject = (state: RootState) => state.magicTemplateBuilder.templateSubject;

export default magicTemplateBuilderSlice.reducer;
