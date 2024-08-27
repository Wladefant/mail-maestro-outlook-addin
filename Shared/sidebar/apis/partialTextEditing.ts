import * as Sentry from "@sentry/browser";
import axios from "axios";
import { ImproveAction } from "../store/reducers/PartialTextEditingReducer";
import { API_ENDPOINTS, RESPONSE_TYPES } from "./endpoints";
import { formatAPIStructure } from "../utils/api";

export const getImproveActions = async (authToken: string) => {
  try {
    const improveActions = await axios.get(API_ENDPOINTS.IMPROVE_ACTIONS.GET_ACTIONS, {
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
    return {
      type: RESPONSE_TYPES.SUCCESS,
      payload: improveActions.data,
    };
  } catch (error) {
    return {
      type: RESPONSE_TYPES.ERROR,
      payload: error,
    };
  }
};

export async function improveTextPart(
  sender: string,
  sender_address: string,
  prompt_input: string,
  text_content: string,
  draft_id: string,
  improve_actions: ImproveAction,
  parent_id: string,
  authToken: string,
) {
  const apiEndpoint = API_ENDPOINTS.IMPROVE_ACTIONS.IMPROVE_TEXT;
  const apiParams = {
    sender,
    sender_address,
    prompt_input,
    text_content,
    draft_id,
    parent_id,
    improve_actions,
    stream: true,
  };

  const settings = formatAPIStructure(apiParams, authToken);

  const fetchResponse = await fetch(apiEndpoint, settings);
  if (!fetchResponse.ok) {
    Sentry.captureMessage("Error in fetchImproveResponse", "error");
  }
  return await fetchResponse.json();
}
