import { isMac } from "@fluentui/react";
import { Box, Typography } from "@mui/material";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import React, { useEffect, useRef } from "react";
import ReactGA from "react-ga4";
import { useHotkeys } from "react-hotkeys-hook";
import { useDispatch, useSelector } from "react-redux";

import { ArrowRight } from "../../../../../common/Icon/ArrowRight";
import { Documents } from "../../../../../common/Icon/Documents";
import { DraftAction, Screen, selectScreen, setScreen } from "../../../../store/reducers/AppReducer";

import {
  copyToClipboardAction,
  pasteToOutlookAction,
  setSelectedDraftAction,
} from "../../../../store/actions/draftActions";
import { resetImprovedTextPart } from "../../../../store/actions/partialTextEditingActions";
import {
  Draft,
  resetGeneratedDrafts,
  resetUserDraft,
  selectAvailableDraftOptions,
  selectCurrentUserDraft,
  selectDisableDraftButtons,
  selectDisplayedGeneratedDrafts,
  selectDisplayedGeneratedDraftsRequestIds,
  selectDraftId,
  selectRequestIdFromSelectedGeneratedDraft,
  selectRequestIdIndexOfSelectedGeneratedDraft,
  selectSelectedGeneratedDraft,
  setCreditAlreadyUsedOnCurrentDraftId,
  setDraftId,
} from "../../../../store/reducers/DraftReducer";
import {
  selectSelectedTemplate,
  selectSelectedTemplateId,
  setTemplateId,
} from "../../../../store/reducers/MagicTemplateReducer";
import { selectButtonYPosition } from "../../../../store/reducers/PartialTextEditingReducer";
import { RootState } from "../../../../store/store";
import { GA4_EVENTS } from "../../../../utils/events";
import { isMobileApp } from "@platformSpecific/sidebar/utils/office";
import DraftOption from "../../../Common/DraftOption";
import { DraftTextArea } from "../../../Common/DraftOutput/components/DraftTextArea";
import { Voting } from "../../../Common/DraftOutput/components/Voting";
import Header from "../../../Common/Header";
import PrimaryButton from "../../../Common/UI/PrimaryButton";
import SecondaryButton from "../../../Common/UI/SecondaryButton";
import { PartialTextEditingButton } from "../PartialTextEditing/PartialTextEditingButton";
import { updateEmailStatuses } from "../../../../apis/draft";
import {
  selectRemainingCredits,
  selectToken,
  selectUserDetails,
  selectUserPermissions,
} from "../../../../store/reducers/AuthReducer";
import { isNativeApp } from "@platformSpecific/sidebar/utils/officeMisc";
import { INTERNAL_MAGIC_TEMPLATES } from "../../../../utils/constants";
import { TypingIcon } from "../../../../../common/Icon/InitialScreen/TypingIcon";
import { selectShowDialog, setShowDialog } from "../../../../store/reducers/TextShortcutsReducer";
import { TextShortcutsDialog } from "../../TextShortcuts/TextShortcutsDialog";
import { CustomTooltip, OptionButtonTooltip } from "../../../Common/Tooltip";
import { WarningInfoIcon } from "../../../../../common/Icon/WarningInfoIcon";
import { getDayOfWeek } from "../../../../utils/datetime";
import WatermarkDialog from "../WatermarkDialog";
import { InfoIcon } from "../../../../../common/Icon/InfoIcon";
import { StarIcon } from "../../../../../common/Icon/SubscriptionExpired/StarIcon";

// @ts-ignore
const PASTE_BUTTON_TEXT = process.env.PLATFORM_TYPE === "chrome_extension" ? "Gmail" : "Outlook";

