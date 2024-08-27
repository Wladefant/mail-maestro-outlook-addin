import { EventName } from "./constants";
import { DraftAction, Screen } from "../store/reducers/AppReducer";

const eventsByAction = {
  [DraftAction.IMPROVE]: EventName.IMPROVE,
  [DraftAction.COMPOSE]: EventName.COMPOSE,
  [DraftAction.REPLY]: EventName.REPLY,
  [DraftAction.TIMESLOTS_ACCEPT]: EventName.REPLY,
  [DraftAction.RAPID_REPLY]: EventName.REPLY,
  [DraftAction.FORWARD]: EventName.FORWARD,
  [DraftAction.REPLY_FAQ]: EventName.REPLY_FAQ,
};
export const getEvent = (draftAction: DraftAction | null) => {
  if (!draftAction) return null;
  return eventsByAction[draftAction];
};
