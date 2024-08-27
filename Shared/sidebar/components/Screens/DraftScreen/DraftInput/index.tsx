import { isMac } from "@fluentui/react";
import { Box, Typography } from "@mui/material";
import TextField from "@mui/material/TextField";
import { usePlatformDraft } from "@platformSpecific/sidebar/hooks/usePlatformDraft";
import { isNativeApp } from "@platformSpecific/sidebar/utils/officeMisc";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import React, { useEffect, useMemo } from "react";
import ReactGA from "react-ga4";
import { useHotkeys } from "react-hotkeys-hook";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight } from "../../../../../common/Icon/ArrowRight";
import { ClockIcon } from "../../../../../common/Icon/ClockIcon";
import { TypingIcon } from "../../../../../common/Icon/InitialScreen/TypingIcon";
import { WandIcon } from "../../../../../common/Icon/WandIcon";
import { WarningInfoIcon } from "../../../../../common/Icon/WarningInfoIcon";
import { updateEmailStatuses } from "../../../../apis/draft";
import { draftMessageAction, handleDraftFromOutlook } from "../../../../store/actions/draftActions";
import {
  DraftAction,
  Screen,
  selectDraftAction,
  selectErrorDescription,
  selectErrorTitle,
  selectIsReply,
  selectPreviousLocation,
  selectScreen,
  selectSubject,
  setDraftAction,
  setErrorDescription,
  setErrorTitle,
  setScreen,
} from "../../../../store/reducers/AppReducer";
import {
  selectRemainingCredits,
  selectUserDetails,
  selectUserPermissions,
} from "../../../../store/reducers/AuthReducer";
import {
  resetUserDraft,
  selectCurrentUserDraft,
  setDraftId,
  updateUserDraftRecipientsName,
} from "../../../../store/reducers/DraftReducer";
import {
  selectHasResponsesValidationErrors,
  selectSelectedTemplate,
  setTemplateId,
} from "../../../../store/reducers/MagicTemplateReducer";
import { selectShowDialog, setShowDialog } from "../../../../store/reducers/TextShortcutsReducer";
import {
  selectPromptDialogOpen,
  setDialogState as setPromptHistoryDialogState,
} from "../../../../store/reducers/promptHistoryReducer";
import { RootState } from "../../../../store/store";
import { isValidInput } from "../../../../utils/content";
import { getDayOfWeek } from "../../../../utils/datetime";
import { GA4_EVENTS } from "../../../../utils/events";
import { DraftTextArea } from "../../../Common/DraftInput/components/DraftTextArea";
import Header from "../../../Common/Header";
import MagicTemplateForm from "../../../Common/MagicTemplates/components/MagicTemplateForm";
import { PromptHistoryDialog } from "../../../Common/PromptHistory";
import { CustomTooltip } from "../../../Common/Tooltip";
import PrimaryButton from "../../../Common/UI/PrimaryButton";
import { EmailStyleSelector } from "../../../Common/UserInput/components/EmailStyleSelector";
import { LanguageSelector } from "../../../Common/UserInput/components/LanguageSelector/Draft";
import { LengthSelector } from "../../../Common/UserInput/components/LengthSelector";
import ErrorDialog from "../../StartScreen/ErrorDialog";
import { TextShortcutsDialog } from "../../TextShortcuts/TextShortcutsDialog";
import { APPROUTES } from "../../../../routing/routes";

