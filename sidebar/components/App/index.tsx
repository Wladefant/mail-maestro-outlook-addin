import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Userpilot } from "userpilot";
import usePusher, { EventResponse } from "../../../../Shared/sidebar/hooks/usePusher";
import { fetchToken, fetchUserDetails } from "../../../../Shared/sidebar/store/actions/authAction";
import {
  Screen,
  selectAlertMessage,
  selectDraftAction,
  selectItemId,
  selectScreen,
  selectShowAlert,
  setScreen,
  setShowAlert,
} from "../../../../Shared/sidebar/store/reducers/AppReducer";
import { RootState } from "../../../../Shared/sidebar/store/store";
import { usePlatformMetadata } from "../../hooks/usePlatformMetadata";
import { Snackbar } from "@mui/material";
import { Routing } from "@platformSpecific/sidebar/routing/routes";
import { useNavigation } from "@platformSpecific/sidebar/routing/useNavigation";
import * as Sentry from "@sentry/browser";
import { AlertMessage } from "../../../../Shared/sidebar/components/Common/Alert/AlertMessage";
import { useSentEmails } from "../../../../Shared/sidebar/hooks/useSentEmails";
import { restoreDrafts } from "../../../../Shared/sidebar/store/actions/draftActions";
import { setAttachments } from "../../../../Shared/sidebar/store/reducers/AttachmentsReducer";
import {
  selectToken,
  selectUserDetails,
  selectUserSubscription,
  SubscriptionData,
} from "../../../../Shared/sidebar/store/reducers/AuthReducer";
import {
  addFrameToDraft,
  selectConversationId,
  selectDraftId,
  selectIsLoading,
  setLoading,
} from "../../../../Shared/sidebar/store/reducers/DraftReducer";
import { addFrameToSummary } from "../../../../Shared/sidebar/store/reducers/SummaryReducer";
import { getAttachments } from "../../../../Shared/sidebar/utils/attachments";
import { EventName } from "../../../../Shared/sidebar/utils/constants";
import { getEvent } from "../../../../Shared/sidebar/utils/pusher";
import { getDomainFromEmail } from "../../../../Shared/sidebar/utils/string";
import { getExpiryOptions } from "../../../../Shared/sidebar/utils/subscription";
import useTrackPreviousLocation from "../../../../Shared/sidebar/hooks/useTrackPreviousLocation";

export interface AppProps {
  isOfficeInitialized: boolean;
}

const App = (props: AppProps) => {
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  const { isOfficeInitialized } = props;

  const userDetails = useSelector(selectUserDetails);
  const screen = useSelector(selectScreen);
  const isLoading = useSelector(selectIsLoading);
  const token = useSelector(selectToken);
  const draftAction = useSelector(selectDraftAction);
  const itemId = useSelector(selectItemId);
  const conversationId = useSelector(selectConversationId);
  const draftId = useSelector(selectDraftId);
  const subscriptionData = useSelector(selectUserSubscription);
  const showAlert = useSelector(selectShowAlert);
  const alertMessage = useSelector(selectAlertMessage);

  const { showSubscriptionExpired } = getExpiryOptions(subscriptionData as SubscriptionData);
  const showLitePlanExhaustedScreen = subscriptionData?.type === "LITE" && subscriptionData.drafts_left === 0;

  const event =
    screen === Screen.Start
      ? EventName.SUMMARIZE_SHORT
      : screen === Screen.Summary
        ? EventName.SUMMARIZE_DETAILED
        : getEvent(draftAction);

  useSentEmails();
  useTrackPreviousLocation();

  useNavigation({
    isOfficeInitialized,
    screen,
    token,
    userDetails,
    showSubscriptionExpired,
    showLitePlanExhaustedScreen,
    conversationId,
    isLoading,
  });

  usePusher(
    {
      channelName: userDetails?.settings?.pusher_channel as string,
      eventName: event as EventName,
    },
    (data: EventResponse) => {
      if (event === EventName.SUMMARIZE_SHORT || event === EventName.SUMMARIZE_DETAILED) {
        dispatch(
          addFrameToSummary({
            data,
            type: event === EventName.SUMMARIZE_SHORT ? "short" : "detailed",
          }),
        );
      } else {
        if (data.draft_id !== draftId) {
          return;
        }
        if (isLoading) {
          dispatch(setLoading(false));
          if (screen === Screen.Loading && data.draft_id === draftId) {
            dispatch(setScreen(Screen.DraftOutput));
          }
        }
        dispatch(
          addFrameToDraft({
            eventResponse: data,
            ...(conversationId && { conversationId }),
          }),
        );
      }
    },
    !showSubscriptionExpired,
  );

  usePlatformMetadata();

  useEffect(() => {
    if (!itemId) {
      return;
    }
    async function fetchAttachments() {
      const attachments = await getAttachments(itemId as string);
      dispatch(setAttachments(attachments));
    }
    fetchAttachments();
  }, [itemId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Dispatch the fetchToken action
        const tokenData = await dispatch(fetchToken()).unwrap();

        if (!tokenData?.token) {
          // Log exception to Sentry in case of no valid token
          Sentry.captureMessage(`fetchToken returned no valid token: ${token}`, "error");
        }
        // Dispatch the fetchUserDetails action with the obtained token
        await dispatch(fetchUserDetails(tokenData?.token ?? "")).unwrap();
      } catch (error) {
        console.error("Error fetching token or user details:", error);
      }
    };

    fetchData();
  }, [dispatch]);

  useEffect(() => {
    dispatch(restoreDrafts());
  }, [dispatch, conversationId, draftId, itemId]);

  useEffect(() => {
    if (userDetails?.email) {
      Userpilot.identify(userDetails.ganalytics_id, {
        name: userDetails.first_name,
        email: userDetails.email,
        created_at: userDetails.date_joined,
        subscription: subscriptionData?.type,
        subscription_end_date: subscriptionData?.soft_end_date,
        company: {
          name: getDomainFromEmail(userDetails.email),
          id: getDomainFromEmail(userDetails.email),
        },
        platform: "Outlook",
      });
    }
  }, [userDetails]);

  return (
    <>
      <Snackbar
        open={showAlert}
        autoHideDuration={6000}
        onClose={() => {
          dispatch(setShowAlert(false));
        }}
      >
        <AlertMessage
          onClose={() => {
            dispatch(setShowAlert(false));
          }}
          severity="success"
          sx={{ width: "100%" }}
        >
          {alertMessage}
        </AlertMessage>
      </Snackbar>
      <Routing />
    </>
  );
};

export default App;
