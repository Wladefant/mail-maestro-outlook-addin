import React from "react";
import { IconProps } from "./types";

export const CalendarDisabledIcon: React.FC<IconProps> = ({ sx }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={sx}>
    <rect width="32" height="32" rx="16" fill="#ECEBFF" />
    <g clip-path="url(#clip0_5224_1805)">
      <path
        d="M15.5 19.5C15.5 20.5609 15.9214 21.5783 16.6716 22.3284C17.4217 23.0786 18.4391 23.5 19.5 23.5C20.5609 23.5 21.5783 23.0786 22.3284 22.3284C23.0786 21.5783 23.5 20.5609 23.5 19.5C23.5 18.4391 23.0786 17.4217 22.3284 16.6716C21.5783 15.9214 20.5609 15.5 19.5 15.5C18.4391 15.5 17.4217 15.9214 16.6716 16.6716C15.9214 17.4217 15.5 18.4391 15.5 19.5Z"
        stroke="#7468FF"
        strokeWidth="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M16.6719 22.3279L22.3279 16.6719"
        stroke="#7468FF"
        strokeWidth="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M13.5 19.4998H9.5C9.23478 19.4998 8.98043 19.3944 8.79289 19.2069C8.60536 19.0193 8.5 18.765 8.5 18.4998V10.5098C8.5 10.2445 8.60536 9.9902 8.79289 9.80266C8.98043 9.61512 9.23478 9.50977 9.5 9.50977H18.5C18.7652 9.50977 19.0196 9.61512 19.2071 9.80266C19.3946 9.9902 19.5 10.2445 19.5 10.5098V13.4998"
        stroke="#7468FF"
        strokeWidth="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path d="M8.5 12.5H19.5" stroke="#7468FF" strokeWidth="1.5" stroke-linejoin="round" />
      <path d="M11.4951 10.5V8.5" stroke="#7468FF" strokeWidth="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M16.4951 10.5V8.5" stroke="#7468FF" strokeWidth="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_5224_1805">
        <rect width="16" height="16" fill="white" transform="translate(8 8)" />
      </clipPath>
    </defs>
  </svg>
);
