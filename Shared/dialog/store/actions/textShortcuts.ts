import { createAsyncThunk } from "@reduxjs/toolkit";
import { RESPONSE_TYPES } from "../../../sidebar/apis/endpoints";
import { getUserTextShortcuts } from "../../../sidebar/apis/textShortcuts";
import { RootState } from "../store";
import { TextShortcut } from "../../../sidebar/store/reducers/TextShortcutsReducer";

export const fetchUserTextShortcuts = createAsyncThunk<any, void, { rejectValue: string; state: RootState }>(
  "textShortcuts/dialog/fetchUserTextShortcuts",
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState();
      const token = state.dialog.token;
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
