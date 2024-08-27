import { Box } from "@mui/material";
import React, { useState } from "react";
import { PinIcon } from "../../../../../common/Icon/PinIcon";
import { PinIconHover } from "../../../../../common/Icon/PinIconHover";
// @ts-ignore

// @ts-ignore
// eslint-disable-next-line react/prop-types
export function PinButton({ clickHandler, pinned }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      display="flex"
      alignItems="center"
      sx={{ paddingLeft: "5px" }}
      onClick={clickHandler}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {pinned ? <PinIconHover /> : isHovered ? <PinIconHover /> : <PinIcon />}
    </Box>
  );
}
