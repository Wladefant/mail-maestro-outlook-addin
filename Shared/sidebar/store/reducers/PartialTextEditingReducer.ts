import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EventResponse } from "../../hooks/usePusher";
import { fetchImproveActionsOptions, fetchImproveTextPart } from "../actions/partialTextEditingActions";
import { RootState } from "../store";
import { Delta, ClipboardStatic } from "quill";

export interface PartialTextEditingOutput {
  text: string;
  draft_id: string;
  request_id: string;
  frame_index?: number;
  finished?: boolean;
}

export enum PartialEditingStep {
  OPTIONS = "options",
  LOADING = "loading",
  SELECTION = "selection",
}

export type OptionData = {
  id: string;
  key: string;
  value: string | boolean;
  text: string;
};

export type ImproveAction = Record<string, string | boolean>;

export type SubOption = {
  value: string;
  title: string;
  icon: string;
};

export type ImproveActionOptions = {
  name: string;
  title: string;
  icon: string;
  options: SubOption[];
};

export type ImprovedTextPartOutputResponse = {
  request_id: string;
  text_content: string;
};

export type SelectedTextData = {
  text: string;
  hasInitialLineBreak: boolean;
  hasFinalLineBreak: boolean;
};

export type SelectionRange = {
  index: number;
  length: number;
};

interface PartialTextEditingState {
  selectionRange: SelectionRange | null;
  selectedText: SelectedTextData;
  selectedOptions: OptionData[];
  inputValue: string;
  showMenu: boolean;
  partialEditingStep: PartialEditingStep;
  improveActionOptions: ImproveActionOptions[];
  partialTextImprovedOutput: PartialTextEditingOutput;
  allowHighlighting: boolean;
  menuYPosition: number;
  buttonYPosition: number;
  deltaChange: Delta | null;
  isExpanded: boolean;
  quillClipboardModule: ClipboardStatic | null;
}

export const INITIAL_OUTPUT: PartialTextEditingOutput = {
  text: "",
  draft_id: "",
  request_id: "",
};

export const INITIAL_SELECTED_TEXT: SelectedTextData = {
  text: "",
  hasFinalLineBreak: false,
  hasInitialLineBreak: false,
};

const initialState: PartialTextEditingState = {
  selectionRange: null,
  menuYPosition: 0,
  buttonYPosition: 0,
  selectedOptions: [],
  inputValue: "",
  showMenu: false,
  partialEditingStep: PartialEditingStep.OPTIONS,
  improveActionOptions: [],
  selectedText: INITIAL_SELECTED_TEXT,
  partialTextImprovedOutput: INITIAL_OUTPUT,
  allowHighlighting: false,
  deltaChange: null,
  isExpanded: true,
  quillClipboardModule: null,
};

