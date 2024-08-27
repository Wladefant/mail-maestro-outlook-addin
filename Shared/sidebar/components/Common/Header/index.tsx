import { Box } from "@mui/material";
import Menu from "@mui/material/Menu";
import { isMobileApp } from "@platformSpecific/sidebar/utils/office";
import { setPlatformSetting } from "@platformSpecific/sidebar/utils/officeMisc";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import React from "react";
import { useDispatch } from "react-redux";
import { ArrowLeft } from "../../../../common/Icon/ArrowLeft";
import { ClearIcon } from "../../../../common/Icon/Settings/ClearIcon";
import { Screen, setScreen } from "../../../store/reducers/AppReducer";
import { RootState } from "../../../store/store";
import { handleClearCache, handleReload } from "../../../utils/browser";
import { SettingsMenu } from "../Settings";
import { StyledMenuItem } from "../Settings/styles";
import { SubscriptionHeader } from "../Subscription";
interface Props {
  isNative: boolean;
  onGoBack?: () => void;
  startScreen?: boolean;
  isFirstRun?: boolean;
}

const USER_ONBOARDED = "onboarded";

const Header: React.FC<Props> = ({ isNative, onGoBack, startScreen, isFirstRun }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  // @ts-ignore
  const platformType = process.env.PLATFORM_TYPE;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {/*{isNative && (*/}
      {/*  <img*/}
      {/*    width="162"*/}
      {/*    height="31"*/}
      {/*    src={UserInputBanner}*/}
      {/*    alt={"MailMaestro Logo"}*/}
      {/*    title={"MailMaestro Logo"}*/}
      {/*    style={{*/}
      {/*      marginTop: "10px",*/}
      {/*      marginLeft: "0px",*/}
      {/*      marginBottom: "10px",*/}
      {/*    }}*/}
      {/*  />*/}
      {/*)}*/}
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        autoFocus={false}
        sx={{
          borderRadius: "10px",
          border: "1px solid #E8E7FF",
          "& .MuiMenu-list": {
            padding: "8px",
            "& .MuiMenuItem-root": {
              padding: "3px 10px 3px 10px",
              "& .MuiTypography-root": {
                fontSize: "14px",
                padding: "3px",
              },
              borderRadius: "6px",
              "&:hover": {
                backgroundColor: "#E8E7FF",
              },
              "&.Mui-selected": {
                backgroundColor: "#FFFFFF",
                color: "#7468FF",
                textDecoration: "underline",
              },
            },
          },
        }}
      >
        <StyledMenuItem onClick={handleClearCache}>
          <ClearIcon sx={{ marginRight: "5px", height: "15px", width: "15px" }} />
          Clear cache
        </StyledMenuItem>
        {/* {process.env.PLATFORM_TYPE === "chrome_extension" && (
          <StyledMenuItem onClick={handleSignOut}>
            <SignoutIcon sx={{ marginRight: "5px", height: "15px", width: "15px" }} />
            Sign-out
          </StyledMenuItem>
        )} */}
        {/* @ts-ignore */}
        {["DEVELOPMENT", "LOCAL"].includes(process.env.ENVIRONMENT || "") && (
          <>
            <StyledMenuItem onClick={() => dispatch(setScreen(Screen.Debug))}>
              <ClearIcon sx={{ marginRight: "5px", height: "15px", width: "15px" }} />
              Debug Screen
            </StyledMenuItem>
            <StyledMenuItem
              onClick={() => {
                setPlatformSetting(USER_ONBOARDED, false);
                handleReload();
              }}
            >
              <ClearIcon sx={{ marginRight: "5px", height: "15px", width: "15px" }} />
              Reset onboarding state
            </StyledMenuItem>
          </>
        )}
      </Menu>
      <Box
        sx={{
          boxShadow: startScreen ? "none" : "0px 2px 5px -3px rgba(0, 0, 0, 0.3)",
          paddingBottom: "5px",
          paddingLeft: "15px",
          paddingRight: "15px",
          paddingTop: isMobileApp() || isNative ? "5px" : 0,
          minHeight: "23px",
        }}
        display={"flex"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Box>
          {onGoBack && (
            <div onClick={onGoBack} style={{ cursor: "pointer" }}>
              <ArrowLeft />
            </div>
          )}
        </Box>
        <Box display={"flex"} alignItems={"center"}>
          {/* @ts-ignore */}
          <Box
            sx={{
              fontFamily: "Inter",
              fontStyle: "normal",
              fontWeight: 400,
              fontSize: "8px",
              lineHeight: "10px",
              color: "#989898",
              "&:hover": {
                cursor: "pointer",
                color: "#7468FF",
              },
            }}
            onClick={handleClick}
          >
            {/* @ts-ignore */}v{process.env.npm_package_version}
          </Box>
          <Box display={"flex"} alignItems={"center"}>
            <SubscriptionHeader />
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            {!isFirstRun && <SettingsMenu />}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Header;
