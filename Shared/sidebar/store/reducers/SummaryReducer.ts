import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EventResponse } from "../../hooks/usePusher";
import { fetchOneSentenceSummary, fetchSummary } from "../actions/summaryActions";
import { RootState } from "../store";
import { trimArrayToMaxElements } from "../../utils/array";

export interface SummaryThreadHash {
  type: "short" | "detailed";
  conversationId: string;
  hash: string;
  requestId: string;
}

interface SummaryState {
  oneSentenceSummaries: SummaryResponse[];
  summaryThreadHashes: SummaryThreadHash[];
  oneSentenceSummaryRequestId: string | null;
  summaries: SummaryResponse[];
  summaryRequestId: string | null;
  isLoading: boolean;
  language?: string | null;
}

export interface SummaryResponse {
  emails_count: number;
  request_id: string;
  summary: string;
  total_emails_count: number;
  frame_index?: number;
  finished?: boolean;
  conversationId?: string;
}

export const INITIAL_SUMMARY = {
  emails_count: 0,
  request_id: "",
  summary: "",
  total_emails_count: 0,
  finished: false,
};

const initialState: SummaryState = {
  oneSentenceSummaries: [],
  oneSentenceSummaryRequestId: null,
  summaries: [],
  summaryRequestId: null,
  isLoading: false,
  summaryThreadHashes: [],
};

export const summarySlice = createSlice({
  name: "summary",
  initialState,
  reducers: {
    addOneSentenceSummary: (state, action: PayloadAction<SummaryResponse>) => {
      state.oneSentenceSummaries.push(action.payload);
      state.oneSentenceSummaries = trimArrayToMaxElements(state.oneSentenceSummaries);
    },
    addSummary: (state, action: PayloadAction<SummaryResponse>) => {
      state.summaries.push(action.payload);
      state.summaries = trimArrayToMaxElements(state.summaries);
    },
    updateOneSentenceSummaries: (state, action: PayloadAction<SummaryResponse[]>) => {
      state.oneSentenceSummaries = action.payload;
    },
    updateSummaries: (state, action: PayloadAction<SummaryResponse[]>) => {
      state.summaries = action.payload;
    },
    setOneSentenceSummaryRequestId: (state, action: PayloadAction<string | null>) => {
      state.oneSentenceSummaryRequestId = action.payload;
    },
    setSummaryRequestId: (state, action: PayloadAction<string | null>) => {
      state.summaryRequestId = action.payload;
    },
    addFrameToSummary(
      state,
      action: PayloadAction<{
        type: "short" | "detailed";
        data: EventResponse;
      }>,
    ) {
      const requestId = action.payload.data.request_id;

      if (action.payload.type === "short") {
        const oneSentenceSummary = state.oneSentenceSummaries.find((summary) => summary.request_id === requestId);
        if (oneSentenceSummary) {
          oneSentenceSummary.summary = action.payload.data.content;
          oneSentenceSummary.finished = action.payload.data.last_frame;
          oneSentenceSummary.frame_index = action.payload.data.frame_index;

          const index = state.oneSentenceSummaries.findIndex((summary) => summary.request_id === requestId);
          state.oneSentenceSummaries[index] = oneSentenceSummary;
          state.isLoading = false;
        }
      }
      if (action.payload.type === "detailed") {
        const summary = state.summaries.find((summary) => summary.request_id === requestId);
        if (summary) {
          summary.summary = action.payload.data.content;
          summary.finished = action.payload.data.last_frame;
          summary.frame_index = action.payload.data.frame_index;

          const index = state.summaries.findIndex((summary) => summary.request_id === requestId);
          state.summaries[index] = summary;
          state.isLoading = false;
        }
      }
    },
    updateLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload;
    },
    addSummaryThreadHash(state, action: PayloadAction<SummaryThreadHash>) {
      const index = state.summaryThreadHashes.findIndex(
        (hash) => hash.conversationId === action.payload.conversationId && hash.type === action.payload.type,
      );
      if (index > -1) {
        state.summaryThreadHashes[index] = action.payload;
      } else {
        state.summaryThreadHashes.push(action.payload);
        state.summaryThreadHashes = trimArrayToMaxElements(state.summaryThreadHashes);
      }
    },
    clearSummaryThreadHashes(state) {
      state.summaryThreadHashes = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSummary.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSummary.fulfilled, (state, action: PayloadAction<SummaryResponse>) => {
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
            state.summaries = trimArrayToMaxElements(state.summaries);
          }
        }
        state.isLoading = false;
      })
      .addCase(fetchOneSentenceSummary.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOneSentenceSummary.fulfilled, (state, action: PayloadAction<SummaryResponse>) => {
        if (action.payload) {
          const index = state.oneSentenceSummaries.findIndex(
            (summary) => summary.request_id === action.payload.request_id,
          );
          if (index > -1) {
            state.oneSentenceSummaries[index] = {
              ...state.oneSentenceSummaries[index],
              ...action.payload,
              finished: true,
            };
          } else {
            state.oneSentenceSummaries.push({
              ...action.payload,
              finished: true,
            });
            state.oneSentenceSummaries = trimArrayToMaxElements(state.oneSentenceSummaries);
          }
        }
        state.isLoading = false;
      });
  },
});

export const {
  updateOneSentenceSummaries,
  updateSummaries,
  setOneSentenceSummaryRequestId,
  setSummaryRequestId,
  addFrameToSummary,
  addOneSentenceSummary,
  addSummary,
  updateLanguage,
  addSummaryThreadHash,
  clearSummaryThreadHashes,
} = summarySlice.actions;

export const selectIsLoadingSummary = (state: RootState) => state.summary.isLoading;
export const selectOneSentenceSummaries = (state: RootState) => state.summary.oneSentenceSummaries;
export const selectOneSentenceSummaryRequestId = (state: RootState) => state.summary.oneSentenceSummaryRequestId;
export const selectSummaries = (state: RootState) => state.summary.summaries;
export const selectSummaryRequestId = (state: RootState) => state.summary.summaryRequestId;
export const selectSummary = (state: RootState) =>
  state.summary.summaries.find((summary) => summary.request_id === state.summary.summaryRequestId);
export const selectSummaryLanguage = (state: RootState) => state.summary.language;

export const selectOneSentenceSummary = (state: RootState) =>
  state.summary.oneSentenceSummaries.find(
    (summary) => summary.request_id === state.summary.oneSentenceSummaryRequestId,
  );
export const selectSummaryThreadHashes = (state: RootState) => state.summary.summaryThreadHashes;

export default summarySlice.reducer;
