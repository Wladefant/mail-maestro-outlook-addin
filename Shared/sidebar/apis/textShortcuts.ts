import axios from "axios";
import { TextShortcut } from "../store/reducers/TextShortcutsReducer";
import { TextShortcutFormValues } from "../components/Screens/TextShortcuts/TextShortcutDialog";
import { API_ENDPOINTS, RESPONSE_TYPES } from "./endpoints";

export const getUserTextShortcuts = async (authToken: string) => {
  try {
    const textShortcuts = await axios.get<TextShortcut[]>(API_ENDPOINTS.TEXT_SHORTCUTS, {
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
    return {
      type: RESPONSE_TYPES.SUCCESS,
      payload: textShortcuts.data,
    };
  } catch (error) {
    return {
      type: RESPONSE_TYPES.ERROR,
      payload: error,
    };
  }
};

export const addTextShortcut = async (authToken: string, data: TextShortcutFormValues) => {
  try {
    const response = await axios.post<TextShortcut>(
      API_ENDPOINTS.TEXT_SHORTCUTS,
      {
        tag: `!${data.shortcut}`,
        snippet: data.snippet,
      },
      {
        headers: {
          Authorization: `Token ${authToken}`,
        },
      },
    );
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

export const editTextShortcut = async (authToken: string, textShortcutId: string, data: TextShortcutFormValues) => {
  try {
    const response = await axios.patch(
      `${API_ENDPOINTS.TEXT_SHORTCUTS}${textShortcutId}/`,
      {
        tag: data.shortcut,
        snippet: data.snippet,
      },
      {
        headers: {
          Authorization: `Token ${authToken}`,
        },
      },
    );
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
