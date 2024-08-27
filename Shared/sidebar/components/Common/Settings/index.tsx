import GearIcon from "../../../../../Shared/common/Icon/GearIcon";

import { Box } from "@mui/material";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { openTaskPaneByOption, signOutFromPlatform } from "@platformSpecific/sidebar/utils/officeMisc";
import { fetchUserTextShortcuts } from "../../../store/actions/textShortcutsActions";
import { RootState } from "../../../store/store";
const openSettings = (token: string, dispatch: ThunkDispatch<RootState, void, AnyAction>, handleClose: () => void) => {
  openTaskPaneByOption("settings", token, {}, { height: 850, width: 1200 }, dispatch, handleClose);
};

export const SettingsMenu: React.FC = () => {
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  const token = useSelector((state: any) => state.auth.token);

  const refetchSettingsInfo = async () => {
    // Fetch text shortcuts to sync with changes made on settings dialog
    token && fetchTextShortcuts();
  };

  const fetchTextShortcuts = async () => {
    try {
      await dispatch(fetchUserTextShortcuts()).unwrap();
    } catch (error) {
      console.error("Error fetching text shortcuts.", error);
    }
  };

  const handleOpenSettings = () => {
    openSettings(token, dispatch, refetchSettingsInfo);
  };

  const handleSignOut = () => {
    // Sign out user (via google)
    signOutFromPlatform();
  };

  return (
    <Box display={"flex"}>
      <GearIcon style={{ cursor: "pointer" }} onClick={handleOpenSettings} />
      {/* <Menu
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
        {userPermissions?.can_use_text_shortcuts && (
          <StyledMenuItem onClick={handleOpenTextShortcuts}>
            <TypingIcon sx={{ marginRight: "5px", height: "15px", width: "15px", color: "#7468FF" }} />
            Text shortcuts
          </StyledMenuItem>
        )}
        {platformType !== "chrome_extension" && (
          <StyledMenuItem onClick={handleOpenFontPreferences}>
            <FontIcon sx={{ marginRight: "5px", height: "15px", width: "15px", color: "#7468FF" }} />
            Font preferences
          </StyledMenuItem>
        )}
        {showSubscriptionLink && (
          <StyledMenuItem onClick={handleOpenManageSubscription}>
            <CreditCardIcon sx={{ marginRight: "5px", height: "15px", width: "15px" }} />
            Subscription
          </StyledMenuItem>
        )}
        <StyledMenuItem onClick={handleOpenQAndA}>
          <MegaphoneIcon sx={{ marginRight: "5px", height: "15px", width: "15px" }} />
          Questions & Feedback
        </StyledMenuItem>
        {["DEVELOPMENT", "LOCAL"].includes(process.env.ENVIRONMENT || "") && (
          <StyledMenuItem onClick={handleOpenCustomInstructions}>
            <BookIcon sx={{ marginRight: "5px", height: "15px", width: "15px" }} />
            Custom instructions
          </StyledMenuItem>
        )}
        {["DEVELOPMENT", "LOCAL"].includes(process.env.ENVIRONMENT || "") && (
          <StyledMenuItem onClick={handleOpenSettings}>
            <GearIcon sx={{ marginRight: "5px", height: "15px", width: "15px" }} />
            Settings
          </StyledMenuItem>
        )}
        <StyledMenuItem onClick={handleOpenUsageTips}>
          <MagazineIcon sx={{ marginRight: "5px", height: "15px", width: "15px" }} />
          Usage tips
        </StyledMenuItem>
        <StyledMenuItem onClick={handleOpenTourVideo}>
          <BubbleVideoIcon sx={{ marginRight: "5px", height: "15px", width: "15px" }} />
          MailMaestro tour video
        </StyledMenuItem>
        {!isMobile && (
          <StyledMenuItem onClick={handleOpenSignoffAndSignature}>
            <SignatureIcon sx={{ marginRight: "5px", height: "15px", width: "15px" }} />
            Sign-off & signature
          </StyledMenuItem>
        )}
        <StyledMenuItem onClick={handleClearCache}>
          <ClearIcon sx={{ marginRight: "5px", height: "15px", width: "15px" }} />
          Clear cache
        </StyledMenuItem>
        {process.env.PLATFORM_TYPE === "chrome_extension" && (
          <StyledMenuItem onClick={handleSignOut}>
            <SignoutIcon sx={{ marginRight: "5px", height: "15px", width: "15px" }} />
            Sign-out
          </StyledMenuItem>
        )}
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
      </Menu> */}
    </Box>
  );
};
