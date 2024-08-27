import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";

import * as Sentry from "@sentry/browser";
import { uuid4 } from "../../utils/uuid";
import { DraftAction, Screen, setDraftAction, setScreen } from "../reducers/AppReducer";
import { createDraftAction, draftMessageAction } from "./draftActions";

export const createFaqReplyDraft = createAsyncThunk<void | string, void, { rejectValue: string; state: RootState }>(
  "faqReply/createFaqReplyDraft",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      dispatch(setScreen(Screen.Loading));
      dispatch(setDraftAction(DraftAction.REPLY_FAQ));
      await dispatch(createDraftAction(DraftAction.REPLY_FAQ));
      await dispatch(draftMessageAction());
      return null;
    } catch (error) {
      Sentry.captureException(error);
      return rejectWithValue("Error creating FAQ reply draft");
    }
  },
);
