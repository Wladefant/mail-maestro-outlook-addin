import axios from "axios";
import { API_ENDPOINTS, RESPONSE_TYPES } from "./endpoints";

export type rapidReplyData = {
  tone: string;
  sender: string;
  sender_adress: string;
  draft_id: string;
  language: string;
  mail_body: string;
};

export const getRapidReply = async (requestId: string, authToken: string, rapidReplyData: rapidReplyData) => {
  try {
    const rapidReply = await axios.post(
      API_ENDPOINTS.EMAIL.RAPID_REPLY,
      {
        request_id: requestId,
        ...rapidReplyData,
        stream: true,
      },
      {
        headers: {
          Authorization: `Token ${authToken}`,
        },
      },
    );
    return {
      type: RESPONSE_TYPES.SUCCESS,
      payload: rapidReply.data,
    };
  } catch (error) {
    return null;
  }
};
