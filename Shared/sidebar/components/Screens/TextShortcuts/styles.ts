import { Typography } from "@mui/material";
import { styled } from "@mui/system";

export const ShortcutTextLabel = styled(Typography)`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;
