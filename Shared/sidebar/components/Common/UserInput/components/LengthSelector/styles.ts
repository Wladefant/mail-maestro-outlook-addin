import { Select, styled } from "@mui/material";

export const StyledSelect = styled(Select)(() => ({
  padding: "0",
  width: "auto",
  "& .MuiInput-input": {
    display: "flex",
    alignItems: "center",
    color: "#7468FF",
    borderRadius: "10px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E8E7FF",
    height: "19px",
    padding: "8px 20px 8px 8px !important",
    "& .MuiTypography-root": {
      fontSize: "12px",
    },
    "&:focus": {
      backgroundColor: "#FFFFFF",
      border: "1px solid #7468FF",
      borderRadius: "10px",
    },
    "&:hover": {
      backgroundColor: "#FFFFFF",
      border: "1px solid #7468FF",
      borderRadius: "10px",
    },
  },
  "& .MuiSelect-icon": {
    right: "5px",
    color: "#7468FF",
    fontSize: "18px",
  },
}));
