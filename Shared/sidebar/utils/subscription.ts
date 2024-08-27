import moment from "moment";
import { SubscriptionData } from "../store/reducers/AuthReducer";

export function getExpiryOptions(subscription: SubscriptionData) {
  const currentDate = new Date();
  const softEndDate = new Date(subscription?.soft_end_date);
  const remainingDays = Math.max(0, Math.ceil((softEndDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)));
  const hardEndDate = moment(subscription?.hard_end_date);
  const currentDatetime = moment();
  const subscriptionStatus = subscription?.status;

  const subscriptionTypeConfig = {
    TRIAL: {
      showDaysLeft: true,
      showSubscriptionIndicator: false,
      showSubscriptionExpired: currentDatetime.isAfter(hardEndDate),
      remainingDays: 0,
    },
    PREMIUM: {
      showDaysLeft: true,
      showSubscriptionIndicator: false,
      showSubscriptionExpired: currentDatetime.isAfter(hardEndDate) || subscriptionStatus === "canceled",
      remainingDays: 0,
    },
    LITE: {
      showDaysLeft: true,
      showSubscriptionIndicator: false,
      showSubscriptionExpired: currentDatetime.isAfter(hardEndDate) || subscriptionStatus === "canceled",
      remainingDays: 0,
    },
    PILOT: {
      showDaysLeft: false,
      showSubscriptionIndicator: true,
      showSubscriptionExpired: subscriptionStatus !== "active",
      remainingDays: 0,
    },
    TEAM: {
      showDaysLeft: true,
      showSubscriptionIndicator: false,
      showSubscriptionExpired: currentDatetime.isAfter(hardEndDate) || subscriptionStatus === "canceled",
      remainingDays: 0,
    },
    ENTERPRISE: {
      showDaysLeft: true,
      showSubscriptionIndicator: false,
      showSubscriptionExpired: currentDatetime.isAfter(hardEndDate) || subscriptionStatus === "canceled",
      remainingDays: 0,
    },
    FREE: {
      showDaysLeft: false,
      showSubscriptionIndicator: false,
      showSubscriptionExpired: false,
      remainingDays: 0,
    },
  };

  const subscriptionType = subscription?.type;
  const expiryOptions = subscriptionTypeConfig[subscriptionType] || {};

  expiryOptions.remainingDays = remainingDays;

  return expiryOptions;
}

export const getExtendFreeTrialLink = (email: string) => {
  return `https://referral.maestrolabs.com?email=${email}`;
};
