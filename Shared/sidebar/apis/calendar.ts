import axios from "axios";
import { API_ENDPOINTS, RESPONSE_TYPES } from "./endpoints";

export const fetchTimeslotsAPI = async (
  requestId: string,
  authToken: string,
  sender: string,
  sender_address: string,
  mail_body: string,
  mode?: string,
  received_at?: string,
  default_timezone?: string,
) => {
  const timeslots = await axios.post(
    API_ENDPOINTS.EMAIL.TIMESLOTS,
    {
      request_id: requestId,
      sender,
      sender_address,
      stream: true,
      mode,
      mail_body,
      received_at,
      default_timezone,
    },
    {
      headers: {
        Authorization: `Token ${authToken}`,
      },
    },
  );
  return {
    type: RESPONSE_TYPES.SUCCESS,
    payload: timeslots.data,
  };
};
