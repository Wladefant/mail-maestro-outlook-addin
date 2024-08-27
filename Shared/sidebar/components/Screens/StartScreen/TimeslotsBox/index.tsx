import { SelectChangeEvent } from "@mui/material";
import { OfficeModes } from "@platformSpecific/sidebar/hooks/usePlatformMetadata";
import { isMobileApp } from "@platformSpecific/sidebar/utils/office";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import moment from "moment";
import React, { useEffect } from "react";
import ReactGA from "react-ga4";
import { useDispatch, useSelector } from "react-redux";
import usePusher from "../../../../hooks/usePusher";
import { createTimeslotDraft, fetchTimeslotsAction } from "../../../../store/actions/calendarActions";
import { selectMode } from "../../../../store/reducers/AppReducer";
import { selectUserDetails } from "../../../../store/reducers/AuthReducer";
import {
  Availability,
  TimeSlots,
  TimeslotResponse,
  addFrameToTimeslots,
  changeSendersTimeZone,
  removeTimeslotsByItemId,
  setTimeslotsRequestId,
  setUserTimezone,
  updateAvailabilities,
} from "../../../../store/reducers/CalendarReducer";
import { selectDraftId } from "../../../../store/reducers/DraftReducer";
import { RootState } from "../../../../store/store";
import { isUserAvailable } from "../../../../utils/calendar";
import { EventName } from "../../../../utils/constants";
import { GA4_EVENTS } from "../../../../utils/events";
import { getTimezoneFromDatetime } from "../../../../utils/timezone";
import { uuid4 } from "../../../../utils/uuid";
import { PermissionHOC } from "../../../Common/PermissionHOC";
import { TimeslotsUI } from "./TimeslotsUI";

export type TimeslotsBoxProps = {
  notAccessible: boolean;
};

export const TimeslotsBox: React.FC<TimeslotsBoxProps> = ({ notAccessible }) => {
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const { timeslotResponses, availabilityResponses, userTimezone } = useSelector((state: RootState) => state.calendar);

  const user = useSelector(selectUserDetails);
  const draftId = useSelector(selectDraftId);

  const [senderTimezone, setSenderTimezone] = React.useState<string | null>(null);

  const itemId = useSelector((state: RootState) => state.app.itemId) ?? "";
  const mode = useSelector(selectMode);
  const isMobile = isMobileApp();

  const userDetails = useSelector((state: RootState) => state.auth.userDetails);
  const timeslotResponse: TimeslotResponse | undefined = timeslotResponses.find(
    (timeslot: any) => timeslot.item_id === itemId,
  );

  const timeslots: TimeSlots[] = timeslotResponse?.timeslots || [];
  const availabilities: Availability = availabilityResponses[itemId] || {};
  // Show warning if we can't check availability for all timeslots
  const calendarWarning =
    Object.values(availabilities).length > 0 &&
    Object.values(availabilities).every((value) => value!.available === null);

  useEffect(() => {
    if (timeslots.length > 0) {
      if (!senderTimezone) {
        const senderTimezone = getTimezoneFromDatetime(timeslots[0].start, [userTimezone as string]);
        setSenderTimezone(senderTimezone);
      }
      if (!userTimezone) {
        const userTimezone = moment.tz.guess();
        dispatch(setUserTimezone(userTimezone));
      }
    }
  }, [timeslots, itemId, userTimezone]);

  useEffect(() => {
    if (timeslots.length > 0) {
      const currentSenderTimezone = getTimezoneFromDatetime(timeslots[0].start, [
        userTimezone as string,
        senderTimezone as string,
      ]);
      if (currentSenderTimezone !== senderTimezone) {
        setSenderTimezone(currentSenderTimezone);
      }
    }
  }, [itemId, timeslots]);

  const requestTimeslots = () => {
    if (notAccessible) return;
    try {
      const requestId = uuid4();
      dispatch(removeTimeslotsByItemId(itemId as string));
      dispatch(setTimeslotsRequestId({ requestId, itemId }));
      dispatch(
        fetchTimeslotsAction({
          requestId,
        }),
      ).unwrap();
    } catch (error) {
      console.error("Error fetching timeslots:", error);
    }
  };

  const fetchTimeslots = async () => {
    if (
      userDetails &&
      mode === OfficeModes.READ_VIEW // Limit timeslot fetching to read view
    ) {
      const exists = timeslotResponses.findIndex((response: any) => response.item_id === itemId);
      if (exists === -1) {
        // only fetch timeslots if itemId has changed
        await requestTimeslots();
      }
    }
  };

  useEffect(() => {
    itemId && fetchTimeslots();
  }, [itemId]);

  const refetchTimeslots = () => {
    dispatch(removeTimeslotsByItemId(itemId as string));
    requestTimeslots();
  };

  const checkAvailabilityWithTimeZone = async (timezone: string) => {
    const newAvailabilities = { ...availabilities };
    if (!timeslots || timeslots.length === 0) {
      return;
    }
    for (const timeslot of timeslots) {
      if (timeslot.start && timeslot.end) {
        newAvailabilities[timeslot?.start] = await isUserAvailable(timeslot.start, timeslot.end);
      }
    }
    await dispatch(
      updateAvailabilities({
        item_id: itemId,
        availabilities: newAvailabilities,
      }),
    );
  };

  const recheckAvailability = async (newTimeZone: string) => {
    checkAvailabilityWithTimeZone(newTimeZone);
  };

  useEffect(() => {
    !isMobile && userTimezone && checkAvailabilityWithTimeZone(userTimezone);
    !isMobile && senderTimezone && checkAvailabilityWithTimeZone(senderTimezone);
  }, [timeslots, userTimezone, senderTimezone]);

  usePusher(
    {
      channelName: userDetails?.settings?.pusher_channel as string,
      eventName: EventName.TIMESLOTS,
    },
    (data: any) => {
      dispatch(addFrameToTimeslots({ data }));
    },
  );

  const handleSlotClick = (timeslot: TimeSlots, available: boolean | null) => {
    if (!available) return;
    //@ts-ignore
    dispatch(createTimeslotDraft(timeslot));
  };

  const onChangeSenderTimezone = async (event: SelectChangeEvent<unknown>) => {
    const newSenderTimezone = event.target.value as string;
    setSenderTimezone(newSenderTimezone);
    await dispatch(changeSendersTimeZone({ newTimezone: newSenderTimezone, itemId }));
    recheckAvailability(newSenderTimezone);
    ReactGA.event(GA4_EVENTS.TIMESLOTS_SENDER_TIMEZONE, {
      draftID: draftId,
      userID: user?.ganalytics_id,
    });
  };

  const onChangeUserTimezone = (event: SelectChangeEvent<unknown>) => {
    dispatch(setUserTimezone(event.target.value as string));
    ReactGA.event(GA4_EVENTS.TIMESLOTS_USER_TIMEZONE, {
      draftID: draftId,
      userID: user?.ganalytics_id,
    });
  };

  return (
    <TimeslotsUI
      notAccessible={false}
      senderTimezone={senderTimezone}
      handleSlotClick={handleSlotClick}
      refetchTimeslots={refetchTimeslots}
      onChangeSenderTimezone={onChangeSenderTimezone}
      onChangeUserTimezone={onChangeUserTimezone}
    />
  );
};

export const PermissionedTimeslotsBox = PermissionHOC(TimeslotsBox, "can_extract_timeslots");
