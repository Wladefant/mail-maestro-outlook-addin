import axios from "axios";

export const API_ENDPOINTS = {
  EMAIL: {
    COMPOSE: `${process.env.BACKEND_URL}emails/compose`,
    REPLY: `${process.env.BACKEND_URL}emails/reply`,
    EXAMPLES: `${process.env.BACKEND_URL}emails/prompt-examples/`,
    SUMMARIZE: `${process.env.BACKEND_URL}emails/summarize`,
    SUMMARIZE_ATTACHMENT: `${process.env.BACKEND_URL}emails/summarize-attachment`,
    TIMESLOTS: `${process.env.BACKEND_URL}emails/timeslots`,
    RAPID_REPLY: `${process.env.BACKEND_URL}emails/rapid-reply-topics`,
  },
  AUTH: {
    USER: `${process.env.BACKEND_URL}auth/user/`,
  },
  ACCOUNTS: {
    USER_PROFILE: `${process.env.BACKEND_URL}account/user/`,
  },
  MAGIC_TEMPLATES: `${process.env.BACKEND_URL}emails/magic-templates/`,
  NEW_FEATURES: `${process.env.BACKEND_URL}notifications/feature-alerts/`,
  REPORTS: {
    SENT_EMAILS: `${process.env.BACKEND_URL}report/sent-emails-stats/`,
    ITEM_STATS: `${process.env.BACKEND_URL}report/outlook-item-stats/`,
  },
  IMPROVE_ACTIONS: {
    GET_ACTIONS: `${process.env.BACKEND_URL}emails/improve-actions/`,
    IMPROVE_TEXT: `${process.env.BACKEND_URL}emails/improve-text-part`,
  },
  TEXT_SHORTCUTS: `${process.env.BACKEND_URL}emails/text-shortcuts/`,
  SUBSCRIPTIONS: {
    DOWNGRADE: `${process.env.BACKEND_URL}subscriptions/downgrade`,
  },
  CUSTOM_INSTRUCTIONS: `${process.env.BACKEND_URL}emails/custom-instructions`,
};

export const RESPONSE_TYPES = {
  SUCCESS: "SUCCESS",
  ERROR: "ERROR",
};
