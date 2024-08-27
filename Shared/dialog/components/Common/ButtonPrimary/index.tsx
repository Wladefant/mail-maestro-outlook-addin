import * as React from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";

const ButtonPrimary = styled(Button)({
  boxShadow: "none",
  width: "275px",
  textTransform: "none",
  fontSize: 16,
  padding: "10px 22px",
  border: "1px solid",
  backgroundColor: "#7468FF",
  borderColor: "#7468FF",
  borderRadius: 12,
  fontStyle: "normal",
  fontWeight: 700,
  lineHeight: "19px",
  textAlign: "center",
  letterSpacing: "-0.02em",
  color: "#fff",
  fontFamily: ["Inter"].join(","),
  "&:hover": {
    backgroundColor: "#fff",
    borderColor: "#7468FF",
    boxShadow: "none",
    color: "#7468FF",
  },
  "&:active": {
    boxShadow: "none",
    backgroundColor: "#fff",
    borderColor: "#7468FF",
    color: "#7468FF",
  },
  "&:focus": {
    boxShadow: "0 0 0 0.2rem rgba(0,123,255,.5)",
  },
});

export default ButtonPrimary;
