import React from "react";
import { IconProps } from "./types";

export const WarningInfoIcon: React.FC<IconProps> = ({ sx }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={sx}>
    <path
      d="M0 4C0 1.79086 1.79086 0 4 0H12C14.2091 0 16 1.79086 16 4V12C16 14.2091 14.2091 16 12 16H4C1.79086 16 0 14.2091 0 12V4Z"
      fill="#B3804A"
      fill-opacity="0.12"
    />
    <path
      d="M8 10.6389V7.47222M8 6.15278V5.36111M12.75 8C12.75 10.6234 10.6234 12.75 8 12.75C5.37665 12.75 3.25 10.6234 3.25 8C3.25 5.37665 5.37665 3.25 8 3.25C10.6234 3.25 12.75 5.37665 12.75 8Z"
      stroke="#B3804A"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);
