import * as React from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
export const MenuButton = styled(Button)<{ width?: string; height?: string }>(({ width, height }) => ({
  boxShadow: "none",
  width: width || "232px",
  height: height || "40px",
  textTransform: "none",
  fontSize: 16,
  padding: "10px 40px 10px 30px",
  border: "1px solid #7468FF",
  backgroundColor: "#7468FF",
  borderColor: "#7468FF",
  borderRadius: 10,
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
}));

export default MenuButton;
