import React from "react";

export interface IconProps {
  sx?: React.CSSProperties;
}

export const InfoIcon: React.FC<IconProps> = ({ sx }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={sx}>
    <path
      d="M8 10.6389V7.47222M8 6.15278V5.36111M12.75 8C12.75 10.6234 10.6234 12.75 8 12.75C5.37665 12.75 3.25 10.6234 3.25 8C3.25 5.37665 5.37665 3.25 8 3.25C10.6234 3.25 12.75 5.37665 12.75 8Z"
      stroke="#7468FF"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);
