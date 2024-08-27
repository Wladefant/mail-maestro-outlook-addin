import { Box, Link, Typography } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import {
  SubscriptionData,
  selectUserDetails,
  selectUserSubscription,
  selectPricingTableUrl,
} from "../../../store/reducers/AuthReducer";
import { getExpiryOptions, getExtendFreeTrialLink } from "../../../utils/subscription";
import { toTitleCase } from "../../../utils/string";
import { useAppDispatch } from "../../../store/store";
import { setScreen, Screen } from "../../../store/reducers/AppReducer";

const getSubscriptionLinkFreeWeeks = (subscription: SubscriptionData, email: string) => {
  if (!subscription || subscription.type === "FREE" || subscription.type === "PILOT") {
    return null;
  }

  return (
    <Link
      href={getExtendFreeTrialLink(email)}
      target="_blank"
      rel="noopener noreferrer"
      color={"#131313"}
      fontFamily={"Inter"}
      fontWeight={"700"}
      fontSize={"9px"}
      margin={"0 5px"}
    >
      {!["PREMIUM", "TEAM", "ENTERPRISE", "LITE"].includes(subscription?.type)
        ? "Extend free trial"
        : "Earn free weeks"}
    </Link>
  );
};

const getSubscriptionLabel = (subscription: SubscriptionData, pricingTableUrl: string) => {
  const { remainingDays } = getExpiryOptions(subscription);

  if (!subscription) {
    return null;
  }

  return ["TRIAL"].includes(subscription?.type) ? (
    <Link
      href={pricingTableUrl}
      target="_blank"
      rel="noopener noreferrer"
      color={"#131313"}
      fontFamily={"Inter"}
      fontWeight={"700"}
      fontSize={"9px"}
      margin={"0 5px"}
    >
      {remainingDays === 0 ? "Upgrade" : `Free trial - ${remainingDays} day${remainingDays > 1 ? "s" : ""} left`}
    </Link>
  ) : (
    <Typography
      color={subscription.type === "PILOT" ? "#7468FF" : "#131313"}
      fontFamily={"Inter"}
      fontWeight={"700"}
      fontSize={"9px"}
      margin={"0 5px"}
    >
      {toTitleCase(subscription?.type as string)} plan
    </Typography>
  );
};

const getUpgradeToPremiumLabel = (subscription: SubscriptionData, onGoPremiumClick: () => void) => {
  if (!subscription || subscription.type !== "FREE") {
    return null;
  }

  return (
    <Typography
      color={"linear-gradient(90deg, #7468FF 13.28%, #8A2EE7 84.43%)"}
      fontFamily={"Inter"}
      fontWeight={"700"}
      fontSize={"9px"}
      margin={"0 5px"}
      sx={{
        background: "linear-gradient(90deg, #7468FF 13.28%, #8A2EE7 84.43%)",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        "&:hover": {
          cursor: "pointer",
        },
      }}
      onClick={onGoPremiumClick}
    >
      Upgrade to Premium
    </Typography>
  );
};

export const SubscriptionHeader: React.FC = () => {
  const subscription = useSelector(selectUserSubscription);
  const userDetails = useSelector(selectUserDetails);

  const pricingTableUrl = useSelector(selectPricingTableUrl);
  const dispatch = useAppDispatch();

  const onUpgradeToPremiumClick = () => {
    dispatch(setScreen(Screen.SubscriptionExpired));
  };

  return (
    <>
      {getSubscriptionLabel(subscription as SubscriptionData, pricingTableUrl as string)}
      {(subscription?.type === "FREE" || subscription?.type !== "PILOT") && (
        <Box fontSize={"20px"} color={"#7468FF"}>
          ·
        </Box>
      )}
      {getUpgradeToPremiumLabel(subscription as SubscriptionData, onUpgradeToPremiumClick)}
      {getSubscriptionLinkFreeWeeks(subscription as SubscriptionData, userDetails?.email as string)}
    </>
  );
};
