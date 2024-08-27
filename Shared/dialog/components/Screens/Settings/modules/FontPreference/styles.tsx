import { Select, styled } from "@mui/material";
import { MuiColorInput } from "mui-color-input";
import styledEmotion from "@emotion/styled";

export const StyledSelect = styled(Select)(() => ({
  width: "calc(100% - 10px)",
  "& .MuiSelect-select": {
    height: "33px !important",
  },
  "& .MuiInputBase-root": {
    height: "33px !important",
  },
  "& .MuiInput-input": {
    display: "flex",
    alignItems: "center",
    color: "#131313",
    borderRadius: "4px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E2E2E2",
    height: "20px",
    padding: "5px 20px 5px 8px !important",
    "& .MuiTypography-root": {
      fontSize: "12px",
    },
    "&:focus": {
      backgroundColor: "#FFFFFF",
      border: "1px solid #7468FF",
      borderRadius: "4px",
    },
    "&:hover": {
      backgroundColor: "#FFFFFF",
      border: "1px solid #7468FF",
      borderRadius: "4px",
    },
  },
  "& .MuiSelect-icon": {
    right: "5px",
    color: "#000",
    fontSize: "18px",
  },
}));

export const MuiColorInputStyled = styledEmotion(MuiColorInput)`
  & .MuiColorInput-Popover {
    width: 250px;
  }
  & .MuiColorInput-TextField {
    background-color: #fff;
  }
`;
