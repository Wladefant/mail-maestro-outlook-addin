import React from "react";
import { IconProps } from "../types";

export const SearchIcon: React.FC<IconProps> = ({ sx }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={sx}>
    <path
      d="M12.5 12.5L10.2936 10.2976M10.2936 10.2976C11.0151 9.57709 11.4615 8.58106 11.4615 7.48077C11.4615 5.28225 9.67929 3.5 7.48077 3.5C5.28225 3.5 3.5 5.28225 3.5 7.48077C3.5 9.67929 5.28225 11.4615 7.48077 11.4615C8.579 11.4615 9.57335 11.0168 10.2936 10.2976Z"
      stroke="black"
      strokeWidth="0.75"
      stroke-linecap="round"
    />
  </svg>
);
