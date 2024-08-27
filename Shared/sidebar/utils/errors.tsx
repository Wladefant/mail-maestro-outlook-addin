import React from "react";
import { handleClearCache } from "./browser";

export const errorTitle = "Sorry, something went wrong.";

export const errorDescription = () => {
  return (
    <p>
      Please try it again. If the issue persists try clearing the{" "}
      <button
        onClick={handleClearCache}
        style={{
          color: "blue",
          textDecoration: "underline",
          background: "none",
          border: "none",
          padding: "0",
          cursor: "pointer",
        }}
      >
        cache
      </button>{" "}
      or contact support at <a href="mailto:hello@maestrolabs.com">hello@maestrolabs.com</a>.
    </p>
  );
};
