import { Box, Typography } from "@mui/material";
import { usePlatformDraft } from "@platformSpecific/sidebar/hooks/usePlatformDraft";
import { openNewEmail } from "@platformSpecific/sidebar/utils/office";
import { isNativeApp } from "@platformSpecific/sidebar/utils/officeMisc";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BookIcon } from "../../../../../common/Icon/BookIcon";
import { DocumentIcon } from "../../../../../common/Icon/DocumentIcon";
import { DialogIcon } from "../../../../../common/Icon/InitialScreen/DialogIcon";
import { ForwardIcon } from "../../../../../common/Icon/InitialScreen/ForwardIcon";
import { MagicWandIcon } from "../../../../../common/Icon/InitialScreen/MagicWandIcon";
import { ReplyIcon } from "../../../../../common/Icon/InitialScreen/ReplyIcon";
import { StarsIcon } from "../../../../../common/Icon/InitialScreen/StarsIcon";
import { createDraftAction } from "../../../../store/actions/draftActions";
import { createFaqReplyDraft } from "../../../../store/actions/faqReplyActions";
import { fetchMagicTemplates as fetchUserMagicTemplates } from "../../../../store/actions/magicTemplateActions";
import { fetchUserTextShortcuts } from "../../../../store/actions/textShortcutsActions";
import {
  DraftAction,
  Screen,
  selectDraftAction,
  selectErrorDescription,
  selectErrorTitle,
  selectIsReply,
  selectMode,
  setDraftAction,
  setErrorDescription,
  setErrorTitle,
  setScreen,
} from "../../../../store/reducers/AppReducer";
import { selectOneSentenceSummary } from "../../../../store/reducers/SummaryReducer";
import { RootState } from "../../../../store/store";
import { MODES } from "../../../../utils/constants";
import Header from "../../../Common/Header";
import PrimaryButton from "../../../Common/UI/PrimaryButton";
import { PermissionedAttachmentsBox } from "../AttachmentsBox";
import ErrorDialog from "../ErrorDialog";
import { PermissionedRapidReplyBox } from "../RapidReplyBox";
import { PermissionedSummaryBox } from "../SummaryBox";
import { PermissionedTimeslotsBox } from "../TimeslotsBox";
import { TourDialog } from "../TourDialog";
import { SquareOption } from "./SquareOption";
import { InitialOption } from "./types";
import {
  getGrahpAPITokenSilently,
  getGraphAPITokenByPopup,
  logoutFromGraphAPI,
} from "@platformSpecific/sidebar/utils/graphAPI";
import { selectRemainingCredits, selectUserDetails } from "../../../../store/reducers/AuthReducer";
import { StarIcon } from "../../../../../common/Icon/SubscriptionExpired/StarIcon";
import { daysUntil } from "../../../../utils/datetime";

type Props = {
  isFirstRun: boolean;
  showTourDialog: boolean;
  onSkip: () => void;
};

