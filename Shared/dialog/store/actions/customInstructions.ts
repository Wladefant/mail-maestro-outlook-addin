import { createAsyncThunk } from "@reduxjs/toolkit";
import { getCustomInstructions } from "../../components/Screens/Settings/modules/AIPersonality/api";
import { setCustomInstructions } from "../reducers/customInstructions";
import { RootState } from "../store";

export const fetchUserCustomInstructions = createAsyncThunk<any, void, { rejectValue: string; state: RootState }>(
  "customInstructions/fetchCustomInstructions",
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState();
      const token = state.dialog.token;
      if (token) {
        const { customInstructions, status } = await getCustomInstructions(token);
        if (status === "success") {
          dispatch(setCustomInstructions(customInstructions));
        }
      }
      return null;
    } catch (error) {
      return rejectWithValue("Error fetching user custom instructions.");
    }
  },
);
