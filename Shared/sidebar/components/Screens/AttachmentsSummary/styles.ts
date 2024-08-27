import { Box } from "@mui/material";
import { styled } from "@mui/system";

export const SummaryWrapper = styled(Box)`
  padding: 10px;
  padding-top: 0;
  margin: 10px;
  margin-top: 0;
  border: 1px solid #e8e7ff;
  border-radius: 10px;
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

export const SummaryText = styled(Box)`
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
