import { Box } from "@mui/material";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserDetails } from "../../../store/actions/authAction";
import { Screen, setScreen } from "../../../store/reducers/AppReducer";
import { selectToken } from "../../../store/reducers/AuthReducer";
import { RootState } from "../../../store/store";
import FirstAccess from "./FirstAcess";
import InitialScreen from "./InitialScreen";
import { isMobileApp } from "@platformSpecific/sidebar/utils/office";
import { setPlatformSetting, getPlatformSetting } from "@platformSpecific/sidebar/utils/officeMisc";
import { useNavigate } from "react-router-dom";

const USER_ONBOARDED = "onboarded";

const StartScreen = () => {
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const [isFirstRun, setIsFirstRun] = useState(false);
  const [showTourDialog, setShowTourDialog] = React.useState(false);
  const token = useSelector(selectToken);
  const dialogRef = useRef<any>(null);
  const navigate = useNavigate();

  const closeSettingsDialog = async () => {
    dialogRef.current && dialogRef.current.close();
  };

  useEffect(() => {
    const getOnboardingStatus = async () => {
      const hasCompletedOnboarding = isMobileApp() ? true : await getPlatformSetting(USER_ONBOARDED);
      setIsFirstRun(!hasCompletedOnboarding);
      //Disable tour dialog for now
      //setShowTourDialog(!hasCompletedOnboarding);
    };
    getOnboardingStatus();
  }, []);

  const onBoardingCompleted = async () => {
    // reload the user details because the onboarding dialog might have changed the profile
    await dispatch(fetchUserDetails(token || "")).unwrap();
    dispatch(setScreen(Screen.Start));
    navigate("/");
    //Disable tour dialog for now
    //setShowTourDialog(false);
    setPlatformSetting(USER_ONBOARDED, true);
  };

  const onSkip = () => {
    //Disable tour dialog for now
    //setShowTourDialog(false);
    setPlatformSetting(USER_ONBOARDED, true);
    closeSettingsDialog();
  };

  const handleStartOnboarding = () => {
    setIsFirstRun(false);
    onBoardingCompleted();
    //Disable onboarding for now
    /* startOnboarding(
      (dialog: any) => {
        setIsFirstRun(false);
        dialogRef.current = dialog;
      },
      token as string,
      onBoardingCompleted,
    ); */
  };

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      sx={{
        background: "linear-gradient(180deg, #FFF 0%, #ECEBFF 100%)",
      }}
      height={"100vh"}
      position={"relative"}
    >
      {isFirstRun ? (
        <FirstAccess startOnboarding={handleStartOnboarding} />
      ) : (
        <InitialScreen isFirstRun={isFirstRun} showTourDialog={showTourDialog} onSkip={onSkip} />
      )}
    </Box>
  );
};

export default StartScreen;
