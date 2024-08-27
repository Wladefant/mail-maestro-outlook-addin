import axios from "axios";
import { UserProfile } from "../store/reducers/AuthReducer";
import { API_ENDPOINTS } from "./endpoints";

export const getUserAuthDetails = async (authToken: string): Promise<UserProfile | null> => {
  try {
    const userDetails = await axios.get<UserProfile>(API_ENDPOINTS.AUTH.USER, {
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
    return userDetails.data;
  } catch (error) {
    return null;
  }
};
