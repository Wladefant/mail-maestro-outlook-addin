import axios from "axios";
import { DraftAction } from "../store/reducers/AppReducer";
import { API_ENDPOINTS, RESPONSE_TYPES } from "./endpoints";

export const getUserPromptTemplates = async (authToken: string) => {
  try {
    const userTemplates = await axios.get(API_ENDPOINTS.EMAIL.EXAMPLES, {
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
    return {
      type: RESPONSE_TYPES.SUCCESS,
      payload: userTemplates.data,
    };
  } catch (error) {
    return {
      type: RESPONSE_TYPES.ERROR,
      payload: error,
    };
  }
};

export const getMagicTemplates = async (authToken: string, action: DraftAction) => {
  try {
    const userTemplates = await axios.get(API_ENDPOINTS.MAGIC_TEMPLATES, {
      headers: {
        Authorization: `Token ${authToken}`,
      },
      params: {
        kind: action.toUpperCase(),
      },
    });
    return {
      type: RESPONSE_TYPES.SUCCESS,
      payload: userTemplates.data,
    };
  } catch (error) {
    return null;
  }
};
