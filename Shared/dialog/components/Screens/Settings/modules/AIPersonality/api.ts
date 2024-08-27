import axios from "axios";
import * as Sentry from "@sentry/browser";
import { API_ENDPOINTS } from "../../../../../../sidebar/apis/endpoints";

export const updateCustomInstructions = async (
  authToken: string,
  customInstructions: string,
): Promise<{
  status: string;
}> => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Token ${authToken}`,
  };

  const apiParams = {
    prompt: customInstructions,
  };

  try {
    await axios.patch(`${API_ENDPOINTS.CUSTOM_INSTRUCTIONS}`, apiParams, { headers });
    return {
      status: "updated",
    };
  } catch (error) {
    Sentry.captureMessage("Error updating custom instructions", "error");
    return {
      status: "Error updating custom instructions",
    };
  }
};

export const getCustomInstructions = async (
  authToken: string,
): Promise<{
  status: string;
  customInstructions: string;
}> => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Token ${authToken}`,
  };

  try {
    const response = await axios.get(API_ENDPOINTS.CUSTOM_INSTRUCTIONS, { headers });
    return {
      status: "success",
      customInstructions: response.data.prompt,
    };
  } catch (error) {
    Sentry.captureMessage("Error getting custom instructions", "error");
    return {
      status: "Error getting custom instructions",
      customInstructions: "",
    };
  }
};
