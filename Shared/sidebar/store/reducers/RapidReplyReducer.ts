import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { fetchRapidReplyAction } from "../actions/rapidReplyActions";
import { RootState } from "../store";
import { trimArrayToMaxElements } from "../../utils/array";

export type RapidReplyRequest = {
  request_id: string;
  content: string[];
  errors: string[];
};

export interface RapidReply {
  rapidReplyRequest: RapidReplyRequest | null;
  itemId: string | null;
  finished?: boolean;
}

interface RapidReplyState {
  rapidReplies: RapidReply[];
  selectedRequestId: string | null;
  isLoading: boolean;
  rapidReplyMetadata: {
    itemId: string;
    requestId: string;
    language: string;
  }[];
}

const initialState: RapidReplyState = {
  rapidReplies: [],
  selectedRequestId: null,
  isLoading: false,
  rapidReplyMetadata: [],
};

export const rapidReplySlice = createSlice({
  name: "rapidReply",
  initialState,
  reducers: {
    addRapidReply: (state, action: PayloadAction<RapidReply>) => {
      const rapidReply = state.rapidReplies.find((rapidReply) => rapidReply.itemId === action.payload.itemId);
      if (rapidReply) {
        rapidReply.rapidReplyRequest = action.payload.rapidReplyRequest;
        rapidReply.finished = true;
      } else {
        state.rapidReplies.push(action.payload);
        state.rapidReplies = trimArrayToMaxElements(state.rapidReplies);
      }
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSelectedRequestId: (state, action: PayloadAction<string>) => {
      state.selectedRequestId = action.payload;
    },
    setRapidReplies: (state, action: PayloadAction<RapidReply[]>) => {
      state.rapidReplies = action.payload;
    },
    addRapidReplyMetadataItem: (
      state,
      action: PayloadAction<{
        requestId: string;
        itemId: string;
        language: string;
      }>,
    ) => {
      const item = state.rapidReplyMetadata.find((item) => item.itemId === action.payload.itemId);
      if (item) {
        item.requestId = action.payload.requestId;
        item.language = action.payload.language;
      } else {
        state.rapidReplyMetadata.push(action.payload);
      }
    },
    addFrameToRapidReply: (
      state,
      action: PayloadAction<{
        data: any;
        itemId: string;
      }>,
    ) => {
      const requestId = action.payload.data.request_id;

      const alreadyStoredRapidReply = state.rapidReplies.find(
        (rapidReply) =>
          rapidReply.itemId === action.payload.itemId && rapidReply?.rapidReplyRequest?.request_id === requestId,
      );

      if (!alreadyStoredRapidReply) {
        state.rapidReplies.push({
          rapidReplyRequest: {
            errors: action.payload.data.errors as string[],
            request_id: action.payload.data.request_id as string,
            content: action.payload.data.content,
          },
          itemId: action.payload.itemId,
          finished: action.payload.data.last_frame,
        });
        state.rapidReplies = trimArrayToMaxElements(state.rapidReplies);
      }

      const rapidReplyIndex = state.rapidReplies.findIndex(
        (rapidReply) =>
          rapidReply.itemId === action.payload.itemId && rapidReply?.rapidReplyRequest?.request_id === requestId,
      );

      const requestIsAlreadyFinished = state.rapidReplies[rapidReplyIndex]?.finished || false;

      if (!requestIsAlreadyFinished) {
        state.rapidReplies[rapidReplyIndex].rapidReplyRequest = {
          errors: action.payload.data.errors as string[],
          request_id: action.payload.data.request_id as string,
          content: action.payload.data.content as string[],
        };
        state.rapidReplies[rapidReplyIndex].finished = action.payload.data.last_frame;
      }
    },
    resetRapidReplyByItemId: (state, action: PayloadAction<string>) => {
      const rapidReply = state.rapidReplies.find((rapidReply) => rapidReply.itemId === action.payload);
      if (rapidReply) {
        rapidReply.rapidReplyRequest = {
          request_id: "",
          errors: [],
          content: [],
        };
        rapidReply.finished = false;
      }
    },
    removeRapidReplyByItemIdAndRequestId: (state, action: PayloadAction<{ itemId: string; requestId: string }>) => {
      const rapidReplies = state.rapidReplies;
      const index = state.rapidReplies.findIndex(
        (rapidReply) =>
          rapidReply.itemId === action.payload.itemId &&
          rapidReply?.rapidReplyRequest?.request_id === action.payload.requestId,
      );
      if (index > -1) {
        state.rapidReplies.splice(index, 1);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRapidReplyAction.fulfilled, (state, action: PayloadAction<RapidReply>) => {
        if (action.payload) {
          const rapidReply = state.rapidReplies.find((rapidReply) => rapidReply.itemId === action.payload.itemId);
          if (rapidReply) {
            rapidReply.rapidReplyRequest = {
              errors: action.payload.rapidReplyRequest?.errors as string[],
              request_id: action.payload.rapidReplyRequest?.request_id as string,
              content: action.payload.rapidReplyRequest?.content as string[],
            };
            rapidReply.finished = true;
          } else {
            state.rapidReplies.push({
              rapidReplyRequest: {
                errors: action.payload.rapidReplyRequest?.errors as string[],
                request_id: action.payload.rapidReplyRequest?.request_id as string,
                content: action.payload.rapidReplyRequest?.content as string[],
              },
              itemId: action.payload.itemId,
              finished: true,
            });
            state.rapidReplies = trimArrayToMaxElements(state.rapidReplies);
          }
        }
      })
      .addCase(fetchRapidReplyAction.pending, (state) => {
        state.isLoading = true;
      });
  },
});

export const selectRapidReplies = (state: RootState) => state.rapidReply.rapidReplies;

export const selectRapidReplyByItemIdAndRequestId = (itemId: string, requestId: string) => (state: RootState) =>
  state.rapidReply.rapidReplies.find(
    (rapidReply) => rapidReply.itemId === itemId && rapidReply?.rapidReplyRequest?.request_id === requestId,
  );

export const getRapidReplyMetadataByItemId = (itemId: string) => (state: RootState) => {
  return state.rapidReply.rapidReplyMetadata.find((item) => item.itemId === itemId);
};

export const selectIsLoading = (state: RootState) => state.rapidReply.isLoading;

export const selectSelectedRapidReplyRequestId = (state: RootState) => state.rapidReply.selectedRequestId;

export const {
  addRapidReply,
  setIsLoading,
  addFrameToRapidReply,
  resetRapidReplyByItemId,
  removeRapidReplyByItemIdAndRequestId,
  setSelectedRequestId,
  addRapidReplyMetadataItem,
  setRapidReplies,
} = rapidReplySlice.actions;

export default rapidReplySlice.reducer;
