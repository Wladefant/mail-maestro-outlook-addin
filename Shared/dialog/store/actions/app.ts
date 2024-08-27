import { getUserAuthDetails } from "../../../sidebar/apis/auth";
import { UserProfile } from "../../../sidebar/store/reducers/AuthReducer";
import { saveUserProfileAPI } from "../../utils/api";
import { setUserProfile } from "../reducers/app";
import { AppDispatch, RootState } from "../store";

export const fetchUsersDetails = (authToken: string) => async (dispatch: AppDispatch) => {
  const response = await getUserAuthDetails(authToken);
  if (!response) {
    return;
  }
  dispatch(setUserProfile(response as UserProfile));
};

export const saveUserProfile =
  (userProfile: UserProfile) => async (_dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const authToken = state.dialog.token;
    await saveUserProfileAPI(authToken as string, userProfile);
  };
