import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchToken, fetchUserDetails, TokenData } from "../actions/authAction";
import { RootState } from "../store";
import { SignoffAndSignatureTypes } from "../../../dialog/components/Screens/SignoffAndSignature/types";
import { FontPreferences } from "../../components/Screens/FontPreferences/types";

export type SubscriptionData = {
  type: "PREMIUM" | "PILOT" | "TRIAL" | "TEAM" | "ENTERPRISE" | "LITE" | "FREE";
  status: "active" | "disabled" | "canceled" | "expired" | "expiring";
  soft_end_date: string;
  hard_end_date: string;
  maestro_promo: boolean;
  drafts_left: number | null;
  refill_date: string;
};

export type UserPermissions = {
  can_summarize_attachments: boolean;
  can_summarize_emails: boolean;
  can_extract_timeslots: boolean;
  can_use_text_shortcuts: boolean;
  can_use_prompt_history: boolean;
  can_rapid_reply: boolean;
  can_partial_improve: boolean;
  can_use_private_magic_templates: boolean;
  can_use_public_magic_templates: boolean;
};

export type OrganizationData = {
  name: string;
  contact_email: string;
  contact_name: string;
};

export type Settings = {
  pusher_channel: string;
  pricing_table_url: string;
};

export type UserProfile = {
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  profile: {
    signatures: SignoffAndSignatureTypes[];
    font_preferences: FontPreferences;
    greeting: string;
    company_name: string;
    company_title: string;
    is_onboarding_completed: boolean;
    timezone: string;
    full_name: string;
  };
  organization: OrganizationData;
  subscription: SubscriptionData;
  permissions: UserPermissions;
  ganalytics_id: string;
  settings: Settings;
  is_org_admin?: boolean;
  lastFetched: string;
};

interface AuthState {
  token: string | null;
  tokenExpiry: string | null;
  userDetails: UserProfile | null;
  error: string | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  token: null,
  tokenExpiry: null,
  userDetails: null,
  error: null,
  isLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setIsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setTokenExpiry(state, action: PayloadAction<string>) {
      state.tokenExpiry = action.payload;
    },
    signOut(state) {
      state.token = initialState.token;
      state.tokenExpiry = initialState.tokenExpiry;
      state.userDetails = initialState.userDetails;
    },
    setFontPreferences(state, action: PayloadAction<FontPreferences>) {
      if (state.userDetails) {
        state.userDetails.profile.font_preferences = action.payload;
      }
    },
    decreaseDraftsLeft(state) {
      if (state.userDetails && state.userDetails.subscription) {
        state.userDetails.subscription.drafts_left = state.userDetails.subscription.drafts_left
          ? state.userDetails.subscription.drafts_left - 1
          : 0;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchToken.fulfilled, (state, action: PayloadAction<TokenData>) => {
        state.isLoading = false;
        state.token = action.payload?.token ?? null;
        state.tokenExpiry = action.payload?.expiry ?? null;
        state.error = null;
      })
      .addCase(fetchToken.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.isLoading = false;
        state.error = action.payload ?? "Error fetching token";
        state.tokenExpiry = null;
      })
      .addCase(fetchUserDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.isLoading = false;
        state.userDetails = action.payload;
        state.userDetails.lastFetched = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchUserDetails.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.isLoading = false;
        state.error = action.payload ?? "Error fetching user details";
      });
  },
});

export const { setIsLoading, signOut, setFontPreferences, decreaseDraftsLeft } = authSlice.actions;

export const selectToken = (state: RootState) => state.auth.token;
export const selectUserDetails = (state: RootState) => state.auth.userDetails;
export const selectUserSubscription = (state: RootState) => state.auth.userDetails?.subscription;
export const selectUserPermissions = (state: RootState) => state.auth.userDetails?.permissions;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectTokenExpiry = (state: RootState) => state.auth.tokenExpiry;
export const selectPricingTableUrl = (state: RootState) => {
  return state.auth.userDetails?.settings?.pricing_table_url;
};
export const selectFontPreferences = (state: RootState) => state.auth.userDetails?.profile.font_preferences;
export const selectRemainingCredits = (state: RootState) =>
  state.auth.userDetails?.subscription.drafts_left
    ? state.auth.userDetails?.subscription.drafts_left > 0
      ? state.auth.userDetails?.subscription.drafts_left
      : 0
    : 0;

export default authSlice.reducer;
