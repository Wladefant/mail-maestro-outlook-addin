import { createAsyncThunk } from "@reduxjs/toolkit";
import { getRapidReply, rapidReplyData } from "../../apis/rapidReply";
import { OfficeModes } from "@platformSpecific/sidebar/hooks/usePlatformMetadata";
import { getPreviousThread, getPreviousMessage } from "@platformSpecific/sidebar/utils/office";
import {
  RapidReply,
  RapidReplyRequest,
  addRapidReplyMetadataItem,
  setSelectedRequestId,
} from "../reducers/RapidReplyReducer";
import { RootState } from "../store";

import * as Sentry from "@sentry/browser";
import { uuid4 } from "../../utils/uuid";
import { DraftAction, Screen, setDraftAction, setScreen } from "../reducers/AppReducer";
import { createDraftAction, draftMessageAction } from "./draftActions";

export const fetchRapidReplyAction = createAsyncThunk<any, void, { rejectValue: string; state: RootState }>(
  "calendar/fetchRapidReply",
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState();
      const token = state.auth.token;
      const draftId = uuid4();
      const tone = state.draft.tone;
      const language = state.summary.language;
      const senderEmail = state.auth.userDetails?.email;
      const mode = state.app.mode;
      const itemId = state.app.itemId;
      const conversationId = state.draft.conversationId;

      const rapidReplies = state.rapidReply.rapidReplies;
      const currentRapidReplyMetadata = state.rapidReply.rapidReplyMetadata.find((item) => item.itemId === itemId);

      const existingRapidReply = rapidReplies.find(
        (rapidReply) =>
          rapidReply.itemId === itemId &&
          currentRapidReplyMetadata?.requestId === rapidReply.rapidReplyRequest?.request_id &&
          currentRapidReplyMetadata?.language === language,
      );

      if (existingRapidReply) {
        return existingRapidReply;
      }

      let emailThread = "";
      if (itemId) {
        emailThread = (await getPreviousMessage(itemId, mode as OfficeModes)) ?? "";
      } else {
        emailThread = (await getPreviousThread(conversationId, mode as OfficeModes)) ?? "";
      }

      const rapidReplyData: rapidReplyData = {
        tone: tone,
        sender: senderEmail as string,
        sender_adress: senderEmail as string,
        draft_id: draftId as string,
        language: language as string,
        mail_body: emailThread,
      };

      if (token) {
        const requestId = uuid4();
        dispatch(setSelectedRequestId(requestId));
        dispatch(
          addRapidReplyMetadataItem({
            itemId: itemId as string,
            requestId,
            language: language as string,
          }),
        );
        const rapidReply = await getRapidReply(requestId, token as string, rapidReplyData);

        return {
          rapidReplyRequest: rapidReply?.payload as RapidReplyRequest,
          itemId: itemId,
        } as RapidReply;
      }
      return null;
    } catch (error) {
      return rejectWithValue("Error fetching rapid reply.");
    }
  },
);

export const createRapidReplyDraft = createAsyncThunk<any, string, { rejectValue: string; state: RootState }>(
  "rapidReply/createRapidReplyDraft",
  async (rapidReply: string, { rejectWithValue, dispatch }) => {
    try {
      dispatch(setScreen(Screen.Loading));
      dispatch(setDraftAction(DraftAction.REPLY));
      await dispatch(
        createDraftAction(DraftAction.RAPID_REPLY, {
          userDraft: rapidReply,
        }),
      );
      await dispatch(draftMessageAction());
      return null;
    } catch (error) {
      Sentry.captureException(error);
      return rejectWithValue("Error creating rapid reply draft");
    }
  },
);
