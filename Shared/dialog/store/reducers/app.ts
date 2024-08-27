import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserProfile } from "../../../sidebar/store/reducers/AuthReducer";
import { FontPreferences } from "../../components/Screens/Settings/modules/FontPreference/types";
import { RootState } from "../store";

interface AppState {
  userProfile: UserProfile | null;
  draftId: string | null;
  isLoading: boolean;
}

const initialState: AppState = {
  userProfile: null,
  draftId: null,
  isLoading: false,
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setDraftId: (state, action: PayloadAction<string | null>) => {
      state.draftId = action.payload;
    },
    setUserProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.userProfile = action.payload;
    },
    setFontPreferences(state, action: PayloadAction<FontPreferences>) {
      if (state.userProfile) {
        state.userProfile.profile.font_preferences = action.payload;
      }
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    changeUserAccountName: (state, action: PayloadAction<string>) => {
      if (state.userProfile) {
        state.userProfile.profile.full_name = action.payload;
      }
    },
  },
});

export const { setUserProfile, setDraftId, setFontPreferences, setIsLoading, changeUserAccountName } = appSlice.actions;

export const selectUserDetails = (state: RootState) => state.app.userProfile;
export const selectIsLoading = (state: RootState) => state.app.isLoading;

export default appSlice.reducer;
