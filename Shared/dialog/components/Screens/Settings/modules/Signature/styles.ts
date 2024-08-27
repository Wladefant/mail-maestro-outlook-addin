import { Typography } from "@mui/material";
import { Select, styled } from "@mui/material";

export const ShortcutTextLabel = styled(Typography)`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

export const LanguageSelect = styled(Select)(() => ({
  "& .MuiInputBase-input": {
    display: "flex",
    alignItems: "center",
    padding: "0 0 0 5px",
    backgroundColor: "#FFFFFF",
  },
  "& .MuiSelect-select": {},
  width: "100%",
  "& .MuiInput-root": {
    margin: "0 !important",
  },
  "& .MuiInput-input": {
    display: "flex",
    alignItems: "center",
    color: "#7468FF",
    borderRadius: "10px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E8E7FF",
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

export const OptionsSelect = styled(Select)(() => ({
  width: "100%",
  margin: "5px 0",
  "& .MuiInput-input": {
    display: "flex",
    alignItems: "center",
    color: "#7468FF",
    borderRadius: "10px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E8E7FF",
    padding: "10px",
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
