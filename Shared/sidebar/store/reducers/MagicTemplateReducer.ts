import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchMagicTemplates, fetchUserPromptTemplates } from "../actions/magicTemplateActions";
import { RootState } from "../store";

export enum FieldType {
  TEXT = "text",
  STRING = "string",
}

export interface FieldConfig {
  type: FieldType;
  name: string;
  label: string;
  placeholder?: string;
  help_text?: string;
  required?: boolean;
}

export interface MagicTemplateResponse {
  magicTemplateId: string;
  responses: {
    [key: string]: any;
  };
}

export interface MagicTemplate {
  id: string;
  kind: string;
  title: string;
  description: string;
  fields: FieldConfig[];
  ownership?: string;
  template: string;
  subject_template: string;
  static?: boolean;
}

export interface UserPromptTemplate {
  id: string;
  description: string;
  prompt: string;
  title: string;
}

interface MagicTemplateState {
  userPromptTemplates: UserPromptTemplate[];
  magicTemplates: MagicTemplate[];
  selectedTemplate: MagicTemplate | null;
  templateId: string | null;
  magicTemplateResponses: MagicTemplateResponse[];
  hasResponsesValidationErrors: boolean;
}

const initialState: MagicTemplateState = {
  templateId: null,
  magicTemplates: [],
  userPromptTemplates: [],
  selectedTemplate: null,
  magicTemplateResponses: [],
  hasResponsesValidationErrors: false,
};

const magicTemplateSlice = createSlice({
  name: "magicTemplate",
  initialState,
  reducers: {
    updateMagicTemplates: (state, action: PayloadAction<MagicTemplate[]>) => {
      state.magicTemplates = action.payload;
    },
    setTemplateId: (state, action: PayloadAction<string | null>) => {
      state.templateId = action.payload;
    },
    setSelectedTemplate: (state, action: PayloadAction<MagicTemplate>) => {
      state.selectedTemplate = action.payload;
    },
    setMagicTemplateResponse: (state, action: PayloadAction<MagicTemplateResponse>) => {
      const templateId = action.payload.magicTemplateId;
      const templateResponse = action.payload.responses;
      const existingResponse = state.magicTemplateResponses.find((response) => response.magicTemplateId === templateId);
      if (existingResponse) {
        existingResponse.responses = templateResponse;
      } else {
        state.magicTemplateResponses.push(action.payload);
      }
    },
    setHasResponsesValidationErrors: (state, action: PayloadAction<boolean>) => {
      state.hasResponsesValidationErrors = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserPromptTemplates.fulfilled, (state, action: PayloadAction<UserPromptTemplate[]>) => {
        if (action.payload) {
          state.userPromptTemplates = action.payload;
        }
      })
      .addCase(fetchMagicTemplates.fulfilled, (state, action: PayloadAction<MagicTemplate[]>) => {
        if (action.payload) {
          state.magicTemplates = action.payload;
        }
      });
  },
});

export const {
  updateMagicTemplates,
  setTemplateId,
  setSelectedTemplate,
  setMagicTemplateResponse,
  setHasResponsesValidationErrors,
} = magicTemplateSlice.actions;

export const selectSelectedTemplateId = (state: RootState) => {
  return state.magicTemplate.templateId;
};
export const selectMagicTemplates = (state: RootState) => state.magicTemplate.magicTemplates;
export const selectSelectedTemplate = (state: RootState) =>
  (state.magicTemplate.magicTemplates ?? []).find((template) => template.id === state.magicTemplate?.templateId);
export const selectMagicTemplateResponse = (templateId: string) => (state: RootState) =>
  (state.magicTemplate.magicTemplateResponses ?? []).find((response) => response?.magicTemplateId === templateId);
export const selectMagicTemplateResponses = (state: RootState) => state.magicTemplate.magicTemplateResponses;
export const selectHasResponsesValidationErrors = (state: RootState) =>
  state.magicTemplate.hasResponsesValidationErrors;

export default magicTemplateSlice.reducer;
