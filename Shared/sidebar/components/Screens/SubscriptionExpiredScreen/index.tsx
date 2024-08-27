import { Box, Link, Typography } from "@mui/material";
import Divider from "@mui/material/Divider";
import { isNativeApp } from "@platformSpecific/sidebar/utils/officeMisc";
import React from "react";
import { useSelector } from "react-redux";
import {
  SubscriptionData,
  selectPricingTableUrl,
  selectToken,
  selectUserSubscription,
} from "../../../store/reducers/AuthReducer";
import { handleReload } from "../../../utils/browser";
import Header from "../../Common/Header";
import PrimaryButton from "../../Common/UI/PrimaryButton";
import SecondaryButton from "../../Common/UI/SecondaryButton";
import PricingTable from "./PricingTable";
import { CrossIcon } from "../../../../common/Icon/CrossIcon";
import { useAppDispatch } from "../../../store/store";
import { setScreen, Screen } from "../../../store/reducers/AppReducer";
import { getExpiryOptions } from "../../../utils/subscription";
import { DottedCheckIcon } from "../../../../common/Icon/SubscriptionExpired/DottedCheckIcon";
import { downgradeToFreePlan } from "./api";
import { StarIcon } from "../../../../common/Icon/SubscriptionExpired/StarIcon";

const SubscriptionExpiredScreen: React.FC = () => {
  const isNative = isNativeApp();
  const pricingTableUrl = useSelector(selectPricingTableUrl);
  const [showPricingTable, setShowPricingTable] = React.useState(false);
  const dispatch = useAppDispatch();
  const subscriptionData = useSelector(selectUserSubscription);
  const { showSubscriptionExpired } = getExpiryOptions(subscriptionData as SubscriptionData);
  const token = useSelector(selectToken);
  const subscription = useSelector(selectUserSubscription);
  const freePlanButtonRef = React.useRef<HTMLButtonElement>(null);

  const handleGoBack = () => {
    dispatch(setScreen(Screen.Start));
  };

  const onUpgradeToPremiumClick = () => {
    window.open(pricingTableUrl, "_blank");
  };

  const onReloadClick = () => {
    handleReload();
  };

  const onStayOnFreePlanClick = () => {
    freePlanButtonRef.current?.blur();
    setShowPricingTable(true);
  };

  const onDowngradeToFreePlanClick = async () => {
    if (subscription?.type === "FREE") {
      handleGoBack();
    } else {
      await downgradeToFreePlan(token as string);
      handleReload();
    }
  };

  const renderPricingTable = () => {
    return (
      <>
        <Box marginTop={"16px"} padding={"16px"}>
          <Typography fontFamily={"DM Sans"} fontWeight={"700"} fontSize={"16px"} color={"#7468FF"} lineHeight={"24px"}>
            Are you sure?
          </Typography>
          <Typography
            fontFamily={"DM Sans"}
            fontWeight={"400"}
            fontSize={"14px"}
            color={"#595D62"}
            lineHeight={"20px"}
            marginTop={"8px"}
          >
            The best of AI enabled email productivity features are waiting for you in the Premium plan.
          </Typography>
        </Box>
        <Divider
          sx={{
            marginTop: "16px",
            marginBottom: "8px",
            marginLeft: "16px",
            marginRight: "16px",
            backgroundColor: "#E8E7FF",
          }}
        />
        <PricingTable />
        <Divider
          sx={{
            marginTop: "8px",
            marginBottom: "16px",
            marginLeft: "16px",
            marginRight: "16px",
            backgroundColor: "#E8E7FF",
          }}
        />
        <Box display={"flex"} justifyContent={"flex-end"} alignItems={"center"} paddingRight={"16px"}>
          <DottedCheckIcon
            sx={{
              backgroundColor: "rgba(116, 104, 255, 0.12)",
              borderRadius: "4px",
              padding: "2px",
              marginRight: "2px",
            }}
          />{" "}
          <Typography fontFamily={"DM Sans"} fontWeight={"400"} fontSize={"12px"} lineHeight={"16px"}>
            = 3 AI emails/week
          </Typography>
        </Box>
      </>
    );
  };

  const renderInitialContent = () => {
    return (
      <>
        <Box display={"flex"} justifyContent={"center"} marginTop={"16pxpx"} marginBottom={"24px"}>
          <img src={"../../../assets/expired-image.svg"} />
        </Box>
        <Box margin={"8px"}>
          <Typography
            textAlign={"center"}
            fontFamily={"DM Sans"}
            fontWeight={"700"}
            fontSize={"14px"}
            color={"#7468FF"}
          >
            Write with AI, without limits
          </Typography>
          <Typography
            textAlign={"center"}
            fontFamily={"DM Sans"}
            fontWeight={"400"}
            fontSize={"12px"}
            color={"#595D62"}
            lineHeight={"16px"}
          >
            Send professional & fluent emails quickly
          </Typography>
        </Box>

        <Box margin={"8px"}>
          <Typography
            textAlign={"center"}
            fontFamily={"DM Sans"}
            fontWeight={"700"}
            fontSize={"14px"}
            color={"#7468FF"}
          >
            Summarize emails & attachments
          </Typography>
          <Typography
            textAlign={"center"}
            fontFamily={"DM Sans"}
            fontWeight={"400"}
            fontSize={"12px"}
            color={"#595D62"}
            lineHeight={"16px"}
          >
            stay on top of your inbox
          </Typography>
        </Box>

        <Box margin={"8px"}>
          <Typography
            textAlign={"center"}
            fontFamily={"DM Sans"}
            fontWeight={"700"}
            fontSize={"14px"}
            color={"#7468FF"}
          >
            Optimize your scheduling
          </Typography>
          <Typography
            textAlign={"center"}
            fontFamily={"DM Sans"}
            fontWeight={"400"}
            fontSize={"12px"}
            color={"#595D62"}
            lineHeight={"16px"}
          >
            Get back more of your time
          </Typography>
        </Box>
      </>
    );
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(180deg, #FFF 0%, #ECEBFF 100%)",
      }}
      height={"100vh"}
    >
      <Header isNative={isNative} startScreen={true} isFirstRun={true} />
      {!showSubscriptionExpired && (
        <Box
          sx={{
            position: "absolute",
            top: "30px",
            right: "10%",
            "&:hover": {
              cursor: "pointer",
            },
          }}
          onClick={handleGoBack}
        >
          <CrossIcon sx={{ width: "16px", height: "16px" }} />
        </Box>
      )}
      <Box display={"flex"} flexDirection={"column"} justifyItems={"center"} justifyContent={"center"}>
        {showSubscriptionExpired && !showPricingTable && (
          <Box margin={"24px"}>
            <Typography
              textAlign={"center"}
              fontFamily={"DM Sans"}
              fontWeight={"700"}
              fontSize={"16px"}
              color={"#7468FF"}
              lineHeight={"24px"}
            >
              Your subscription has expired
            </Typography>
          </Box>
        )}
        {showPricingTable ? renderPricingTable() : renderInitialContent()}
        <Box
          display={"flex"}
          alignItems={"center"}
          flexDirection={"column"}
          justifyContent={"center"}
          marginTop={"24px"}
        >
          <PrimaryButton
            sx={{
              marginBottom: "8px",
              width: "85%",
            }}
            onClick={onUpgradeToPremiumClick}
          >
            Upgrade to premium
            <StarIcon
              sx={{
                marginLeft: "5px",
              }}
            />
          </PrimaryButton>
          <SecondaryButton
            sx={{
              width: "85%",
            }}
            ref={freePlanButtonRef}
            onClick={showPricingTable ? onDowngradeToFreePlanClick : onStayOnFreePlanClick}
          >
            {showPricingTable ? "Stay on free plan" : "Use free version for now"}
          </SecondaryButton>
        </Box>
        <Box marginTop={"16px"} marginBottom={"32px"}>
          <Typography
            textAlign={"center"}
            fontFamily={"DM Sans"}
            fontWeight={"400"}
            fontSize={"12px"}
            color={"#595D62"}
            lineHeight={"16px"}
          >
            Already a premium user?
            <Link
              sx={{
                marginLeft: "3px",
                textDecoration: "none",
                color: "#7468FF",
                "&:hover": {
                  cursor: "pointer",
                },
              }}
              onClick={onReloadClick}
            >
              Refresh
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SubscriptionExpiredScreen;
