import axios from "axios";
import { API_ENDPOINTS } from "../../../apis/endpoints";
import * as Sentry from "@sentry/browser";

export const downgradeToFreePlan = async (
  authToken: string,
): Promise<{
  status: string;
}> => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Token ${authToken}`,
  };

  try {
    await axios.post(`${API_ENDPOINTS.SUBSCRIPTIONS.DOWNGRADE}`, {}, { headers });
    return {
      status: "downgraded to free plan",
    };
  } catch (error) {
    Sentry.captureMessage("Error downgrading account to free plan.", "error");
    return {
      status: "Error downgrading account to free plan:",
    };
  }
};
