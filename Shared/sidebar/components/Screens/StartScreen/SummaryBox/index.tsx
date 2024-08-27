import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOneSentenceSummary as fetchOneSentenceSummaryFromBackend } from "../../../../store/actions/summaryActions";
import { Screen, selectIsReply, setScreen } from "../../../../store/reducers/AppReducer";
import { selectConversationId } from "../../../../store/reducers/DraftReducer";
import { RootState } from "../../../../store/store";
import SummaryUI from "./SummaryUI";
import { PermissionHOC } from "../../../Common/PermissionHOC";
import { faker } from "@faker-js/faker";

interface SummaryBoxProps {
  summary: string;
  icon: React.ReactNode;
  requestId: string;
  notAccessible: boolean;
}

const MOCK_SUMMARY = faker.lorem.paragraphs(3);

export const SummaryBox: React.FC<SummaryBoxProps> = ({ summary, icon, requestId, notAccessible }) => {
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  const isReply = useSelector(selectIsReply);
  const conversationId = useSelector(selectConversationId);

  let summaryText = summary;
  if (notAccessible) {
    summaryText = MOCK_SUMMARY;
  }

  useEffect(() => {
    const fetchOneSentenceSummary = async () => {
      if (isReply) {
        try {
          await dispatch(fetchOneSentenceSummaryFromBackend()).unwrap();
        } catch (error) {
          console.error("Error fetching one sentence summarize.", error);
        }
      }
    };
    !notAccessible && fetchOneSentenceSummary();
  }, [dispatch, isReply, conversationId]);

  const onGetDetailedSummary = () => {
    if (notAccessible) return;
    dispatch(setScreen(Screen.Summary));
  };

  const onGoPremiumClick = () => {
    dispatch(setScreen(Screen.SubscriptionExpired));
  };

  return (
    <SummaryUI
      summary={summaryText}
      notAccessible={notAccessible}
      icon={icon}
      requestId={requestId}
      onGetDetailedSummary={onGetDetailedSummary}
      onGoPremiumClick={onGoPremiumClick}
    />
  );
};

export const PermissionedSummaryBox = PermissionHOC(SummaryBox, "can_summarize_emails");
