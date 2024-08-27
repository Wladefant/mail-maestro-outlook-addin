import { Menu, MenuItem } from "@mui/material";
import { styled } from "@mui/system";

interface StyledMenuProps {
  isExpanded: boolean;
}

export const StyledMenu = styled(Menu)<StyledMenuProps>`
  bottom: 0;
  left: 0;

  & .MuiPaper-root {
    width: 100%;

    &.MuiMenu-paper {
      padding: 0;
      width: 100%;
      bottom: 0 !important;
      left: 0 !important;
      top: auto !important;
      padding: 0 !important;
      border-radius: 10px 10px 0 0;
      max-width: 100%;

      ${({ isExpanded }) =>
        !isExpanded &&
        `
    margin: 23px !important;
    width: 85% !important;
    bottom: 53px! important;
    border-radius: 10px;
    `}
    }

    & .MuiList-root {
      padding: 0;
    }
  }
`;

export const StyledMenuItem = styled(MenuItem)`
  min-height: 0;
  font-family: Inter;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  padding: 2px 10px;
`;
