import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { fetchTimeslotsAction } from "../actions/calendarActions";
import { trimArrayToMaxElements } from "../../utils/array";
import { convertDatetimeToTimezone } from "../../utils/timezone";

export type TimeSlots = {
  start: string;
  end: string;
  available?: boolean | null;
};

export type TimeslotResponse = {
  timeslotsDetected: boolean;
  timeslots: TimeSlots[];
  request_id: string;
  item_id: string;
  finished?: boolean;
  frame_index?: number;
};

export type Availability = { [key: string]: any | null };

interface CalendarState {
  timeslotResponses: TimeslotResponse[];
  availabilityResponses: { [key: string]: Availability };
  activeRequestId?: string;
  isLoading: boolean;
  userTimezone: string;
}

const initialState: CalendarState = {
  timeslotResponses: [],
  availabilityResponses: {},
  activeRequestId: undefined,
  isLoading: false,
  userTimezone: "",
};

export const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    removeTimeslotsByItemId: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      state.timeslotResponses = state.timeslotResponses.filter((timeslot) => timeslot.item_id !== itemId);
      state.activeRequestId = undefined;
    },
    changeSendersTimeZone: (
      state,
      action: PayloadAction<{
        newTimezone: string;
        itemId: string;
      }>,
    ) => {
      const itemId = action.payload.itemId;
      const timezone = action.payload.newTimezone;
      const timeslotResponse = state.timeslotResponses.find((timeslot) => timeslot.item_id === itemId);
      if (timeslotResponse) {
        const newTimeslots = timeslotResponse.timeslots.map((timeslot) => {
          const newStart = convertDatetimeToTimezone(timeslot.start, timezone);
          const newEnd = convertDatetimeToTimezone(timeslot.end, timezone);
          return {
            ...timeslot,
            start: newStart,
            end: newEnd,
          };
        });
        timeslotResponse.timeslots = newTimeslots;
        const index = state.timeslotResponses.findIndex((timeslot) => timeslot.item_id === itemId);
        state.timeslotResponses[index] = timeslotResponse;
      }
    },
    setTimeslotsRequestId: (state, action: PayloadAction<any>) => {
      state.activeRequestId = action.payload.requestId;
      const itemId = action.payload;
      const timeslotResponse = state.timeslotResponses.find((timeslot) => timeslot.item_id === itemId);
      if (!timeslotResponse) {
        state.timeslotResponses.push({
          timeslotsDetected: false,
          timeslots: [],
          request_id: action.payload.requestId,
          item_id: action.payload.itemId,
        });
        state.timeslotResponses = trimArrayToMaxElements(state.timeslotResponses);
      }
    },
    updateAvailabilities: (state, action: PayloadAction<any>) => {
      const itemId = action.payload.item_id;
      state.availabilityResponses[itemId] = action.payload.availabilities;
    },
    addFrameToTimeslots: (
      state,
      action: PayloadAction<{
        data: any;
      }>,
    ) => {
      const requestId = action.payload.data.request_id;
      const timeslotResponse = state.timeslotResponses.find((timeslot) => timeslot.request_id === requestId);
      if (timeslotResponse) {
        // TODO: This seems to be not true, check it
        //  We stream slots one by one, so we need to add the last slot to the list
        // if (
        //   timeslotResponse.timeslots.length <
        //   action.payload.data.content.timeslots.length
        // ) {
        //   timeslotResponse.timeslots.push(
        //     action.payload.data.content.timeslots[
        //       action.payload.data.content.timeslots.length - 1
        //     ]
        //   );
        // }
        timeslotResponse.timeslots = action.payload.data.content.timeslots;

        timeslotResponse.timeslotsDetected = action.payload.data.content.timeslots_detected;
        timeslotResponse.finished = action.payload.data.last_frame;
        timeslotResponse.frame_index = action.payload.data.frame_index;

        const index = state.timeslotResponses.findIndex((timeslot) => timeslot.request_id === requestId);
        state.timeslotResponses[index] = timeslotResponse;
        state.isLoading = !action.payload.data?.last_frame;
      }
    },
    setTimeslotResponses: (state, action: PayloadAction<TimeslotResponse[]>) => {
      state.timeslotResponses = action.payload;
    },
    setUserTimezone: (state, action: PayloadAction<string>) => {
      state.userTimezone = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimeslotsAction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTimeslotsAction.rejected, (state) => {
        state.isLoading = false;
        state.timeslotResponses = [];
      })
      .addCase(fetchTimeslotsAction.fulfilled, (state, action: PayloadAction<any>) => {
        if (action.payload) {
          const requestId = action.payload.request_id;
          const timeslot = state.timeslotResponses.find((timeslot) => timeslot.request_id === requestId);
          if (timeslot) {
            timeslot.timeslots = action.payload.content.timeslots;
            timeslot.timeslotsDetected = action.payload.content.timeslots_detected;
            timeslot.finished = true;
            const index = state.timeslotResponses.findIndex((timeslot) => timeslot.request_id === requestId);
            state.timeslotResponses[index] = timeslot;
            state.isLoading = false;
          }
        }
        state.isLoading = false;
      });
  },
});

export const {
  removeTimeslotsByItemId,
  setTimeslotsRequestId,
  addFrameToTimeslots,
  updateAvailabilities,
  setTimeslotResponses,
  setUserTimezone,
  changeSendersTimeZone,
} = calendarSlice.actions;

export default calendarSlice.reducer;
