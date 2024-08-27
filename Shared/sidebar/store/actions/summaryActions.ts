import { createAsyncThunk } from "@reduxjs/toolkit";
import { SummaryOutputLength, fetchThreadSummary } from "../../apis/summary";
import { OfficeModes } from "@platformSpecific/sidebar/hooks/usePlatformMetadata";
import { getPreviousThread } from "@platformSpecific/sidebar/utils/office";
import { hashString } from "../../utils/string";
import {
  INITIAL_SUMMARY,
  SummaryResponse,
  addOneSentenceSummary,
  addSummary,
  addSummaryThreadHash,
  setOneSentenceSummaryRequestId,
  setSummaryRequestId,
} from "../reducers/SummaryReducer";
import { RootState } from "../store";
import { uuid4 } from "../../utils/uuid";

export const fetchOneSentenceSummary = createAsyncThunk<any, void, { rejectValue: string; state: RootState }>(
  "summary/fetchOneSentenceSummary",
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState();
      const user = state.auth.userDetails;
      const senderEmail = state.auth.userDetails?.email;
      const senderName = state.auth.userDetails?.first_name;
      const language = state.summary.language;
      const token = state.auth.token;
      const mode = state.app.mode;
      const summaryThreadHashes = state.summary.summaryThreadHashes;
      const conversationId = state.draft.conversationId;
      /* We use the hash to check if the emailThread changed (like a new mail was added) */
      /* It is an async task and we need to wait for it despite we have the conversationId */
      const emailThread = (await getPreviousThread(conversationId, mode as OfficeModes)) ?? "";
      const currentThreadHash = hashString(emailThread);

      const oneSentenceSummaryAlreadyStoredIndex = summaryThreadHashes.findIndex(
        (summaryHash) => summaryHash.conversationId === conversationId && summaryHash.type === "short",
      );

      if (user) {
        /* We need that hash to check if the summary is already stored in cache */
        if (
          oneSentenceSummaryAlreadyStoredIndex !== -1 &&
          summaryThreadHashes[oneSentenceSummaryAlreadyStoredIndex].hash === currentThreadHash
        ) {
          dispatch(setOneSentenceSummaryRequestId(summaryThreadHashes[oneSentenceSummaryAlreadyStoredIndex].requestId));
        } else {
          const requestId = uuid4();
          await dispatch(setOneSentenceSummaryRequestId(requestId));
          await dispatch(
            addOneSentenceSummary({
              ...INITIAL_SUMMARY,
              request_id: requestId,
              conversationId: conversationId as string,
            }),
          );
          const oneSentenceSummary = await fetchThreadSummary(
            requestId,
            token as string,
            emailThread,
            senderName as string,
            senderEmail as string,
            SummaryOutputLength.SHORT,
            mode || undefined,
            language,
          );
          await dispatch(
            addSummaryThreadHash({
              hash: currentThreadHash,
              requestId: requestId,
              conversationId: conversationId as string,
              type: "short",
            }),
          );
          return oneSentenceSummary.payload as SummaryResponse;
        }
      }
      return null;
    } catch (error) {
      return rejectWithValue("Error fetching one sentence summary.");
    }
  },
);

export const fetchSummary = createAsyncThunk<any, void, { rejectValue: string; state: RootState }>(
  "summary/fetchSummary",
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState();
      const user = state.auth.userDetails;
      const senderEmail = state.auth.userDetails?.email;
      const senderName = state.auth.userDetails?.first_name;
      const token = state.auth.token;
      const mode = state.app.mode;
      const language = state.summary.language;
      const summaryThreadHashes = state.summary.summaryThreadHashes;
      const conversationId = state.draft.conversationId;
      const emailThread = (await getPreviousThread(conversationId, mode as OfficeModes)) ?? "";

      const currentThreadHash = hashString(emailThread);

      const summaryAlreadyStoredIndex = summaryThreadHashes.findIndex(
        (summaryHash) => summaryHash.conversationId === conversationId && summaryHash.type === "detailed",
      );

      if (user) {
        if (
          summaryAlreadyStoredIndex !== -1 &&
          summaryThreadHashes[summaryAlreadyStoredIndex].hash === currentThreadHash
        ) {
          await dispatch(setSummaryRequestId(summaryThreadHashes[summaryAlreadyStoredIndex].requestId));
        } else {
          const requestId = uuid4();
          await dispatch(setSummaryRequestId(requestId));
          await dispatch(
            addSummary({
              ...INITIAL_SUMMARY,
              request_id: requestId,
              conversationId: conversationId as string,
            }),
          );
          const summary = await fetchThreadSummary(
            requestId,
            token as string,
            emailThread,
            senderName as string,
            senderEmail as string,
            SummaryOutputLength.DETAILED,
            mode || undefined,
            language,
          );
          await dispatch(
            addSummaryThreadHash({
              hash: currentThreadHash,
              requestId: requestId,
              conversationId: conversationId as string,
              type: "detailed",
            }),
          );

          return summary.payload as SummaryResponse;
        }
      }
      return null;
    } catch (error) {
      return rejectWithValue("Error fetching summary");
    }
  },
);
