import { Chip, styled } from "@mui/material";

export const StyledDraftOption = styled(Chip)<{ isselected: boolean }>(({ isselected }) => ({
  margin: "0 2px 0 0",
  width: "80px",
  padding: "4px 18px 4px 18px",
  height: "25px",
  borderRadius: "5px 5px 0 0",
  backgroundColor: isselected ? "#FFFFFF" : "#F9F9F9",
  borderTop: "1px solid",
  borderLeft: "1px solid",
  borderRight: "1px solid",
  borderBottom: "none",
  borderColor: isselected ? "#D9D6FF" : "#F9F9F9",
  color: isselected ? "#7468FF" : "#767676",
  fontSize: "14px",
  "& span": {
    fontSize: "14px",
    fontWeight: isselected ? "700" : "400",
    padding: "0",
    overflow: "visible",
  },
  "&:hover": {
    backgroundColor: isselected ? "#FFFFFF" : "#E8E8E8",
    ...(isselected && {
      borderColor: "#7468FF",
    }),
    color: isselected ? "#7468FF" : "#767676",
  },
}));
