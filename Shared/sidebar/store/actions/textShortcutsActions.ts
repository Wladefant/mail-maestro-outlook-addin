import { createAsyncThunk } from "@reduxjs/toolkit";
import type { Delta as DeltaType } from "quill";
import { Quill } from "react-quill";
import { RESPONSE_TYPES } from "../../apis/endpoints";
import { getUserTextShortcuts } from "../../apis/textShortcuts";
import { TextShortcut, setDeltaChange } from "../reducers/TextShortcutsReducer";
import { RootState } from "../store";
import ReactGA from "react-ga4";
import { GA4_EVENTS } from "../../utils/events";

const Delta = Quill.import("delta") as typeof DeltaType;

export const fetchUserTextShortcuts = createAsyncThunk<any, void, { rejectValue: string; state: RootState }>(
  "textShortcuts/fetchUserTextShortcuts",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const token = state.auth.token;
      if (token) {
        const textShortcuts = await getUserTextShortcuts(token as string);
        if (textShortcuts.type === RESPONSE_TYPES.ERROR) {
          throw new Error("Error fetching user text shortcuts");
        }
        return textShortcuts.payload as TextShortcut[];
      }
      return null;
    } catch (error) {
      return rejectWithValue("Error fetching user text shortcuts.");
    }
  },
);

export const insertTextShortcut = (textShortcut: string) => async (dispatch: any, getState: () => RootState) => {
  const state = getState();
  const draftId = state.draft.draftId;
  const gaId = state.auth.userDetails?.ganalytics_id;
  const currentCursorIndex = state.textShortcuts.currentCursorIndex;
  // Create a new Delta
  const delta = new Delta()
    .retain(currentCursorIndex) // Retain all characters up to the current cursor position
    .delete(1) // Delete the character immediately before the current cursor position
    .insert(textShortcut); // Insert new text at the current cursor position

  dispatch(setDeltaChange(delta));

  ReactGA.event(GA4_EVENTS.TEXT_SHORTCUT_REPLACED, {
    draftID: draftId,
    userID: gaId,
  });
};
