import { combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";

import authReducer from "./AuthReducer";
import votingReducer from "./VotingReducer";
import appReducer from "./AppReducer";
import promptHistoryReducer from "./promptHistoryReducer";
import DraftReducer from "./DraftReducer";
import MagicTemplateReducer from "./MagicTemplateReducer";
import SummaryReducer from "./SummaryReducer";
import PartialTextEditingReducer from "./PartialTextEditingReducer";
import TextShortcutsReducer from "./TextShortcutsReducer";
import AttachmentsReducer from "./AttachmentsReducer";
import CalendarReducer from "./CalendarReducer";
import { persistReducer } from "redux-persist";
import RapidReplyReducer from "./RapidReplyReducer";
import PlatformReducer from "@platformSpecific/sidebar/store/reducers/PlatformReducer";

const calendarPersistConfig = {
  key: "calendar",
  storage,
  blacklist: ["availabilityResponses"],
};

const summaryPersistConfig = {
  key: "summary",
  storage,
  //  cache invalidation using hashes
  blacklist: ["oneSentenceSummaryRequestId", "summaryRequestId"],
};

const magicTemplatePersistConfig = {
  key: "magicTemplate",
  storage,
  whitelist: ["magicTemplateResponses"],
};

const draftPersistConfig = {
  key: "draft",
  storage,
  whitelist: ["userDraftHistory", "generatedDraftHistory"],
};

const rapidReplyPersistConfig = {
  key: "rapidReply",
  storage,
};

const rootReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  platform: PlatformReducer,
  draft: persistReducer(draftPersistConfig, DraftReducer),
  voting: votingReducer,
  promptHistory: promptHistoryReducer,
  magicTemplate: persistReducer(magicTemplatePersistConfig, MagicTemplateReducer),
  partialEditingText: PartialTextEditingReducer,
  summary: persistReducer(summaryPersistConfig, SummaryReducer),
  textShortcuts: TextShortcutsReducer,
  attachments: AttachmentsReducer,
  calendar: persistReducer(calendarPersistConfig, CalendarReducer),
  rapidReply: persistReducer(rapidReplyPersistConfig, RapidReplyReducer),
});

export default rootReducer;
