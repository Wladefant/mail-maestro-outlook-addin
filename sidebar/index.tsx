import * as React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import App from "./components/App";
import store from "../../Shared/sidebar/store/store";
import { persistor } from "../../Shared/sidebar/store/store";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/browser";
import ReactGA from "react-ga4";
import { Userpilot } from "userpilot";
import { BrowserRouter } from "react-router-dom";
import { msalInstance } from "./utils/graphAPI";

Userpilot.initialize(process.env.USERPILOT_APP_ID || "");

/* global document, Office, module, require */

ReactGA.initialize(process.env.GA_PROPERTY || "");

let isOfficeInitialized = false;

if (process.env.SENTRY_DSN) {
  window.onerror = () => {};

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    release: "outlook-add-in@" + process.env.npm_package_version,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.3,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      new BrowserTracing(),
      new Sentry.Replay({
        maskAllText: true,
        networkDetailAllowUrls: [
          "https://app.maestrolabs.com/emails/reply",
          "https://app.maestrolabs.com/emails/improve",
          "https://app.maestrolabs.com/emails/compose",
        ],
      }),
    ],
  });
}

// Initialize Azure MSAL
msalInstance.initialize();

const container = document.getElementById("container");
if (!container) throw new Error("container not found!");

const root = createRoot(container);

const render = (Component: any) => {
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <Component isOfficeInitialized={isOfficeInitialized} />
          </PersistGate>
        </Provider>
      </BrowserRouter>
    </React.StrictMode>,
  );
};

/* Render application after Office initializes */
Office.onReady(() => {
  isOfficeInitialized = true;
  Sentry.setUser({ email: Office.context.mailbox.userProfile.emailAddress });
  // Workaround to allow react-router to work in Office Add-ins
  // Remove 'own' property with `null` shadowed by Office.js, reveals original inherited one
  // @ts-ignore
  delete history.pushState;
  // @ts-ignore
  delete history.replaceState;
  render(App);
});

if ((module as any).hot) {
  (module as any).hot.accept("./components/App", () => {
    const NextApp = require("./components/App").default;
    render(NextApp);
  });
}
