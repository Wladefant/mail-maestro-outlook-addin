import { Box, Dialog, Typography } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { ArrowClockWiseIcon } from "../../../../common/Icon/ArrowClockWiseIcon";
import { selectPricingTableUrl, selectUserDetails, selectUserSubscription } from "../../../store/reducers/AuthReducer";
import Header from "../../Common/Header";
import MenuButton from "../../Common/UI/MenuButton";
import { isNativeApp } from "@platformSpecific/sidebar/utils/officeMisc";
import { handleReload } from "../../../utils/browser";
const moment = require("moment");

const LitePlanExhaustedScreen: React.FC = () => {
  const isNative = isNativeApp();
  const userDetails = useSelector(selectUserDetails);
  const subscription = useSelector(selectUserSubscription);
  const pricingTableUrl = useSelector(selectPricingTableUrl);
  const currentDate = moment().utc();
  // Parse the target date (also in UTC)
  const targetDate = moment(subscription?.soft_end_date);
  // Calculate the difference in days
  const differenceInDays = targetDate.diff(currentDate, "days");

  const onUpgradeToPremiumClick = () => {
    window.open(pricingTableUrl, "_blank");
  };

  const onReloadClick = () => {
    handleReload();
  };

  return (
    <>
      <Header isNative={isNative} startScreen={true} isFirstRun={true} />
      <Box>
        <Dialog
          open={true}
          hideBackdrop
          disableEnforceFocus
          style={{ position: "initial" }}
          sx={{
            "& .MuiModal-backdrop": {
              backgroundColor: "transparent",
            },
            "& .MuiDialog-container": {
              display: "flex",
              flexWrap: "wrap",
              alignContent: "flex-start",
              backgroundColor: "transparent",
              marginTop: "20px",
              "& .MuiDialog-paper": {
                backdropFilter: "blur(20px)",
                boxShadow: "none",
                width: "100%",
                margin: "125px 0px",
              },
            },
          }}
        >
          <Box padding={"30px 15px"}>
            <Box
              textAlign={"center"}
              display={"flex"}
              flexDirection={"column"}
              alignItems={"center"}
              justifyContent={"center"}
              width={"100%"}
              paddingTop={"10px"}
              borderRadius={"10px"}
              marginBottom={"15px"}
              boxShadow={"0px 10px 30px 0px rgba(0,0,0,0.15)"}
            >
              <Typography fontFamily={"Inter"} fontWeight={"700"} fontSize={"20px"}>
                You have used your email capacity
              </Typography>
              <img
                style={{
                  marginTop: "20px",
                  marginBottom: "20px",
                }}
                src={"../../assets/subscription_expired.svg"}
                alt="writting"
              />
              <Box padding={"5px"}>
                <Typography fontFamily={"Inter"} fontSize={"14px"} fontWeight={"400"}>
                  Your usage limit will reset in <strong>{differenceInDays}</strong> days <br />
                  or
                </Typography>
                <MenuButton
                  sx={{
                    width: "100%",
                    background: "linear-gradient(90.2deg, #7468FF 13.28%, #8A2EE7 84.43%)",
                    borderRadius: "25px",
                    fontFamily: "Inter",
                    fontStyle: "normal",
                    fontWeight: "400",
                    fontSize: "13px",
                    height: "26px",
                    marginBottom: "5px",
                  }}
                  onClick={onUpgradeToPremiumClick}
                >
                  Upgrade to premium
                </MenuButton>
              </Box>
            </Box>
            <Box
              textAlign={"center"}
              display={"flex"}
              flexDirection={"column"}
              alignItems={"center"}
              justifyContent={"center"}
              width={"100%"}
              paddingTop={"5px"}
              paddingBottom={"5px"}
              borderRadius={"10px"}
              boxShadow={"0px 10px 30px 0px rgba(0,0,0,0.15)"}
            >
              <Box padding={"5px 10px"}>
                <Typography
                  fontFamily={"Inter"}
                  fontSize={"12px"}
                  fontWeight={"400"}
                  marginBottom={"10px"}
                  color="#7468FF"
                >
                  Reload if you bought premium subscription
                </Typography>
                <MenuButton
                  width={"100%"}
                  sx={{
                    fontFamily: "Inter",
                    fontWeight: "400",
                    fontSize: "13px",
                    borderRadius: "25px",
                    padding: "0",
                    width: "100px",
                    height: "30px",
                  }}
                  onClick={onReloadClick}
                >
                  <ArrowClockWiseIcon
                    sx={{
                      marginRight: "5px",
                    }}
                  />
                  Reload
                </MenuButton>
              </Box>
            </Box>
          </Box>
        </Dialog>
      </Box>
    </>
  );
};

export default LitePlanExhaustedScreen;
