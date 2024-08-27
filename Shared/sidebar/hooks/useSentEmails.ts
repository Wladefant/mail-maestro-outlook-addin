import { useEffect } from "react";
import * as Sentry from "@sentry/browser";
import { getWithExpiry, setWithExpiry } from "../utils/localStorage";
import { getSentEmails } from "@platformSpecific/sidebar/utils/office";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { RootState } from "../store/store";
import { useDispatch, useSelector } from "react-redux";
import { sentEmailStats } from "../store/actions/authAction";

/**
 * A custom React hook that fetches sent emails from the outlook on App start.
 *
 * This code should only be run once a day.
 */
export const useSentEmails = () => {
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  useEffect(() => {
    // Get sent emails from user on App start.
    // This code should only be run once a day
    try {
      const executedToday = getWithExpiry("sentEmailsExecutedToday");
      if (!executedToday && token) {
        getSentEmails().then((emails) => {
          dispatch(sentEmailStats(emails));
        });
        setWithExpiry("sentEmailsExecutedToday", true, 24 * 60 * 60 * 1000);
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }, [token]);
};