const DraftOutput = () => {
  const [copyButtonText, setCopyButtonText] = React.useState("Copy Draft");
  const [showWatermarkDialog, setShowWatermarkDialog] = React.useState(false);
  const [showCopyConfirmation, setShowCopyConfirmation] = React.useState(false);
  const isNative = true; //isNativeApp();
  const isMobile = isMobileApp();
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const gaId = useSelector((state: RootState) => state.auth?.userDetails?.ganalytics_id);
  const screen = useSelector(selectScreen);
  const currentUserDraft = useSelector(selectCurrentUserDraft);
  const draftId = useSelector(selectDraftId);
  const selectedGeneratedDraft = useSelector(selectSelectedGeneratedDraft);
  const displayedGeneratedDrafts = useSelector(selectDisplayedGeneratedDrafts);
  const token = useSelector(selectToken);
  const displayedGeneratedDraftsRequestIds = useSelector(selectDisplayedGeneratedDraftsRequestIds);
  const selectedDraftRequestId = useSelector(selectRequestIdFromSelectedGeneratedDraft);
  const requestIdIndexOfCurrentSelectedGeneratedDraft = useSelector(selectRequestIdIndexOfSelectedGeneratedDraft);
  const availableDraftOptions = useSelector(selectAvailableDraftOptions);
  const numberOfGeneratedOptionsForStaticTemplates = 1;
  const disableButtons = useSelector(selectDisableDraftButtons);
  const partialTextEditingButtonYPosition = useSelector(selectButtonYPosition);
  const selectedTemplateId = useSelector(selectSelectedTemplateId);
  const selectedTemplate = useSelector(selectSelectedTemplate);
  const userPermissions = useSelector(selectUserPermissions);
  const textShortcutsDialogOpen = useSelector(selectShowDialog);
  const remainingCredits = useSelector(selectRemainingCredits);
  const userDetails = useSelector(selectUserDetails);

  const isStaticTemplate = selectedTemplate?.static ?? false;
  const updateEmailStatusCalled = useRef(false);
  const faqReferences = selectedGeneratedDraft?.draft?.references || [];

  const hasFreeSubscription = userDetails?.subscription?.type === "FREE";

  const getGeneratedDraftByIndex = (index: number) => {
    const requestId = displayedGeneratedDraftsRequestIds[index];
    const selectedDraft = displayedGeneratedDrafts.find((draft) => draft.draft.request_id === requestId);

    if (selectedDraft) {
      return selectedDraft;
    }
    return null;
  };

  const pasteToOutlook = async () => {
    dispatch(setScreen(Screen.Start));
    await dispatch(pasteToOutlookAction());
  };

  const copyToClipboard = async () => {
    setCopyButtonText("Copied!");
    setShowCopyConfirmation(true);
    setTimeout(() => {
      setCopyButtonText("Copy draft");
    }, 1000);
    await dispatch(copyToClipboardAction());
  };

  useEffect(() => {
    if (selectedGeneratedDraft?.draft.finished && !updateEmailStatusCalled.current) {
      if (token) {
        updateEmailStatuses(
          {
            request_id: selectedGeneratedDraft.requestId,
            request_status: "viewed",
          },
          token,
        );
        updateEmailStatusCalled.current = true;
      }
    }
    return () => {
      updateEmailStatusCalled.current = false;
    };
  }, [selectedGeneratedDraft?.requestId, selectedGeneratedDraft?.draft.finished, token]);

  useEffect(() => {
    const firstOptionLoaded = displayedGeneratedDraftsRequestIds.length === 1;
    if (firstOptionLoaded) {
      dispatch(setSelectedDraftAction(0));
    }
  }, [displayedGeneratedDraftsRequestIds]);

  useEffect(() => {
    if (!selectedDraftRequestId) {
      dispatch(setSelectedDraftAction(0));
    }
  }, [displayedGeneratedDraftsRequestIds]);

  const mac = isMac();
  useHotkeys(
    "meta+s",
    () => {
      ReactGA.event(GA4_EVENTS.HOTKEY_COPY_TO_OUTLOOK, {
        draftID: draftId,
        userID: gaId,
      });
      pasteToOutlook();
    },
    {
      enabled: screen === Screen.DraftOutput && mac,
      preventDefault: true,
      enableOnFormTags: ["input", "textarea", "select"],
    },
  );
  useHotkeys(
    "ctrl+s",
    () => {
      ReactGA.event(GA4_EVENTS.HOTKEY_COPY_TO_OUTLOOK, {
        draftID: draftId,
        userID: gaId,
      });
      pasteToOutlook();
    },
    {
      enabled: screen === Screen.DraftOutput && !mac,
      preventDefault: true,
      enableOnFormTags: ["input", "textarea", "select"],
    },
  );

  const onTextShortcutsClick = () => {
    dispatch(setShowDialog(true));
  };

  const handleBackButtonClick = () => {
    ReactGA.event(GA4_EVENTS.BACK_BUTTON, { draftID: draftId, userID: gaId });
    // In case of timeslots_accept (and later rapid reply as well) we need to go back to the start screen
    if (
      selectedTemplateId === INTERNAL_MAGIC_TEMPLATES.TIMESLOTS_ACCEPT ||
      currentUserDraft?.draftAction === DraftAction.TIMESLOTS_ACCEPT ||
      currentUserDraft?.draftAction === DraftAction.REPLY_FAQ
    ) {
      dispatch(resetGeneratedDrafts());
      dispatch(resetUserDraft());
      dispatch(resetImprovedTextPart());
      dispatch(setTemplateId(null));
      dispatch(setScreen(Screen.Start));
    } else {
      dispatch(setScreen(Screen.DraftInput));
      dispatch(resetGeneratedDrafts());
    }
  };

  const onCloseTextShortcuts = () => {
    dispatch(setShowDialog(false));
  };

  useEffect(() => {
    if (currentUserDraft && draftId !== currentUserDraft?.draftId) {
      dispatch(setDraftId(currentUserDraft.draftId));
      dispatch(setCreditAlreadyUsedOnCurrentDraftId(true));
    }
  }, [dispatch, currentUserDraft, draftId]);

  const onCloseWatermarkDialog = () => {
    setShowWatermarkDialog(false);
  };

  const renderCopyDraftButton = () => {
    const buttonComponent = (
      <SecondaryButton
        onClick={copyToClipboard}
        width={isNative ? "60%" : "100%"}
        style={{
          minWidth: isMobile ? "100%" : "115px",
          marginRight: isMobile ? 0 : "10px",
        }}
        disabled={disableButtons || (userDetails?.subscription?.type === "FREE" && !isMobile)}
      >
        {copyButtonText}{" "}
        {userDetails?.subscription?.type === "FREE" ? (
          <StarIcon
            sx={{
              marginLeft: "5px",
              width: "12px",
              height: "12px",
            }}
          />
        ) : (
          <Documents />
        )}
      </SecondaryButton>
    );

    if (isNative || isMobile) {
      if (userDetails?.subscription?.type === "FREE" && !isMobile) {
        return (
          <OptionButtonTooltip
            placement="top-start"
            title={
              <Box display={"flex"} alignItems={"center"} justifyContent={"center"}>
                Available on Premium{" "}
                <StarIcon
                  sx={{
                    marginLeft: "5px",
                    width: "12px",
                    height: "12px",
                  }}
                />
              </Box>
            }
            enterDelay={500}
          >
            <Box>{buttonComponent}</Box>
          </OptionButtonTooltip>
        );
      } else {
        return buttonComponent;
      }
    }
    return null;
  };

  return (
    <>
      <TextShortcutsDialog open={textShortcutsDialogOpen} onClose={onCloseTextShortcuts} />
      <WatermarkDialog open={showWatermarkDialog} onClose={onCloseWatermarkDialog} />
      <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        <Header isNative={isNative} onGoBack={handleBackButtonClick} />
        {hasFreeSubscription && (
          <Box
            display={"flex"}
            padding={"5px 0 5px 0"}
            alignItems={"center"}
            justifyContent={"center"}
            borderRadius={"8px"}
            sx={{
              backgroundColor: "rgba(255, 179, 25, 0.12)",
            }}
            margin={"8px 15px"}
          >
            <WarningInfoIcon
              sx={{
                marginRight: "5px",
              }}
            />
            <Typography
              fontWeight={"400"}
              fontFamily={"DM Sans"}
              fontSize={"12px"}
              color={"#000000"}
              lineHeight={"20px"}
            >
              {remainingCredits} AI emails remaining (refill on {getDayOfWeek(userDetails?.subscription.refill_date)})
            </Typography>
          </Box>
        )}
        <Box
          paddingLeft={"15px"}
          paddingRight={"15px"}
          height={`calc(100% - ${hasFreeSubscription ? 140 : 95}px)`}
          display={"flex"}
          flexDirection={"column"}
        >
          <Box
            position={"absolute"}
            borderRadius={"10px 0 0 0"}
            width={"91%"}
            left={"15px"}
            sx={{ backgroundColor: "transparent" }}
            top={"43px"}
          >
            <Box
              position={"relative"}
              top={
                hasFreeSubscription
                  ? isNative
                    ? "35px"
                    : isMobile
                      ? "35px"
                      : "30px"
                  : isNative
                    ? "15px"
                    : isMobile
                      ? "15px"
                      : "10px"
              }
              display={"flex"}
              justifyContent={"flex-start"}
            >
              {Array.from(
                { length: isStaticTemplate ? numberOfGeneratedOptionsForStaticTemplates : availableDraftOptions },
                (_, i: number) => {
                  return (
                    <DraftOption
                      key={i}
                      draftOption={i}
                      selectOption={(i) => {
                        dispatch(setSelectedDraftAction(i));
                        dispatch(resetImprovedTextPart());
                      }}
                      isSelected={i === requestIdIndexOfCurrentSelectedGeneratedDraft}
                      label={isStaticTemplate ? `Draft` : `Option ${i + 1}`}
                      isLoading={!getGeneratedDraftByIndex(i)?.draft.finished as boolean}
                    />
                  );
                },
              )}
            </Box>
          </Box>
          <DraftTextArea
            draftId={draftId}
            drafts={displayedGeneratedDrafts.map((draft) => draft.draft)}
            selectedOption={requestIdIndexOfCurrentSelectedGeneratedDraft as number}
            selectedRequestId={selectedDraftRequestId}
          />
          {faqReferences.length > 0 && (
            <Box
              sx={{
                position: "relative",
                backgroundColor: "#FFFFFF",
                marginTop: "-1px",
                borderRadius: "0 0 10px 10px",
                borderRight: "1px solid rgb(232, 231, 255)",
                borderLeft: "1px solid rgb(232, 231, 255)",
                borderBottom: "1px solid rgb(232, 231, 255)",
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                fontFamily: "Inter",
                size: "12px",
                color: "#7468FF",
              }}
            >
              {faqReferences.map((item, i) => {
                const [userRequest, teamResponse] = item.document.split("Team Response:");

                return (
                  <CustomTooltip placement="top-start" title={userRequest} enterDelay={500}>
                    <Box sx={{ marginLeft: "10px" }}>
                      <a
                        style={{ color: "#7468FF", fontSize: "13px" }}
                        target="_blank"
                        href={`https://admin-dev.maestrolabs.com/email_generation/knowledgeembedding/` + item.id}
                      >
                        Ref {i + 1}
                      </a>
                    </Box>
                  </CustomTooltip>
                );
              })}
            </Box>
          )}
          <Box
            sx={{
              position: "relative",
              backgroundColor: "#FFFFFF",
              marginTop: "-1px",
              borderRadius: "0 0 10px 10px",
              borderRight: "1px solid rgb(232, 231, 255)",
              borderLeft: "1px solid rgb(232, 231, 255)",
              borderBottom: "1px solid rgb(232, 231, 255)",
              display: "flex",
              justifyContent:
                !selectedGeneratedDraft?.draft.finished || isMobile || !userPermissions?.can_partial_improve
                  ? "flex-end"
                  : "space-between",
              alignItems: "center",
            }}
          >
            {/* TODO: This can be used to deactivate the feature for some users */}
            {/*   Partial editing is disabled on mobile */}
            <CustomTooltip placement="top-start" title={"Text shortcuts"} enterDelay={500}>
              <Box
                onClick={onTextShortcutsClick}
                sx={{
                  padding: "4px 6px",
                  margin: "0 8px",
                  display: "flex",
                  alignItems: "center",
                  "&:hover": {
                    cursor: "pointer",
                    border: "1px solid #7468FF",
                    borderRadius: "6px",
                    backgroundColor: "rgba(116, 104, 255, 0.12)",
                  },
                }}
              >
                <TypingIcon
                  sx={{
                    height: "16px",
                    width: "16px",
                    color: "#7468FF",
                  }}
                />
              </Box>
            </CustomTooltip>

            {userDetails?.subscription?.type === "FREE" && !isMobile && (
              <OptionButtonTooltip
                placement="top-start"
                title={
                  <>
                    Go premium{" "}
                    <StarIcon
                      sx={{
                        marginLeft: "2px",
                        marginRight: "2px",
                        width: "10px",
                        height: "10px",
                      }}
                    />{" "}
                    to remove watermark
                  </>
                }
                enterDelay={500}
              >
                <Box
                  sx={{
                    "&:hover": {
                      cursor: "pointer",
                    },
                  }}
                  marginRight={"auto"}
                  display={"flex"}
                  alignItems={"center"}
                >
                  <Typography
                    fontWeight={"400"}
                    fontFamily={"DM Sans"}
                    fontSize={"14px"}
                    color={"#595D62"}
                    lineHeight={"20px"}
                    sx={{
                      opacity: 0.5,
                    }}
                  >
                    Sent via MailMaestro
                  </Typography>
                  <Box
                    onClick={() => {
                      setShowWatermarkDialog(true);
                    }}
                  >
                    <InfoIcon
                      sx={{
                        marginLeft: "5px",
                      }}
                    />
                  </Box>
                </Box>
              </OptionButtonTooltip>
            )}

            {!isMobile && userPermissions?.can_partial_improve && (
              <PartialTextEditingButton
                YPosition={partialTextEditingButtonYPosition}
                selectedDraft={selectedGeneratedDraft?.draft as Draft}
              />
            )}

            <Voting
              requestId={selectedGeneratedDraft?.draft.request_id || ""}
              showFeedbackMessage={false}
              sx={{
                margin: "10px",
              }}
            />
          </Box>
          {isMobile && showCopyConfirmation && (
            <Box
              position={"absolute"}
              bottom={90}
              width={"calc(100% - 30px)"}
              sx={{
                padding: "10px",
                borderRadius: "5px",
                background: "#F9F9F9",
                boxShadow: "0px 0px 30px 0px rgba(0, 0, 0, 0.15)",
                color: "#131313",
                fontFamily: "Inter",
                fontSize: "12px",
                fontStyle: "normal",
                fontWeight: 400,
                width: "85%",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              You can now close MailMaestro and paste the message to your Outlook message box
            </Box>
          )}
        </Box>
        <Box padding={"15px"}>
          <Box display={"flex"} justifyContent={"space-between"}>
            {renderCopyDraftButton()}
            {!isMobile && (
              <PrimaryButton
                onClick={pasteToOutlook}
                width={isNative ? "60%" : "100%"}
                style={{ maxWidth: isNative ? "calc(100% - 120px)" : "100%" }}
                disabled={disableButtons}
              >
                Paste to {PASTE_BUTTON_TEXT}
                <ArrowRight />
              </PrimaryButton>
            )}
          </Box>
        </Box>
      </div>
    </>
  );
};

export default DraftOutput;
