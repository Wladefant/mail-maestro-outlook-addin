import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { fetchAttachmentSummaryAPI } from "../../apis/attachments";
import { getAttachmentContent } from "../../utils/attachments";
import * as Sentry from "@sentry/browser";

export const fetchAttachmentSummary = createAsyncThunk<any, string, { rejectValue: string; state: RootState }>(
  "attachments/fetchAttachmentSummary",
  async (requestId = "", { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const user = state.auth.userDetails;
      const senderEmail = state.auth.userDetails?.email;
      const senderName = state.auth.userDetails?.first_name;
      const selectedAttachmentId = state.attachments.selectedAttachmentId;
      const token = state.auth.token;
      const mode = state.app.mode;
      // We use the language from the summary box
      const language = state.summary.language;
      const itemId = state.app.itemId;

      if (user) {
        const fileContent = await getAttachmentContent(itemId as string, selectedAttachmentId as string);
        const summary = await fetchAttachmentSummaryAPI(
          requestId,
          token as string,
          senderName as string,
          senderEmail as string,
          fileContent,
          mode || undefined,
          language || undefined,
        );
        return summary.payload;
      }
      return null;
    } catch (error) {
      Sentry.captureException(error);
      return rejectWithValue("Error fetching summary");
    }
  },
);
