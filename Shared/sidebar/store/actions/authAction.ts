import { createAsyncThunk } from "@reduxjs/toolkit";
import { getUserAuthDetails } from "../../apis/auth";
import { storeOutlookItemStats, storeSentEmails } from "../../apis/reports";
import { getAuthToken } from "../../utils/api";
import { RootState } from "../store";
import { Screen, setScreen } from "../reducers/AppReducer";
import { checkIfTokenIsExpired } from "../../utils/datetime";

export type TokenData = {
  token: string | null;
  expiry: string | null;
} | null;

export const fetchToken = createAsyncThunk<TokenData, void, { rejectValue: string }>(
  "auth/fetchToken",
  async (_, { rejectWithValue, getState, dispatch }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    if (token && !checkIfTokenIsExpired(parseInt(state.auth.tokenExpiry ?? "0"))) {
      return { token, expiry: state.auth.tokenExpiry };
    }
    try {
      const tokenData = await getAuthToken();
      return tokenData;
    } catch (error) {
      dispatch(setScreen(Screen.Unauthenticate));
      return rejectWithValue("Error fetching token");
    }
  },
);

/*
    This function is used to fetch user details if they need to be updated:

    - If the user details are not present
    - If the user details are present but they are older than an hour
    - If the subscription is expired
 */
export const fetchUserDetailsIfNeeded = (token: string) => async (dispatch: any, getState: () => RootState) => {
  const state = getState() as RootState;
  const userDetails = state.auth.userDetails;
  if (
    !userDetails ||
    !userDetails.lastFetched ||
    // only fetch user details if it's been more than an hour
    new Date().getTime() - new Date(userDetails.lastFetched).getTime() > 1000 * 60 * 60 ||
    // or if the subscription is expired
    new Date(userDetails.subscription.hard_end_date).getTime() - new Date().getTime() <= 0
  ) {
    return dispatch(fetchUserDetails(token));
  }
  return;
};

export const fetchUserDetails = createAsyncThunk<any, string, { rejectValue: string }>(
  "auth/fetchUserDetails",
  async (token, { rejectWithValue }) => {
    try {
      const userDetails = await getUserAuthDetails(token);
      return userDetails;
    } catch (error) {
      return rejectWithValue("Error fetching user details");
    }
  },
);

export const sentEmailStats = (emails: any) => async (_: any, getState: () => RootState) => {
  const state = getState();
  const authToken = state.auth.token;

  if (authToken) {
    await storeSentEmails(authToken, emails);
  }
};

export const outlookItemStats = (data: any) => async (_: any, getState: () => RootState) => {
  const state = getState();
  const authToken = state.auth.token;
  const itemId = state.app.itemId;

  if (authToken && itemId) {
    await storeOutlookItemStats(authToken, data, itemId);
  }
};
