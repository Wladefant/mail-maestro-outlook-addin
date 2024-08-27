import { Box } from "@mui/material";
import React from "react";

const UnauthenticateScreen: React.FC = () => {
  return (
    <Box
      sx={{
        marginTop: "50px",
        padding: "20px",
        color: "#131313",
        textAlign: "center",
        fontSize: "14px",
        fontFamily: "Inter",
        fontStyle: "normal",
        fontWeight: 400,
        lineHeight: "normal",
      }}
    >
      <img src={"../../../assets/writing_guy.svg"} />
      <p style={{ marginTop: 50 }}>
        We couldn't authenticate you. Please contact support or your system administrator.
      </p>
    </Box>
  );
};

export default UnauthenticateScreen;
