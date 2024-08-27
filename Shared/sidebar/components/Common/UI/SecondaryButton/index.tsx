import * as React from "react";
import { styled } from "@mui/material/styles";
import Button, { ButtonProps } from "@mui/material/Button";

interface SecondaryButtonProps extends ButtonProps {
  width?: string | number;
  disabled?: boolean;
}

const SecondaryButton = styled(Button)<SecondaryButtonProps>(({ width = "232px", disabled }) => ({
  boxShadow: "none",
  width: width,
  height: "36px",
  textTransform: "none",
  fontSize: "13px",
  padding: "10px 1px 10px 10px",
  border: "1px solid #7468FF",
  backgroundColor: !disabled ? "#fff" : "#e0e0e0",
  borderColor: !disabled ? "#7468FF" : "#e0e0e0",
  borderRadius: 6,
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "16px",
  textAlign: "center",
  letterSpacing: "-0.02em",
  color: !disabled ? "#7468FF" : "#959595",
  fontFamily: ["Inter"].join(","),
  "&:hover": {
    backgroundColor: "#7468FF",
    borderColor: "#7468FF",
    boxShadow: "none",
    color: "#fff",
  },
  "&:active": {
    boxShadow: "none",
    backgroundColor: "#463BC9",
    borderColor: "#463BC9",
    color: "#fff",
  },
  "&:focus": {
    boxShadow: "0 0 0 0.2rem rgba(0,123,255,.5)",
  },
}));

export default SecondaryButton;
