import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { getMagicTemplates, getUserPromptTemplates } from "../../apis/magicTemplates";
import { MagicTemplate } from "../reducers/MagicTemplateReducer";
import { DraftAction } from "../reducers/AppReducer";

export const fetchUserPromptTemplates = createAsyncThunk<any, void, { rejectValue: string; state: RootState }>(
  "magicTemplates/fetchUserPromptTemplates",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const token = state.auth.token;
      if (token) {
        const userTemplates = await getUserPromptTemplates(token as string);

        return userTemplates.payload as MagicTemplate[];
      }
      return null;
    } catch (error) {
      return rejectWithValue("Error fetching user templates.");
    }
  },
);

export const fetchMagicTemplates = createAsyncThunk<any, void, { rejectValue: string; state: RootState }>(
  "magicTemplates/fetchMagicTemplates",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const token = state.auth.token;
      const action = state.app.draftAction;
      const isReply = state.app.isReply;

      if (token) {
        const userTemplates = await getMagicTemplates(
          token as string,
          isReply ? (!action ? DraftAction.REPLY : (action as DraftAction)) : DraftAction.COMPOSE,
        );

        return (userTemplates?.payload ?? []) as MagicTemplate[];
      }
      return null;
    } catch (error) {
      return rejectWithValue("Error fetching user templates.");
    }
  },
);