export const getPlaceholderAndButtonMessage = (draftAction: DraftAction | null, userName: string | "") => {
  const placeholderAndButtonMessages = {
    [DraftAction.IMPROVE]: {
      buttonMessage: "Improve",
      placeholder:
        "Hi Kate,\n" +
        "Great talking to you last week. I would love to organize another meeting in 2 weeks or so.\n" +
        "Please let me know.\n" +
        "Best,\n" +
        userName,
    },
    [DraftAction.REPLY]: {
      buttonMessage: "Write",
      placeholder:
        "Instruct the AI to write your email.\n\n" +
        "A few examples:\n" +
        '- "Write that I need 2 more days. Be kind."\n' +
        '- "Say yes. Make it funny."\n' +
        '- "Ask for more info."\n',
    },
    [DraftAction.FORWARD]: {
      buttonMessage: "Write",
      placeholder:
        "Instruct the AI to write your email.\n\n" +
        "A few examples:\n" +
        '- "Write that I need 2 more days. Be kind."\n' +
        '- "Summarize this email for my boss. Be proactive."\n' +
        '- "Ask for opinions. Make it funny."\n',
    },
    [DraftAction.COMPOSE]: {
      buttonMessage: "Write",
      placeholder:
        "Instruct the AI to write your email.\n\n" +
        "A few examples:\n" +
        '- "Tell Joe that I am out next Tuesday. He is a prospect."\n' +
        '- "Ask Vera for her opinion about our website."\n' +
        '- "Offer Ann a 15% volume discount."\n',
    },
    [DraftAction.TIMESLOTS_ACCEPT]: {
      buttonMessage: "Write",
      placeholder:
        "Hi Kate,\n" +
        "Great talking to you last week. I would love to organize another meeting in 2 weeks or so.\n" +
        "Please let me know.\n" +
        "Best,\n" +
        userName,
    },
    [DraftAction.RAPID_REPLY]: {
      buttonMessage: "Write",
      placeholder:
        "Hi Kate,\n" +
        "Great talking to you last week. I would love to organize another meeting in 2 weeks or so.\n" +
        "Please let me know.\n" +
        "Best,\n" +
        userName,
    },
  };

  const placeholderAndButtonMessage = {
    buttonMessage: "",
    placeholder: "",
  };

  if (draftAction) {
    placeholderAndButtonMessage.buttonMessage = placeholderAndButtonMessages[draftAction]?.buttonMessage ?? "";
    placeholderAndButtonMessage.placeholder = placeholderAndButtonMessages[draftAction]?.placeholder ?? "";
  }

  return placeholderAndButtonMessage;
};

