import { Select, styled } from "@mui/material";
import { TimeZoneSelectorProps } from "./TimeZoneSelector";

export const StyledSelect = styled(Select)<Partial<TimeZoneSelectorProps>>(({ backgroundColor }) => ({
  width: "100%",
  height: "100%",
  "& .MuiInput-input": {
    display: "flex",
    alignItems: "center",
    color: "#131313",
    borderRadius: "4px",
    backgroundColor: backgroundColor,
    padding: "4px !important",
    border: "1px solid #F5F5F5",
    width: "31px !important",
    height: "15px !important",
    minHeight: "15px !important",
    justifyContent: "center",
    "&:focus": {
      borderRadius: "4px",
      border: "1px solid #F5F5F5",
    },
    "&:hover": {
      backgroundColor: "#FFFFFF",
      border: "1px solid #F5F5F5",
      borderRadius: "4px",
    },
  },
  "& .MuiSelect-icon": {
    display: "none",
  },
}));
