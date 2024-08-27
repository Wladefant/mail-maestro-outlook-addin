import { Box } from "@mui/material";
import { styled } from "@mui/system";

export const OptionBoxContainer = styled("div")`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  border-radius: 9px;
  background-color: #ffffff;
  margin: 8px 10px 20px 10px;
  box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.1);
  position: relative;
`;

export const SummaryWrapper = styled(Box)`
  position: relative;
  display: flex;
  width: 100%;
  padding: 0 10px 5px 10px;
  flex-direction: row;
  height: 100px;
  overflow: auto;

  &::-webkit-scrollbar {
    border-radius: 4px;
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: #7468ff;
    border-radius: 4px;
  }
`;