const DraftInput = () => {
  const isNative = isNativeApp();

  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const userDetails = useSelector(selectUserDetails);

  const screen = useSelector(selectScreen);
  const currentUserDraft = useSelector(selectCurrentUserDraft);
  const userPermissions = useSelector(selectUserPermissions);
  const subject = useSelector(selectSubject);
  const isReply = useSelector(selectIsReply);

  const errorTitle = useSelector(selectErrorTitle);
  const errorDescription = useSelector(selectErrorDescription);

  const draftId = useSelector((state: RootState) => state.draft.draftId);
  const gaId = useSelector((state: RootState) => state.auth?.userDetails?.ganalytics_id);

  const authToken = useSelector((state: RootState) => state.auth.token);
  const promptDialogOpen = useSelector(selectPromptDialogOpen);
  const textShortcutsDialogOpen = useSelector(selectShowDialog);
  const draftAction = useSelector(selectDraftAction);
  const selectedTemplate = useSelector(selectSelectedTemplate);
  const hasMagicTemplateValidationErrors = useSelector(selectHasResponsesValidationErrors);
  const recipientsName = currentUserDraft?.recipientsName ?? "";
  const remainingCredits = useSelector(selectRemainingCredits);
  const previousLocation = useSelector(selectPreviousLocation);

  const isStaticTemplate = selectedTemplate?.static ?? false;

  const draftButtonDisabled = useMemo(() => {
    if (selectedTemplate) {
      return hasMagicTemplateValidationErrors;
    }
    return !isValidInput(currentUserDraft?.userDraft) || !draftId;
  }, [currentUserDraft?.userDraft, hasMagicTemplateValidationErrors, draftId, selectedTemplate]);

  const { userInput, prevThread, signature } = usePlatformDraft();

  const { buttonMessage } = getPlaceholderAndButtonMessage(draftAction, userDetails?.first_name);

  useEffect(() => {
    // We only allow the user to access to this screen without credits if they are currently on a drafting process
    // Example: If the user is using last credit but did not finish the draft yet and came back from draft output screen.
    if (previousLocation?.pathname === APPROUTES.DRAFT) {
      return;
    }

    if (userDetails?.subscription.type === "FREE" && remainingCredits === 0) {
      dispatch(setScreen(Screen.SubscriptionExpired));
    }
  }, [dispatch, remainingCredits, userDetails?.subscription.type]);

  useEffect(() => {
    dispatch(handleDraftFromOutlook(userInput, prevThread, signature));
  }, [dispatch, userInput, prevThread, signature, currentUserDraft, draftAction]);

  useEffect(() => {
    if (!draftAction) {
      dispatch(setDraftAction(currentUserDraft?.draftAction ?? null));
    }
  }, [dispatch, currentUserDraft]);

  useEffect(() => {
    if (currentUserDraft && draftId !== currentUserDraft?.draftId) {
      dispatch(setDraftId(currentUserDraft.draftId));
    }
  }, [dispatch, currentUserDraft]);

  const getTitle = () => {
    let title = "";
    let subTitle = "";

    if (isReply) {
      switch (draftAction) {
        case DraftAction.FORWARD:
          title = "Forward to: ";
          subTitle = subject;
          break;
        case DraftAction.IMPROVE:
          title = "Improve draft";
          break;
        case DraftAction.REPLY:
          title = "Reply to: ";
          subTitle = subject;
          break;
        default:
          title = "Reply to: ";
      }
      subTitle = subject;
    } else {
      title = selectedTemplate
        ? "Your instructions"
        : draftAction === DraftAction.IMPROVE
          ? "Improve draft"
          : "New email";
    }

    return (
      <>
        <Typography
          fontWeight={"700"}
          fontFamily={"Inter"}
          fontSize={"11px"}
          marginLeft={"5px"}
          color={"#7468FF"}
          sx={{ textWrap: "nowrap" }}
        >
          {title}
        </Typography>
        <Typography
          fontWeight={"400"}
          fontFamily={"Inter"}
          fontSize={"11px"}
          marginLeft={"5px"}
          color={"#595D62"}
          sx={{
            textWrap: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {subTitle}
        </Typography>
      </>
    );
  };

  const onBackButtonClick = () => {
    updateEmailStatuses(
      {
        draft_id: draftId ?? "",
        draft_status: "aborted",
      },
      authToken,
    );
    dispatch(resetUserDraft());
    dispatch(setTemplateId(""));
    const newScreen = selectedTemplate ? Screen.MagicTemplates : Screen.Start;
    dispatch(setScreen(newScreen));
    dispatch(setDraftAction(null));
  };

  const onTextShortcutsClick = () => {
    dispatch(setShowDialog(true));
  };

  const draftEmail = async () => {
    await dispatch(draftMessageAction());
  };

  const mac = isMac();

  useHotkeys(
    "meta+return",
    () => {
      ReactGA.event(GA4_EVENTS.HOTKEY_DRAFT_MESSAGE, {
        draftID: draftId,
        userID: gaId,
      });
      draftEmail();
    },
    {
      enabled: screen === Screen.DraftInput && mac,
      preventDefault: true,
      enableOnFormTags: ["input", "textarea", "select"],
    },
  );
  useHotkeys(
    "ctrl+return",
    () => {
      ReactGA.event(GA4_EVENTS.HOTKEY_DRAFT_MESSAGE, {
        draftID: draftId,
        userID: gaId,
      });
      draftEmail();
    },
    {
      enabled: screen === Screen.DraftInput && !mac,
      preventDefault: true,
      enableOnFormTags: ["input", "textarea", "select"],
    },
  );

  const onClosePromptHistory = () => {
    dispatch(setPromptHistoryDialogState(false));
    ReactGA.event(GA4_EVENTS.PROMPT_HISTORY_CLICKED, {
      draftID: draftId,
      userID: gaId,
    });
  };

  const onCloseTextShortcuts = () => {
    dispatch(setShowDialog(false));
  };

  const handleRecipientNamesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateUserDraftRecipientsName(event.target.value));
  };

  const handleCloseErrorDialog = () => {
    dispatch(setErrorTitle(null));
    dispatch(setErrorDescription(null));
  };

  return (
    <>
      <ErrorDialog
        open={errorTitle !== null && errorDescription !== null}
        onClose={handleCloseErrorDialog}
        title={errorTitle as string}
        description={errorDescription as string}
      />
      <PromptHistoryDialog open={promptDialogOpen} onClose={() => onClosePromptHistory()} />
      <TextShortcutsDialog open={textShortcutsDialogOpen} onClose={onCloseTextShortcuts} />
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            position: "relative",
            height: "calc(100% - 107px)",
            display: "flex",
            flexDirection: "column",
            overflowY: "hidden",
            "&::-webkit-scrollbar": {
              borderRadius: "4px",
              width: "5px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#7468ff",
              borderRadius: "4px",
            },
          }}
        >
          <Header isNative={isNative} onGoBack={onBackButtonClick} />

          <Box padding={"10px 15px"} display={"flex"} flexDirection={"column"} height={"calc(100% - 50px)"}>
            {userDetails?.subscription.type === "FREE" && (
              <Box
                display={"flex"}
                padding={"5px 0 5px 0"}
                alignItems={"center"}
                justifyContent={"center"}
                borderRadius={"8px"}
                sx={{
                  backgroundColor: "rgba(255, 179, 25, 0.12)",
                }}
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
                  {remainingCredits} AI emails remaining (refill on{" "}
                  {getDayOfWeek(userDetails?.subscription.refill_date)})
                </Typography>
              </Box>
            )}
            <Box display={"flex"} padding={"5px 0 5px 0"} alignItems={"center"} justifyContent={"space-between"}>
              <Box display={"flex"} alignItems={"center"} width={"calc(100% - 35px)"}>
                {draftAction && draftAction !== DraftAction.REPLY && draftAction !== DraftAction.FORWARD && (
                  <WandIcon
                    sx={{
                      color: "#7468FF",
                      height: "18px",
                      width: "18px",
                    }}
                  />
                )}

                {getTitle()}
              </Box>
              {userPermissions?.can_use_prompt_history && !selectedTemplate && (
                <Box
                  onClick={() => dispatch(setPromptHistoryDialogState(true))}
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"center"}
                  height={"20px"}
                  width={"20px"}
                  border={"1px solid #7468FF"}
                  borderRadius={"4px"}
                  sx={{
                    backgroundColor: "#ECEBFF",
                    "&:hover": {
                      cursor: "pointer",
                    },
                  }}
                >
                  <ClockIcon height="13px" width="13px" sx={{ color: "#7468FF" }} />
                </Box>
              )}
            </Box>
            {!selectedTemplate && (
              <Box display={"flex"} padding={"0 0 10px 0"}>
                <TextField
                  value={recipientsName}
                  onChange={handleRecipientNamesChange}
                  placeholder="Optional: recipient’s name"
                  fullWidth
                  variant="outlined"
                  sx={{
                    border: "none",
                    position: "relative",
                    fontSize: "12px",
                    "& .MuiInputBase-root": { border: "none" },
                    "& input": {
                      padding: "5px 15px",
                      fontSize: "13px",
                      border: "1px solid #E8E7FF",
                      borderRadius: "6px",
                      backgroundColor: "#FFFFFF",
                      fontFamily: "Inter",
                      fontWeight: "400",
                      color: "#131313",
                      "&::placeholder": {
                        color: "#999999",
                        opacity: 1,
                      },
                    },
                    "& fieldset": { border: "none" },
                  }}
                />
              </Box>
            )}
            {selectedTemplate ? <MagicTemplateForm magicTemplate={selectedTemplate} /> : <DraftTextArea />}
          </Box>
          {!selectedTemplate && (
            <CustomTooltip placement="top-start" title={"Text shortcuts"} enterDelay={500}>
              <Box
                onClick={onTextShortcutsClick}
                sx={{
                  position: "absolute",
                  bottom: "20px",
                  left: "30px",
                  padding: "4px 6px",
                  display: "flex",
                  alignItems: "center",
                  margin: "1px",
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
          )}
        </Box>

        {/* overflow-unset added to fix weird issue of padding not visible locally
          See slack: https://mailmaestro.slack.com/archives/C04QEBBHPLY/p1698163639880829?thread_ts=1698152372.449999&cid=C04QEBBHPLY
         */}
        <Box sx={{ overflow: "unset" }}>
          <Box
            sx={{
              background: "#FFFFFF",
              boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
              borderRadius: "10px",
              padding: "5px 15px 15px 15px",
            }}
          >
            {isStaticTemplate ? null : (
              <Box display={"flex"} flexDirection={"row"} justifyContent={"space-between"} padding={"5px 0 5px 0"}>
                <LanguageSelector />
                <EmailStyleSelector />
                <LengthSelector />
              </Box>
            )}
            <Box {...(isStaticTemplate && { sx: { paddingTop: "10px" } })}>
              <PrimaryButton width="100%" disabled={draftButtonDisabled} onClick={draftEmail}>
                {buttonMessage} <ArrowRight />
              </PrimaryButton>
            </Box>
          </Box>
        </Box>
      </div>
    </>
  );
};

export default DraftInput;
