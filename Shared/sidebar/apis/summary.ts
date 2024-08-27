import axios from "axios";
import { API_ENDPOINTS, RESPONSE_TYPES } from "./endpoints";

export enum SummaryOutputLength {
  SHORT = "Short",
  DETAILED = "Detailed",
}

export const fetchThreadSummary = async (
  requestId: string,
  authToken: string,
  emailThread: string,
  sender: string,
  sender_address: string,
  outputLength?: SummaryOutputLength,
  mode?: string,
  language?: string | null,
) => {
  try {
    const summary = await axios.post(
      API_ENDPOINTS.EMAIL.SUMMARIZE,
      {
        request_id: requestId,
        sender,
        sender_address,
        mail_body: emailThread,
        stream: true,
        ...(outputLength && { output_length: outputLength }),
        mode,
        ...(language && { language }),
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
  } catch (error) {
    return {
      type: RESPONSE_TYPES.ERROR,
      payload: error,
    };
  }
};
