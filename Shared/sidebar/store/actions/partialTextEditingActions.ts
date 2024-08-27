import { createAsyncThunk } from "@reduxjs/toolkit";
import type { Delta as DeltaType } from "quill";
import { Quill } from "react-quill";
import { getImproveActions, improveTextPart } from "../../apis/partialTextEditing";
import {
  INITIAL_SELECTED_TEXT,
  ImproveActionOptions,
  ImprovedTextPartOutputResponse,
  PartialEditingStep,
  resetPartialTextImprovedOutput,
  setAllowHighlighting,
  setDeltaChange,
  setInputValue,
  setSelectedOptions,
  setSelectedText,
  setSelectionRange,
  setShowMenu,
  setStep,
} from "../reducers/PartialTextEditingReducer";
import { RootState } from "../store";
import { convertMarkdownToHTML } from "../../utils/html";

const Delta = Quill.import("delta") as typeof DeltaType;

const TIME_OF_HIGHLIGHTED_TEXT_IN_MS = 3000;
export const fetchImproveActionsOptions = createAsyncThunk<any, void, { rejectValue: string; state: RootState }>(
  "partialTextEditing/fetchImproveActions",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const token = state.auth.token;

      if (state.partialEditingText.improveActionOptions.length > 0) {
        return;
      }
      if (token) {
        const improveActions = await getImproveActions(token as string);

        return improveActions.payload as ImproveActionOptions[];
      }
      return null;
    } catch (error) {
      return rejectWithValue("Error fetching improve actions.");
    }
  },
);

export const fetchImproveTextPart = createAsyncThunk<any, void, { rejectValue: string; state: RootState }>(
  "partialTextEditing/fetchImproveTextPart",
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState();
      const senderEmail = state.auth.userDetails?.email;
      const senderName = state.auth.userDetails?.first_name;
      const { text: textContent } = state.partialEditingText.selectedText;
      const draftId = state.draft.draftId;
      const selectedOptions = state.partialEditingText.selectedOptions;
      const selectedDraftRequestId = state.draft.selectedDraftRequestId;
      const selectedDraft = state.draft.generatedDraftHistory.find(
        (draft) => draft.requestId === selectedDraftRequestId,
      );

      const improveActionsToSend: Record<string, string | boolean> = {};

      selectedOptions.forEach((option) => {
        if (option.key === "prompt_input") {
          return;
        }
        improveActionsToSend[option.key] = option.value;
      });

      const promptInput = state.partialEditingText.inputValue;

      dispatch(setStep(PartialEditingStep.LOADING));
      const token = state.auth.token;
      if (token) {
        const improveTextPartOutput = await improveTextPart(
          senderName as string,
          senderEmail as string,
          promptInput,
          textContent,
          draftId as string,
          improveActionsToSend,
          selectedDraft?.draft.request_id as string,
          token as string,
        );

        return improveTextPartOutput as ImprovedTextPartOutputResponse;
      }
      return null;
    } catch (error) {
      return rejectWithValue("Error fetching improve text part output.");
    }
  },
);

export const resetImprovedTextPart = () => (dispatch: any) => {
  dispatch(setShowMenu(false));
  dispatch(setStep(PartialEditingStep.OPTIONS));
  dispatch(setSelectedText(INITIAL_SELECTED_TEXT));
  dispatch(setInputValue(""));
  dispatch(setSelectedOptions([]));
  dispatch(resetPartialTextImprovedOutput());
  dispatch(setSelectionRange(null));
};

export const improveTextPartFromDraft = () => async (dispatch: any, getState: () => RootState) => {
  const state = getState();
  const clipboard = state.partialEditingText.quillClipboardModule;
  const improvedTextPart = state.partialEditingText.partialTextImprovedOutput;
  const initialSelectedIndex = state.partialEditingText.selectionRange?.index;
  const textLength = state.partialEditingText.selectionRange?.length as number;

  if (!clipboard) {
    return;
  }

  const improvedTextDelta = clipboard.convert(convertMarkdownToHTML(improvedTextPart.text));

  const delta = new Delta({ ops: [] })
    .retain(initialSelectedIndex as number)
    .delete(textLength)
    .concat(improvedTextDelta);

  //Highlight the new text from the converted html delta
  if (delta.ops && delta.ops?.length === 3) {
    delta.ops[1].attributes = {
      ...delta.ops[1].attributes,
      background: "#E8E7FF",
    };
  }

  dispatch(setDeltaChange(delta));

  dispatch(setShowMenu(false));
  dispatch(setAllowHighlighting(true));

  //Show to the user the new text highlighted for 3 seconds
  setTimeout(() => {
    dispatch(setAllowHighlighting(false));
    dispatch(setDeltaChange(null));
    dispatch(resetImprovedTextPart());
  }, TIME_OF_HIGHLIGHTED_TEXT_IN_MS);
};
