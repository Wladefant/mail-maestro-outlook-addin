import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import usePusher from "../../../../hooks/usePusher";
import { createRapidReplyDraft, fetchRapidReplyAction } from "../../../../store/actions/rapidReplyActions";
import { selectItemId } from "../../../../store/reducers/AppReducer";
import { selectRemainingCredits, selectToken, selectUserDetails } from "../../../../store/reducers/AuthReducer";
import { TimeSlots, TimeslotResponse } from "../../../../store/reducers/CalendarReducer";
import {
  addFrameToRapidReply,
  getRapidReplyMetadataByItemId,
  removeRapidReplyByItemIdAndRequestId,
  setIsLoading,
} from "../../../../store/reducers/RapidReplyReducer";
import { RootState } from "../../../../store/store";
import { EventName } from "../../../../utils/constants";
import { PermissionHOC } from "../../../Common/PermissionHOC";
import { RapidReplyUI } from "./RapidReplyUI";

export type RapidReplyBoxProps = {
  notAccessible: boolean;
};

export const RapidReplyBox: React.FC<RapidReplyBoxProps> = ({ notAccessible }) => {
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  const userDetails = useSelector(selectUserDetails);
  const itemId = useSelector(selectItemId);
  const currentRapidReplyRequestId = useSelector(getRapidReplyMetadataByItemId(itemId as string))?.requestId;
  const remainingCredits = useSelector(selectRemainingCredits);

  const { timeslotResponses } = useSelector((state: RootState) => state.calendar);
  const timeslotResponse: TimeslotResponse | undefined = timeslotResponses.find(
    (timeslot: any) => timeslot.item_id === itemId,
  );
  const timeslots: TimeSlots[] = timeslotResponse?.timeslots || [];

  const token = useSelector(selectToken);

  const notAccessibleOnFreePlan = notAccessible || (userDetails?.subscription.type === "FREE" && remainingCredits <= 0);

  const handleRapidReplyClick = (rapidReply: string) => {
    if (notAccessibleOnFreePlan) return;
    dispatch(createRapidReplyDraft(rapidReply));
  };

  const refetchRapidReply = async () => {
    if (notAccessibleOnFreePlan) return;
    await dispatch(setIsLoading(true));
    await dispatch(
      removeRapidReplyByItemIdAndRequestId({
        itemId: itemId as string,
        requestId: currentRapidReplyRequestId as string,
      }),
    );
    await dispatch(fetchRapidReplyAction()).unwrap();
    await dispatch(setIsLoading(false));
  };

  useEffect(() => {
    const fetchRapidReply = async () => {
      if (token) {
        await dispatch(setIsLoading(true));
        await dispatch(fetchRapidReplyAction()).unwrap();
        await dispatch(setIsLoading(false));
      }
    };

    !notAccessibleOnFreePlan && fetchRapidReply();
  }, [dispatch, token, itemId]);

  usePusher(
    {
      channelName: userDetails?.settings?.pusher_channel as string,
      eventName: EventName.RAPID_REPLY,
    },
    (data: any) => {
      dispatch(addFrameToRapidReply({ data, itemId: itemId as string }));
    },
  );

  // Don't show rapid reply box if there are timeslots
  // This reduces confusion for users
  if (timeslots.length > 0) {
    return null;
  }

  return (
    <RapidReplyUI
      notAccessible={notAccessibleOnFreePlan}
      handleRapidReplyClick={handleRapidReplyClick}
      refetchRapidReply={refetchRapidReply}
    />
  );
};

export const PermissionedRapidReplyBox = PermissionHOC(RapidReplyBox, "can_rapid_reply");
