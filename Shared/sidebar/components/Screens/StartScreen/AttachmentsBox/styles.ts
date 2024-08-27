import { Box } from "@mui/material";
import { Select, styled } from "@mui/material";

export const OptionBoxContainer = styled("div")`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  border-radius: 9px;
  background-color: #ffffff;
  margin: 10px 10px 20px 10px;
  box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.1);
  position: relative;
`;

export const StyledSelect = styled(Select)(() => ({
  width: "calc(100% - 10px)",
  paddingLeft: "10px",
  "& .MuiInput-input": {
    display: "flex",
    alignItems: "center",
    color: "#131313",
    borderRadius: "10px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E8E7FF",
    height: "19px",
    padding: "5px 20px 5px 8px !important",
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
