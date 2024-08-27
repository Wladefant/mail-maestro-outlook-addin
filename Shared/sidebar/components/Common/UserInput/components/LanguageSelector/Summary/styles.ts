import { Select, styled } from "@mui/material";

export const StyledSelect = styled(Select)(() => ({
  width: "100%",
  "& .MuiInput-input": {
    display: "flex",
    alignItems: "center",
    color: "#7468FF",
    borderRadius: "3px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #7468FF",
    padding: "0 20px 0 8px !important",
    "& .MuiTypography-root": {
      fontSize: "12px",
    },
    "&:focus": {
      backgroundColor: "#FFFFFF",
      border: "1px solid #7468FF",
      borderRadius: "3px",
    },
    "&:hover": {
      backgroundColor: "#FFFFFF",
      border: "1px solid #7468FF",
      borderRadius: "3px",
    },
  },
  "& .MuiSelect-icon": {
    right: "5px",
    color: "#7468FF",
    fontSize: "18px",
  },
}));
