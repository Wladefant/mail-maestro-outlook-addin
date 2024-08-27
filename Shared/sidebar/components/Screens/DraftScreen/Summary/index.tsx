import { Box, CircularProgress, Typography } from "@mui/material";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import showdown from "showdown";
import { BookIcon } from "../../../../../common/Icon/BookIcon";
import { fetchSummary as fetchSummaryFromBackend } from "../../../../store/actions/summaryActions";
import { selectIsReply, selectPreviousScreen, selectSubject, setScreen } from "../../../../store/reducers/AppReducer";
import { selectToken } from "../../../../store/reducers/AuthReducer";
import {
  selectIsLoadingSummary,
  selectOneSentenceSummary,
  selectSummary,
} from "../../../../store/reducers/SummaryReducer";
import { RootState } from "../../../../store/store";
import { Voting } from "../../../Common/DraftOutput/components/Voting";
import Header from "../../../Common/Header";
import { SummaryWrapper } from "./styles";
import { isNativeApp } from "@platformSpecific/sidebar/utils/officeMisc";

const formatSummary = (summary: string): string => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = summary;

  const paragraphs = tempDiv.querySelectorAll("p");

  paragraphs.forEach((paragraph: HTMLElement, index: number) => {
    if (index > 0) {
      paragraph.style.color = "#7468FF";
      paragraph.style.fontWeight = "700";
    }
  });

  return tempDiv.innerHTML;
};

const Summary = () => {
  const isNative = isNativeApp();
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const userDetails = useSelector((state: any) => state.auth.userDetails);
  const previousScreen = useSelector(selectPreviousScreen);
  const oneSentenceSummary = useSelector(selectOneSentenceSummary);
  const summary = useSelector(selectSummary);
  const completeSummary = oneSentenceSummary?.summary + "\n\n" + (summary?.summary || "");
  const converter = new showdown.Converter();
  const isLoadingSummary = useSelector(selectIsLoadingSummary);

  const html = formatSummary(converter.makeHtml(completeSummary));
  const isReply = useSelector(selectIsReply);
  const subject = useSelector(selectSubject);
  const token = useSelector(selectToken);
  const textAreaHeight = isNative ? "calc(100vh - 95px)" : "calc(100vh - 90px)";

  const messageBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!summary && isReply && token) {
        try {
          await dispatch(fetchSummaryFromBackend()).unwrap();
        } catch (error) {
          console.error("Error fetching summarize.", error);
        }
      }
    };
    fetchSummary();
  }, [dispatch, isReply, token, subject, userDetails]);

  const onGoBack = () => {
    if (previousScreen) {
      dispatch(setScreen(previousScreen));
    }
  };

  const scrollToBottom = () => {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [html]);

  return (
    <>
      <Box
        sx={{
          height: "100vh",
          background: "linear-gradient(180deg, #FFF 0%, #ECEBFF 100%)",
        }}
      >
        <Header isNative={isNative} onGoBack={onGoBack} />

        <Box display={"flex"} padding={"10px 10px 10px 10px"} alignItems={"center"}>
          <BookIcon sx={{ position: "sticky" }} />
          <Typography
            marginLeft={"10px"}
            align="left"
            sx={{ width: "210px" }}
            fontSize={"14px"}
            fontFamily={"Inter"}
            fontWeight={"400"}
          >
            Thread summary
          </Typography>
          {isLoadingSummary && (
            <CircularProgress
              sx={{
                position: "absolute",
                top: !isNative ? "43px" : "48px",
                left: "167px",
              }}
              size={"15px"}
            />
          )}
        </Box>
        <SummaryWrapper
          sx={{ backgroundColor: "#ffffff", marginTop: 0, paddingTop: 0 }}
          height={textAreaHeight}
          ref={messageBoxRef}
        >
          <Box
            sx={{
              fontFamily: "Inter",
              fontStyle: "normal",
              fontWeight: 400,
              fontSize: "14px",
              wordWrap: "break-word",
            }}
            dangerouslySetInnerHTML={{
              __html: html,
            }}
          ></Box>
          <Box display={"flex"} padding={"5px 10px 10px 10px"} flexDirection={"row"}>
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

export default Summary;
