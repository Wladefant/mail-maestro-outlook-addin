import React from "react";

import DebugScreen from "@platformSpecific/sidebar/components/Screens/DebugScreen";
import AttachmentsSummary from "../components/Screens/AttachmentsSummary";
import DraftScreen from "../components/Screens/DraftScreen";
import Summary from "../components/Screens/DraftScreen/Summary";
import FontPreferences from "../components/Screens/FontPreferences";
import LitePlanExhaustedScreen from "../components/Screens/LitePlanExhaustedScreen";
import LoadingScreen from "../components/Screens/LoadingScreen";
import MagicTemplatesScreen from "../components/Screens/MagicTemplatesScreen";
import StartScreen from "../components/Screens/StartScreen";
import SubscriptionExpiredScreen from "../components/Screens/SubscriptionExpiredScreen";
import TextShortcuts from "../components/Screens/TextShortcuts";
import UnauthenticateScreen from "../components/Screens/UnauthenticateScreen";

export interface AppRoute {
  path: string;
  element: JSX.Element;
}

export enum APPROUTES {
  LOADING = "loading",
  UNAUTHENTICATED = "unauthenticated",
  START = "start",
  DRAFT = "draft",
  SUMMARY = "summary",
  TEXT_SHORTCUTS = "textShortcuts",
  ATTACHMENTS_SUMMARY = "attachmentsSummary",
  MAGIC_TEMPLATES = "magicTemplates",
  FONT_PREFERENCES = "fontPreferences",
  DEBUG = "debug",
  SUBSCRIPTION_EXPIRED = "subscriptionExpired",
  LITE_PLAN_EXHAUSTED = "litePlanExhausted",
}

export const APP_ROUTES: Record<string, AppRoute> = {
  loading: { path: APPROUTES.LOADING, element: <LoadingScreen showMessage={false} /> },
  unauthenticated: { path: APPROUTES.UNAUTHENTICATED, element: <UnauthenticateScreen /> },
  start: { path: APPROUTES.START, element: <StartScreen /> },
  draft: { path: APPROUTES.DRAFT, element: <DraftScreen /> },
  summary: { path: APPROUTES.SUMMARY, element: <Summary /> },
  textShortcuts: { path: APPROUTES.TEXT_SHORTCUTS, element: <TextShortcuts /> },
  attachmentsSummary: { path: APPROUTES.ATTACHMENTS_SUMMARY, element: <AttachmentsSummary /> },
  magicTemplates: { path: APPROUTES.MAGIC_TEMPLATES, element: <MagicTemplatesScreen /> },
  fontPreferences: { path: APPROUTES.FONT_PREFERENCES, element: <FontPreferences /> },
  debug: { path: APPROUTES.DEBUG, element: <DebugScreen /> },
  subscriptionExpired: { path: APPROUTES.SUBSCRIPTION_EXPIRED, element: <SubscriptionExpiredScreen /> },
  litePlanExhausted: { path: APPROUTES.LITE_PLAN_EXHAUSTED, element: <LitePlanExhaustedScreen /> },
};