const partialTextEditingSlice = createSlice({
  name: "partialTextEditing",
  initialState,
  reducers: {
    addOption: (state, action: PayloadAction<OptionData>) => {
      //If option exists (id or key) then replace it
      const optionIndex = state.selectedOptions.findIndex(
        (option) => option.id === action.payload.id || option.key === action.payload.key,
      );
      if (optionIndex !== -1) {
        state.selectedOptions[optionIndex] = action.payload;
      } else {
        state.selectedOptions.push(action.payload);
      }
    },
    removeOption: (state, action: PayloadAction<string>) => {
      state.selectedOptions = state.selectedOptions.filter((option) => option.id !== action.payload);
    },
    setSelectedOptions: (state, action: PayloadAction<OptionData[]>) => {
      state.selectedOptions = action.payload;
    },
    setInputValue: (state, action: PayloadAction<string>) => {
      state.inputValue = action.payload;
    },
    setShowMenu: (state, action: PayloadAction<boolean>) => {
      state.showMenu = action.payload;
    },
    setStep: (state, action: PayloadAction<PartialEditingStep>) => {
      state.partialEditingStep = action.payload;
    },
    setImproveActionOptions: (state, action: PayloadAction<ImproveActionOptions[]>) => {
      state.improveActionOptions = action.payload;
    },
    setSelectedText: (state, action: PayloadAction<SelectedTextData>) => {
      state.selectedText = action.payload;
    },
    setPartialTextImprovedOutput: (state, action: PayloadAction<string>) => {
      state.partialTextImprovedOutput.text = action.payload;
    },
    resetPartialTextImprovedOutput: (state) => {
      state.partialTextImprovedOutput.text = "";
      state.partialTextImprovedOutput.finished = false;
      state.partialTextImprovedOutput.frame_index = 0;
      state.partialTextImprovedOutput.request_id = "";
    },
    setAllowHighlighting: (state, action: PayloadAction<boolean>) => {
      state.allowHighlighting = action.payload;
    },
    addFrameToPartialTextOutput(state, action: PayloadAction<EventResponse & { draftId: string }>) {
      const isFromCorrectDraft = action.payload.draftId === action.payload.draft_id;
      const requestIsAlreadyFinished = state.partialTextImprovedOutput.finished || false;
      const currentFrameIndex = state.partialTextImprovedOutput?.frame_index || 0;
      if (isFromCorrectDraft && !requestIsAlreadyFinished && action.payload.frame_index >= currentFrameIndex) {
        state.partialTextImprovedOutput.draft_id = action.payload.draft_id;
        state.partialTextImprovedOutput.request_id = action.payload.request_id;
        state.partialTextImprovedOutput.text = action.payload.content;
        state.partialTextImprovedOutput.frame_index = action.payload.frame_index;
        state.partialTextImprovedOutput.finished = action.payload.last_frame;
      }
    },
    setSelectionRange: (state, action: PayloadAction<SelectionRange | null>) => {
      state.selectionRange = action.payload;
    },
    setMenuYPosition: (state, action: PayloadAction<number>) => {
      state.menuYPosition = action.payload;
    },
    setButtonYPosition: (state, action: PayloadAction<number>) => {
      state.buttonYPosition = action.payload;
    },
    setDeltaChange: (state, action: PayloadAction<Delta | null>) => {
      state.deltaChange = action.payload;
    },
    setIsExpanded: (state, action: PayloadAction<boolean>) => {
      state.isExpanded = action.payload;
    },
    setQuillClipboardModule: (state, action: PayloadAction<ClipboardStatic | null>) => {
      state.quillClipboardModule = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchImproveActionsOptions.fulfilled, (state, action: PayloadAction<ImproveActionOptions[]>) => {
        if (action.payload) {
          state.improveActionOptions = action.payload;
        }
      })
      .addCase(fetchImproveTextPart.fulfilled, (state, action: PayloadAction<ImprovedTextPartOutputResponse>) => {
        if (action.payload) {
          state.partialTextImprovedOutput.text = action.payload.text_content;
          state.partialTextImprovedOutput.finished = true;
          state.partialTextImprovedOutput.request_id = action.payload.request_id;
        }
      });
  },
});

export const {
  addOption,
  removeOption,
  setSelectedOptions,
  setInputValue,
  setShowMenu,
  setStep,
  setSelectedText,
  setPartialTextImprovedOutput,
  setAllowHighlighting,
  addFrameToPartialTextOutput,
  resetPartialTextImprovedOutput,
  setSelectionRange,
  setMenuYPosition,
  setButtonYPosition,
  setDeltaChange,
  setIsExpanded,
  setQuillClipboardModule,
} = partialTextEditingSlice.actions;

export const selectSelectedOptions = (state: RootState) => state.partialEditingText.selectedOptions;

export const selectPartialEditingInputValue = (state: RootState) => state.partialEditingText.inputValue;

export const selectShowMenu = (state: RootState) => state.partialEditingText.showMenu;

export const selectStep = (state: RootState) => state.partialEditingText.partialEditingStep;

export const selectAvailableOptions = (state: RootState) => state.partialEditingText.improveActionOptions;

export const selectSelectedText = (state: RootState) => state.partialEditingText.selectedText;

export const selectPartialTextImprovedOutput = (state: RootState) => state.partialEditingText.partialTextImprovedOutput;

export const selectAllowHighlighting = (state: RootState) => state.partialEditingText.allowHighlighting;

export const selectSelectionRange = (state: RootState) => state.partialEditingText.selectionRange;

export const selectMenuYPosition = (state: RootState) => state.partialEditingText.menuYPosition;

export const selectButtonYPosition = (state: RootState) => state.partialEditingText.buttonYPosition;

export const selectDeltaChange = (state: RootState) => state.partialEditingText.deltaChange;

export const selectIsExpanded = (state: RootState) => state.partialEditingText.isExpanded;

export const selectQuillClipboardModule = (state: RootState) => state.partialEditingText.quillClipboardModule;

export default partialTextEditingSlice.reducer;
