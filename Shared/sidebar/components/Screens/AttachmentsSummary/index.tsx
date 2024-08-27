import { Box, CircularProgress, Typography } from "@mui/material";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import showdown from "showdown";
import { selectPreviousScreen, setScreen } from "../../../store/reducers/AppReducer";
import { selectUserDetails } from "../../../store/reducers/AuthReducer";
import { RootState } from "../../../store/store";
import { Voting } from "../../Common/DraftOutput/components/Voting";
import { SummaryText, SummaryWrapper } from "./styles";
import Header from "../../Common/Header";
import { DocumentIcon } from "../../../../common/Icon/DocumentIcon";
import {
  addAttachmentSummary,
  addFrameToAttachmentSummary,
  INITIAL_ATTACHMENT_SUMMARY,
  setAttachmentSummaryRequestId,
} from "../../../store/reducers/AttachmentsReducer";
import { fetchAttachmentSummary as fetchAttachmentSummaryAction } from "../../../store/actions/attachmentActions";
import usePusher, { EventResponse } from "../../../hooks/usePusher";
import { EventName } from "../../../utils/constants";
import LoadingScreen from "../LoadingScreen";
import { uuid4 } from "../../../utils/uuid";
import { updateEmailStatuses } from "../../../apis/draft";
import { isNativeApp } from "@platformSpecific/sidebar/utils/officeMisc";

const formatSummary = (summary: string): string => {
  //We get "Summary:" as the initial text (in the proper language), so we replace it with "Summary:\n\n" to add a new line
  const firstColonIndex = summary.indexOf(":");
  let modifiedSummary = summary;
  if (firstColonIndex !== -1) {
    modifiedSummary = summary.slice(0, firstColonIndex + 1) + "\n\n" + summary.slice(firstColonIndex + 1);
  }
  const converter = new showdown.Converter();
  let html = converter.makeHtml(modifiedSummary);
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  const elements = tempDiv.querySelectorAll("p, ul, ol, li");

  elements.forEach((element: any, index: number) => {
    //Only the first paragraph and the paragraphs that come before a list are styled (titles)
    if (index === 0 || (index > 0 && element.tagName === "P" && ["UL", "OL"].includes(elements[index + 1]?.tagName))) {
      element.style.color = "#7468FF";
      element.style.fontWeight = "700";
    }
  });

  return tempDiv.innerHTML;
};

const AttachmentsSummary = () => {
  const isNative = isNativeApp();
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const [hasError, setHasError] = React.useState(false);
  const authToken = useSelector((state: RootState) => state.auth.token);
  const userDetails = useSelector(selectUserDetails);
  const previousScreen = useSelector(selectPreviousScreen);
  const isLoadingAttachmentSummary = useSelector((state: RootState) => state.attachments.isLoading);

  const textAreaHeight = isNative ? "calc(100vh - 95px)" : "calc(100vh - 90px)";
  const textSummaryHeight = isNative ? "calc(100vh - 185px)" : "calc(100vh - 180px)";

  const attachments = useSelector((state: RootState) => state.attachments.attachments);
  const selectedAttachmentId = useSelector((state: RootState) => state.attachments.selectedAttachmentId);
  const selectedAttachment = attachments.find((attachment) => attachment.id === selectedAttachmentId);
  const summaries = useSelector((state: RootState) => state.attachments.summaries);
  const summary = summaries.find((summary) => summary.attachmentId === selectedAttachmentId);
  const html = formatSummary(summary?.summary || "");

  const messageBoxRef = useRef<HTMLDivElement>(null);

  usePusher(
    {
      channelName: userDetails?.settings?.pusher_channel as string,
      eventName: EventName.SUMMARIZE_ATTACHMENT,
    },
    (data: EventResponse) => {
      dispatch(addFrameToAttachmentSummary({ data }));
    },
  );

  useEffect(() => {
    const fetchAttachmentSummary = async () => {
      try {
        if (summary?.summary === undefined) {
          const requestId = uuid4();
          await dispatch(setAttachmentSummaryRequestId(requestId));
          await dispatch(
            addAttachmentSummary({
              ...INITIAL_ATTACHMENT_SUMMARY,
              request_id: requestId,
              attachmentId: selectedAttachmentId,
            }),
          );
          await dispatch(fetchAttachmentSummaryAction(requestId)).unwrap();
        }
      } catch (error) {
        // TODO: handle error
        setHasError(true);
        console.error("Error fetching attachment summry.", error);
      }
    };
    fetchAttachmentSummary();
  }, [dispatch, selectedAttachmentId]);

  const onGoBack = () => {
    if (previousScreen) {
      dispatch(setScreen(previousScreen));
    }
  };

  const handleCopy = async () => {
    await updateEmailStatuses(
      {
        request_id: summary?.request_id as string,
        request_status: "accepted",
      },
      authToken,
    );
  };

  const scrollToBottom = () => {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [html]);

  if (isLoadingAttachmentSummary) return <LoadingScreen showMessage={false} />;

  return (
    <>
      <Box
        sx={{
          background: "linear-gradient(180deg, #FFF 0%, #ECEBFF 100%)",
        }}
        height={"100vh"}
      >
        <Header isNative={isNative} onGoBack={onGoBack} />
        <Box display={"flex"} padding={"10px 10px 10px 10px"} alignItems={"center"}>
          <DocumentIcon sx={{ position: "sticky" }} />
          <Typography
            marginLeft={"10px"}
            align="left"
            sx={{ width: "100%" }}
            fontSize={"14px"}
            fontFamily={"Inter"}
            color={"#131313"}
            fontWeight={"400"}
            textOverflow={"ellipsis"}
            overflow={"hidden"}
            whiteSpace={"nowrap"}
          >
            {selectedAttachment?.name}
          </Typography>
        </Box>
        <SummaryWrapper sx={{ backgroundColor: "#ffffff", paddingRight: 0 }} height={textAreaHeight}>
          {hasError && (
            <Box
              sx={{
                width: "calc(100% - 20px)",
                color: "#131313",
                fontFamily: "Inter",
                fontSize: "14px",
                borderRadius: "6px",
                background: "#FFEFF2",
                padding: "10px",
                marginTop: "10px",
              }}
            >
              The attachment could not be summarized.
            </Box>
          )}
          <SummaryText
            sx={{
              fontFamily: "Inter",
              fontStyle: "normal",
              fontWeight: 400,
              fontSize: "14px",
              wordWrap: "break-word",
              maxHeight: textSummaryHeight,
              paddingRight: "10px",
            }}
            dangerouslySetInnerHTML={{
              __html: html,
            }}
            ref={messageBoxRef}
            onCopy={handleCopy}
          ></SummaryText>
          <Box display={"flex"} padding={"5px 10px 10px 10px"} flexDirection={"row"}>
            <Box
              sx={{
                position: "absolute",
                left: "20px",
                bottom: "60px",
                width: "calc(100% - 50px)",
                color: "#6E6E6E",
                fontFamily: "Inter",
                fontSize: "12px",
                fontStyle: "italic",
                borderRadius: "6px",
                background: "#F6F8FC",
                padding: "5px",
              }}
            >
              Only text is summarized. Images, charts, and tables are not currently supported.
            </Box>
            <Voting
              requestId={summary?.request_id as string}
              sx={{ position: "absolute", right: "25px", bottom: "20px" }}
            />
          </Box>
        </SummaryWrapper>
      </Box>
    </>
  );
};

export default AttachmentsSummary;
