import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { fetchAttachmentSummary } from "../actions/attachmentActions";
import { EventResponse } from "../../hooks/usePusher";

export const INITIAL_ATTACHMENT_SUMMARY = {
  request_id: "",
  summary: "",
  finished: false,
};

export interface AttachmentSummaryResponse {
  request_id: string;
  summary: string;
  frame_index?: number;
  finished?: boolean;
  attachmentId?: any;
}

export type AttachmentDetails = {
  name: string;
  id: string;
  size: number;
  contentType: string;
  processable: boolean;
  content?: string;
};

interface AttachmentState {
  attachments: AttachmentDetails[];
  summaries: AttachmentSummaryResponse[];
  selectedAttachmentId?: string;
  activeRequestId?: string;
  isLoading: boolean;
}

const initialState: AttachmentState = {
  attachments: [],
  summaries: [],
  selectedAttachmentId: undefined,
  activeRequestId: undefined,
  isLoading: false,
};

const attachmentsSlice = createSlice({
  name: "attachments",
  initialState,
  reducers: {
    resetAttachmentSummaries: (state) => {
      state.summaries = [];
    },
    addAttachmentSummary: (state, action: PayloadAction<AttachmentSummaryResponse>) => {
      state.summaries.push(action.payload);
    },
    setAttachments: (state, action: PayloadAction<AttachmentDetails[]>) => {
      state.attachments = action.payload;

      // Set the first processable attachment as selected
      if (action.payload.length > 0) {
        state.selectedAttachmentId =
          action.payload.find((attachment) => attachment.processable)?.id || action.payload[0].id;
      }
    },
    setSelectedAttachmentId: (state, action: PayloadAction<string>) => {
      state.selectedAttachmentId = action.payload;
    },
    setAttachmentSummaryRequestId: (state, action: PayloadAction<string>) => {
      state.activeRequestId = action.payload;
    },
    addFrameToAttachmentSummary(
      state,
      action: PayloadAction<{
        data: EventResponse;
      }>,
    ) {
      const requestId = action.payload.data.request_id;

      const summary = state.summaries.find((summary) => summary.request_id === requestId);
      if (summary) {
        summary.summary = action.payload.data.content;
        summary.finished = action.payload.data.last_frame;
        summary.frame_index = action.payload.data.frame_index;

        const index = state.summaries.findIndex((summary) => summary.request_id === requestId);
        state.summaries[index] = summary;
        state.isLoading = false;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttachmentSummary.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAttachmentSummary.rejected, (state) => {
        state.isLoading = false;
        state.summaries = [];
      })
      .addCase(fetchAttachmentSummary.fulfilled, (state, action: PayloadAction<AttachmentSummaryResponse>) => {
        if (action.payload) {
          const index = state.summaries.findIndex((summary) => summary.request_id === action.payload.request_id);
          if (index > -1) {
            state.summaries[index] = {
              ...state.summaries[index],
              ...action.payload,
              finished: true,
            };
          } else {
            state.summaries.push({
              ...action.payload,
              finished: true,
            });
          }
        }
        state.isLoading = false;
      });
  },
});

export const {
  setAttachments,
  setSelectedAttachmentId,
  setAttachmentSummaryRequestId,
  addAttachmentSummary,
  addFrameToAttachmentSummary,
  resetAttachmentSummaries,
} = attachmentsSlice.actions;

export default attachmentsSlice.reducer;
