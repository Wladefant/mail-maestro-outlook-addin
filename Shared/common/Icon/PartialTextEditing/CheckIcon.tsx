import React from "react";
import { IconProps } from "../types";

export const CheckIcon: React.FC<IconProps> = ({ sx }) => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" style={sx}>
    <path
      d="M11.796 3.96969C12.068 4.26262 12.068 4.73832 11.796 5.03124L6.22518 11.0303C5.95317 11.3232 5.51142 11.3232 5.23941 11.0303L2.45401 8.03078C2.182 7.73785 2.182 7.26215 2.45401 6.96922C2.72602 6.6763 3.16777 6.6763 3.43978 6.96922L5.73339 9.43681L10.8124 3.96969C11.0844 3.67677 11.5262 3.67677 11.7982 3.96969H11.796Z"
      fill="currentColor"
    />
  </svg>
);
