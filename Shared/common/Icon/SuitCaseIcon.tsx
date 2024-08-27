import React from "react";
import { IconProps } from "./types";

export const SuitCaseIcon: React.FC<IconProps> = ({ sx }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={sx}>
    <g clip-path="url(#clip0_3105_161)">
      <path
        d="M8.125 5.3125V6.25H11.875V5.3125C11.875 5.20937 11.7906 5.125 11.6875 5.125H8.3125C8.20937 5.125 8.125 5.20937 8.125 5.3125ZM7 6.25V5.3125C7 4.58828 7.58828 4 8.3125 4H11.6875C12.4117 4 13 4.58828 13 5.3125V6.25V7V15.25H7V7V6.25ZM5.5 6.25H6.25V15.25H5.5C4.67266 15.25 4 14.5773 4 13.75V7.75C4 6.92266 4.67266 6.25 5.5 6.25ZM14.5 15.25H13.75V6.25H14.5C15.3273 6.25 16 6.92266 16 7.75V13.75C16 14.5773 15.3273 15.25 14.5 15.25Z"
        fill="#7468FF"
      />
    </g>
    <defs>
      <clipPath id="clip0_3105_161">
        <rect width="12" height="12" fill="white" transform="translate(4 4)" />
      </clipPath>
    </defs>
  </svg>
);
