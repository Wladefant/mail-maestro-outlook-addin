import React, { useEffect, useState } from "react";

const LoadingScreen = ({ showMessage = true }) => {
  const [loadingMessage, setLoadingMessage] = useState("Removing sensitive information…");
  const [messageSerial, setMessageSerial] = useState(1);

  const setMessage = async (message: string, nextSerial: number) => {
    setLoadingMessage(message);
    setMessageSerial(nextSerial);
  };

  useEffect(() => {
    if (messageSerial === 1) {
      setMessage("Drafting message…", 2);
    } else if (messageSerial === 2) {
      setMessage("Finalizing message…", 3);
    }
  }, [messageSerial]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        marginTop: "80px",
      }}
    >
      <img src="/assets/logo-animation.gif" height="160px" className="just-a-min" title="Just a min..." />
      <h3
        style={{
          fontFamily: "Inter",
          fontStyle: "normal",
          fontWeight: 700,
          fontSize: "20px",
          lineHeight: "25px",
          width: "80%",
          letterSpacing: "-0.02em",
          textAlign: "center",
          color: "#7468FF",
        }}
      >
        {showMessage && loadingMessage}
      </h3>
    </div>
  );
};

export default LoadingScreen;
