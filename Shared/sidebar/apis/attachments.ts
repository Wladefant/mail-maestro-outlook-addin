import axios from "axios";
import { API_ENDPOINTS, RESPONSE_TYPES } from "./endpoints";

export const fetchAttachmentSummaryAPI = async (
  requestId: string,
  authToken: string,
  sender: string,
  sender_address: string,
  file: string,
  mode?: string,
  language?: string,
) => {
  const summary = await axios.post(
    API_ENDPOINTS.EMAIL.SUMMARIZE_ATTACHMENT,
    {
      request_id: requestId,
      sender,
      sender_address,
      stream: true,
      mode,
      file,
      language,
    },
    {
      headers: {
        Authorization: `Token ${authToken}`,
      },
    },
  );
  return {
    type: RESPONSE_TYPES.SUCCESS,
    payload: summary.data,
  };
};
