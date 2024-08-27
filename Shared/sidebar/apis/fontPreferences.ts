import axios from "axios";
import { API_ENDPOINTS, RESPONSE_TYPES } from "./endpoints";
import { UserProfile } from "../store/reducers/AuthReducer";
import { FontPreferences } from "../components/Screens/FontPreferences/types";

export const getFontPreferences = async (authToken: string) => {
  try {
    const userDetails = await axios.get<UserProfile>(API_ENDPOINTS.ACCOUNTS.USER_PROFILE, {
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
    return {
      type: RESPONSE_TYPES.SUCCESS,
      payload: userDetails.data.profile.font_preferences,
    };
  } catch (error) {
    return null;
  }
};

export const updateFontPreferences = async (
  authToken: string,
  fontPreferences: FontPreferences,
): Promise<UserProfile["profile"]["font_preferences"] | null> => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Token ${authToken}`,
  };

  const apiParams = {
    font_preferences: fontPreferences,
  };

  try {
    const response = await axios.patch(API_ENDPOINTS.ACCOUNTS.USER_PROFILE, apiParams, { headers });
    return response.data;
  } catch (error) {
    console.error("Error on updating font preferences:", error);
    return null;
  }
};