const InitialScreen: React.FC<Props> = ({ isFirstRun, showTourDialog, onSkip }) => {
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const isReply = useSelector(selectIsReply);
  const mode = useSelector(selectMode);
  const oneSentenceSummary = useSelector(selectOneSentenceSummary);
  const isNative = isNativeApp();
  const draftAction = useSelector(selectDraftAction);
  const userDetails = useSelector(selectUserDetails);
  const errorTitle = useSelector(selectErrorTitle);
  const errorDescription = useSelector(selectErrorDescription);
  const environment = process.env.ENVIRONMENT as string;
  const platformType = process.env.PLATFORM_TYPE as string;
  const remainingCredits = useSelector(selectRemainingCredits);
  const notAccessibleOnFreePlan = remainingCredits <= 0 && userDetails?.subscription.type === "FREE";

  const [optionIdHovered, setOptionIdHovered] = React.useState<string>("");
  const [graphAPIToken, setGraphAPIToken] = React.useState<string | null>(null);

  const onOptionHover = (optionId: string) => {
    setOptionIdHovered(optionId);
  };

  const onOptionLeave = () => {
    setOptionIdHovered("");
  };

  const { prevThread, signature, userInput } = usePlatformDraft();

  const OnImproveClick = () => {
    const userDraftData = {
      previousThread: prevThread,
      signature,
    };
    dispatch(setDraftAction(DraftAction.IMPROVE));
    dispatch(createDraftAction(DraftAction.IMPROVE, userDraftData));
    mode === MODES.LIST_VIEW && openNewEmail();
  };

  const onReply = () => {
    dispatch(setDraftAction(DraftAction.REPLY));
    dispatch(createDraftAction(DraftAction.REPLY));
  };

  const OnComposeReplyClick = () => {
    const draftAction = isReply ? DraftAction.REPLY : DraftAction.COMPOSE;
    dispatch(setDraftAction(draftAction));
    dispatch(createDraftAction(draftAction));
    mode === MODES.LIST_VIEW && openNewEmail();
  };

  const onForward = () => {
    dispatch(setDraftAction(DraftAction.FORWARD));
    dispatch(createDraftAction(DraftAction.FORWARD));
  };

  const onFAQReply = () => {
    dispatch(createFaqReplyDraft());
  };

  const handleOpenTextShortcuts = () => {
    dispatch(setScreen(Screen.TextShortcuts));
  };

  const handleOpenMagicTemplates = () => {
    dispatch(setScreen(Screen.MagicTemplates));
  };

  const onConnectToGraphAPI = async () => {
    const graphAPIToken = await getGraphAPITokenByPopup();
    setGraphAPIToken(graphAPIToken);
  };

  const onDisconnectFromGraphAPI = async () => {
    await logoutFromGraphAPI();
    setGraphAPIToken(null);
  };

  const onGoPremiumClick = () => {
    dispatch(setScreen(Screen.SubscriptionExpired));
  };

  const commonEmailActionOptions: InitialOption[] = [
    {
      id: "compose",
      title: "Compose",
      iconComponent: DialogIcon,
      action: OnComposeReplyClick,
    },
    {
      id: "improve",
      title: "Improve",
      iconComponent: StarsIcon,
      action: OnImproveClick,
    },
    {
      id: "magicTemplates",
      title: "Templates",
      iconComponent: MagicWandIcon,
      action: handleOpenMagicTemplates,
    },
    /* {
      id: "shortcuts",
      title: "Text shortcuts",
      iconComponent: TypingIcon,
      action: handleOpenTextShortcuts,
    }, */
  ];

  const replyEmailActionOptions = [
    {
      id: "reply",
      title: "Reply",
      iconComponent: ReplyIcon,
      action: onReply,
    },
    {
      id: "forward",
      title: "Forward",
      iconComponent: ForwardIcon,
      action: onForward,
    },
    /* {
      id: "faqReply",
      title: "FAQ Reply",
      iconComponent: null,
      action: onFAQReply,
    }, */
  ];

  useEffect(() => {
    const fetchMagicTemplates = async () => {
      if (!draftAction) {
        try {
          await dispatch(fetchUserMagicTemplates()).unwrap();
        } catch (error) {
          console.error("Error fetching magic templates.", error);
        }
      }
    };
    fetchMagicTemplates();
  }, [dispatch, userDetails, draftAction]);

  // Load text shortcuts for user on first run
  useEffect(() => {
    const fetchTextShortcuts = async () => {
      try {
        await dispatch(fetchUserTextShortcuts()).unwrap();
      } catch (error) {
        console.error("Error fetching text shortcuts.", error);
      }
    };
    fetchTextShortcuts();
  }, [dispatch]);

  /* const mainOptionId = isReply ? "reply" : "compose";
  const arrayOfEmailActionOptions = isReply
    ? replyEmailActionOptions.concat(commonEmailActionOptions.filter((option) => option.id !== "compose"))
    : commonEmailActionOptions;
  const mainEmailActionOption = arrayOfEmailActionOptions.find((option) => option.id === mainOptionId);
  const otherEmailActionOptions = arrayOfEmailActionOptions
    .filter((option) => option.id !== mainOptionId)
    .filter((option) => {
      if (option.id === "shortcuts") {
        return userDetails.permissions.can_use_text_shortcuts;
      }
      return true;
    })
    .filter((option) => {
      if (option.id === "magicTemplates") {
        return (
          userDetails.permissions.can_use_private_magic_templates ||
          userDetails.permissions.can_use_public_magic_templates
        );
      }
      return true;
    })
    .filter((option) => {
      if (option.id === "faqReply") {
        return userDetails.permissions.can_reply_faq_emails;
      }
      return true;
    }); */

  const arrayOfEmailActionOptions = isReply
    ? replyEmailActionOptions.concat(commonEmailActionOptions.filter((option) => option.id !== "compose"))
    : commonEmailActionOptions;

  const handleCloseErrorDialog = () => {
    dispatch(setErrorTitle(null));
    dispatch(setErrorDescription(null));
  };

  useEffect(() => {
    async function checkForGraphAPIToken() {
      const graphAPIToken = await getGrahpAPITokenSilently();
      setGraphAPIToken(graphAPIToken);
    }
    checkForGraphAPIToken();
  }, []);

  const renderGraphAPIButton = () => {
    // Only show in local and development environments
    if (!["LOCAL", "DEVELOPMENT"].includes(environment)) {
      return null;
    }
    // Don't show in chrome extension
    if (platformType !== "outlook_addin") {
      return null;
    }
    return (
      <Box display={"flex"} justifyContent={"center"} alignItems={"center"} flexDirection={"column"}>
        <PrimaryButton
          onClick={graphAPIToken ? onDisconnectFromGraphAPI : onConnectToGraphAPI}
          sx={{
            padding: "5px",
          }}
        >
          {graphAPIToken ? "Disconnect from GraphAPI" : "Connect to GraphAPI"}
        </PrimaryButton>
      </Box>
    );
  };

  const renderFAQReplyButton = () => {
    if (!["LOCAL", "DEVELOPMENT"].includes(environment) || !userDetails?.permissions?.can_reply_faq_emails) {
      return null;
    }
    return (
      <Box display={"flex"} justifyContent={"center"} alignItems={"center"} flexDirection={"column"} marginTop={"5px"}>
        <PrimaryButton
          onClick={onFAQReply}
          sx={{
            padding: "5px",
          }}
        >
          FAQ reply
        </PrimaryButton>
      </Box>
    );
  };

  return (
    <>
      <TourDialog open={showTourDialog} onSkip={onSkip} />
      <ErrorDialog
        open={errorTitle !== null && errorDescription !== null}
        onClose={handleCloseErrorDialog}
        title={errorTitle as string}
        description={errorDescription as string}
      />
      {/* Disable new features dialog and pin dialog for the moment */}
      {/* {!showTourDialog && <PinDialog />} */}
      {/* {!showTourDialog && <NewFeatureDialog />} */}
      <Header isNative={isNative} startScreen={true} isFirstRun={isFirstRun} />
      {(!isReply || isFirstRun || mode === MODES.LIST_VIEW) && (
        <Box sx={{ textAlign: "center" }}>
          <img style={{ marginTop: "75px" }} src={"../../assets/writing_guy.svg"} alt="Hero" />
          <p
            style={{
              fontFamily: "Inter",
              fontStyle: "normal",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "17px",
              color: "#131313",
              paddingLeft: 36,
              paddingRight: 36,
              marginBottom: "45px",
            }}
          >
            <strong>Get started!</strong>
          </p>
          {mode === MODES.LIST_VIEW && (
            <>
              <Box>
                <Typography
                  sx={{
                    textAlign: "center",
                    fontFamily: "Inter",
                    fontSize: "14px",
                    fontStyle: "normal",
                    fontWeight: 500,
                    lineHeight: "normal",
                    padding: "0 25px",
                    color: "#595D62",
                  }}
                >
                  Select any email to get started
                </Typography>
                <img
                  style={{
                    position: "absolute",
                    left: "3px",
                    top: "338px",
                    width: "55px",
                  }}
                  src={"../../assets/arrow-left.svg"}
                  alt="Hero"
                />
              </Box>
            </>
          )}
        </Box>
      )}
      {mode !== MODES.LIST_VIEW && (
        <>
          <Box
            height={"100%"}
            sx={{
              overflowY: "auto",
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
            {notAccessibleOnFreePlan && (
              <>
                <Box padding={"0 10px"} marginBottom={0} display={"flex"} justifyContent={"center"}>
                  <Typography
                    fontFamily={"DM Sans"}
                    fontSize={"12px"}
                    fontWeight={"400"}
                    marginBottom={"8px"}
                    sx={{
                      color: "#595D62",
                    }}
                  >
                    Your free credits refill in {daysUntil(userDetails.subscription.refill_date)} days
                  </Typography>
                </Box>
                <Box padding={"0 10px"} marginBottom={0} display={"flex"} justifyContent={"center"}>
                  <PrimaryButton onClick={onGoPremiumClick} sx={{ width: "100%" }}>
                    Go premium for unlimited AI emails <StarIcon sx={{ marginLeft: "5px" }} />
                  </PrimaryButton>
                </Box>
              </>
            )}
            {isReply && (
              <>
                <PermissionedSummaryBox
                  summary={oneSentenceSummary?.summary || ""}
                  requestId={oneSentenceSummary?.request_id || ""}
                  icon={
                    <BookIcon
                      sx={{
                        position: "absolute",
                        top: "8px",
                        left: "10px",
                      }}
                    />
                  }
                />
                <PermissionedAttachmentsBox
                  icon={
                    <DocumentIcon
                      sx={{
                        position: "absolute",
                        top: "8px",
                        left: "10px",
                      }}
                    />
                  }
                />
                <PermissionedTimeslotsBox />
                <PermissionedRapidReplyBox />
              </>
            )}
            {renderGraphAPIButton()}
            {renderFAQReplyButton()}
          </Box>
        </>
      )}
      <Box
        sx={{
          backgroundColor: "#F6F5FF",
        }}
        padding={"10px"}
        display={"flex"}
        justifyContent={"space-between"}
        flexDirection={"row"}
        marginTop={"auto"}
      >
        {arrayOfEmailActionOptions.map((option) => {
          const disabled =
            option.id === "magicTemplates" &&
            !userDetails?.permissions.can_use_private_magic_templates &&
            !userDetails?.permissions.can_use_public_magic_templates;
          return (
            <SquareOption
              key={option.id}
              option={option}
              onOptionHover={onOptionHover}
              onOptionLeave={onOptionLeave}
              optionIdHovered={optionIdHovered}
              disabled={disabled}
              notAvailable={notAccessibleOnFreePlan}
            />
          );
        })}
      </Box>
    </>
  );
};

export default InitialScreen;
