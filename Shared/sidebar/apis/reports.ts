import axios from "axios";
import { API_ENDPOINTS, RESPONSE_TYPES } from "./endpoints";
import { getFileExtension } from "../utils/attachments";

export const storeSentEmails = async (authToken: string, data: any) => {
  try {
    const response = await axios.post(API_ENDPOINTS.REPORTS.SENT_EMAILS, data, {
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
    return {
      type: RESPONSE_TYPES.SUCCESS,
      payload: response.data,
    };
  } catch (error) {
    return {
      type: RESPONSE_TYPES.ERROR,
      payload: error,
    };
  }
};

export const storeOutlookItemStats = async (authToken: string, attachments: any, itemId: string) => {
  const data = {
    id: itemId,
    attachments: attachments.map((attachment: any) => {
      return {
        file_size: attachment.size,
        file_extension: getFileExtension(attachment.name),
      };
    }),
  };

  try {
    const response = await axios.post(API_ENDPOINTS.REPORTS.ITEM_STATS, data, {
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
    return {
      type: RESPONSE_TYPES.SUCCESS,
      payload: response.data,
    };
  } catch (error) {
    return {
      type: RESPONSE_TYPES.ERROR,
      payload: error,
    };
  }
};
