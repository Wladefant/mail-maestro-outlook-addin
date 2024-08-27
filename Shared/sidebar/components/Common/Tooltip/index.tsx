import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import * as React from "react";
import { isMobileApp } from "@platformSpecific/sidebar/utils/office";

export const TextShortcutExampleTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: "#7468FF",
    boxShadow: "0px 0px 30px 0px rgba(0, 0, 0, 0.10);",
    fontSize: 12,
    fontWeight: 400,
    borderRadius: 15,
    padding: "8px",
  },
}));

export const OptionButtonTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: "transparent",
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.black,
    padding: "5px",
  },
}));

export const CustomTooltip = styled(({ className, ...props }: TooltipProps) => {
  // don't show tooltips on mobile
  if (isMobileApp()) {
    return null;
  }
  return <Tooltip {...props} classes={{ popper: className }} />;
})(
  // @ts-ignore
  ({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: theme.palette.common.white,
      color: "#131313",
      boxShadow: "0px 0px 30px 0px rgba(0, 0, 0, 0.10);",
      fontSize: 12,
      fontWeight: 400,
      borderRadius: 10,
      padding: "3px",
      whiteSpace: "pre-wrap",
      display: "-webkit-box",
      WebkitLineClamp: "3",
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
      textOverflow: "ellipsis",
      border: `8px solid ${theme.palette.common.white}`,
    },
  }),
);
