import { OfficeModes } from "@platformSpecific/sidebar/hooks/usePlatformMetadata";
import { getPreviousMessage, getPreviousThread } from "@platformSpecific/sidebar/utils/office";
import { getEmailReceivedDate, getTimeZone } from "@platformSpecific/sidebar/utils/officeMisc";
import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Sentry from "@sentry/browser";
import { fetchTimeslotsAPI } from "../../apis/calendar";
import { INTERNAL_MAGIC_TEMPLATES } from "../../utils/constants";
import { DraftAction, Screen, setDraftAction, setScreen } from "../reducers/AppReducer";
import { TimeSlots } from "../reducers/CalendarReducer";
import { setMagicTemplateResponse, setTemplateId } from "../reducers/MagicTemplateReducer";
import { RootState } from "../store";
import { createDraftAction, draftMessageAction } from "./draftActions";
import moment from "moment";
export const fetchTimeslotsAction = createAsyncThunk<
  any,
  { requestId: string },
  { rejectValue: string; state: RootState }
>("calendar/fetchTimelots", async ({ requestId = "" }, { rejectWithValue, getState, dispatch }) => {
  try {
    const state = getState();
    const user = state.auth.userDetails;
    const senderEmail = state.auth.userDetails?.email;
    const senderName = state.auth.userDetails?.first_name;
    const token = state.auth.token;
    const mode = state.app.mode;
    const conversationId = state.draft.conversationId;
    const itemId = state.app.itemId;
    const userTimezone = state.calendar.userTimezone;

    const defaultUserTimezone = moment.tz.guess();
    // get mail_body here instead of from state because it is not updated when only changing the item
    let mail_body = "";
    if (itemId) {
      mail_body = (await getPreviousMessage(itemId, mode || OfficeModes.READ_VIEW)) ?? "";
    } else {
      mail_body = (await getPreviousThread(conversationId, mode || OfficeModes.READ_VIEW)) ?? "";
    }
    // TODO: Method is not available in WRITE_MODE
    const received_at = await getEmailReceivedDate(itemId as string);
    const timezone = userTimezone || defaultUserTimezone;

    // const mail_body =
    //   "Date received: 2023-10-15: Johny Bottomhill informs Izaak and Ruben that he and Quang will be in Melbourne suggests meeting on " +
    //   "Tuesday 10am to 2pm or Tuesday 9am to 10" +
    //   "He could also do the 21st from 3 pm until 4 pm. " +
    //   "Another option is to meet on Tuesday the 17th October 11am";

    if (user) {
      const timeslots = await fetchTimeslotsAPI(
        requestId,
        token as string,
        senderName as string,
        senderEmail as string,
        mail_body,
        mode || undefined,
        received_at,
        timezone,
      );

      return timeslots.payload;
    }
    return null;
  } catch (error) {
    Sentry.captureException(error);
    return rejectWithValue("Error fetching summary");
  }
});

/*
 * This action is used to create a draft to accept an extracted timeslot
 * It uses an "internal" magic template to create the draft.
 */
export const createTimeslotDraft = createAsyncThunk<any, TimeSlots, { rejectValue: string; state: RootState }>(
  "calendar/createTimeslotDraft",
  async (timeslot: TimeSlots, { rejectWithValue, dispatch }) => {
    try {
      // We use a hard-coded magic template for the timeslot accept
      // This template is not available for the user to select
      const magicTemplateId = INTERNAL_MAGIC_TEMPLATES.TIMESLOTS_ACCEPT;
      dispatch(setScreen(Screen.Loading));
      dispatch(setDraftAction(DraftAction.REPLY));
      await dispatch(createDraftAction(DraftAction.TIMESLOTS_ACCEPT));
      dispatch(setTemplateId(magicTemplateId));
      dispatch(
        setMagicTemplateResponse({
          magicTemplateId,
          responses: { start_time: timeslot.start, end_time: timeslot.end },
        }),
      );
      await dispatch(draftMessageAction());
      return null;
    } catch (error) {
      Sentry.captureException(error);
      return rejectWithValue("Error creating timeslots draft");
    }
  },
);
