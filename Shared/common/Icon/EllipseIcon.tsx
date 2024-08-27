import React from "react";
import { IconProps } from "./types";

export const EllipseIcon: React.FC<IconProps> = ({ sx }) => (
  <svg width="7" height="7" viewBox="0 0 7 7" fill="none" xmlns="http://www.w3.org/2000/svg" style={sx}>
    <circle cx="3.5" cy="3.5" r="3.5" fill="currentColor" />
  </svg>
);
