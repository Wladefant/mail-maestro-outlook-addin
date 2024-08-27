import { Box, Typography } from "@mui/material";
import React from "react";
import { EditPencilIcon } from "../../../../common/Icon/TextShortcuts/EditPencilIcon";
import { ShortcutTextLabel } from "./styles";

type TextShortcutBoxProps = {
  shortcut: string;
  text: string;
  onEdit: () => void;
};

const TextShortcutBox: React.FC<TextShortcutBoxProps> = ({ shortcut, text, onEdit }) => {
  return (
    <Box
      border={"1px solid #E8E7FF"}
      display={"flex"}
      padding={"10px"}
      sx={{
        backgroundColor: "#FFFFFF",
        "&:hover": {
          backgroundColor: "#E8E7FF",
        },
      }}
    >
      <Box width={"85%"}>
        <Box marginBottom={"5px"}>
          <Typography align="left" fontSize={"12px"} fontFamily={"Inter"} fontWeight={"400"}>
            {shortcut}
          </Typography>
        </Box>
        <Box>
          <ShortcutTextLabel align="left" fontSize={"12px"} fontFamily={"Inter"} fontWeight={"400"} color={"#737373"}>
            {text}
          </ShortcutTextLabel>
        </Box>
      </Box>
      <Box width={"15%"} display={"flex"} alignItems={"center"} justifyContent={"center"}>
        <div onClick={onEdit}>
          <Box
            sx={{
              "&:hover": {
                cursor: "pointer",
              },
            }}
          >
            <EditPencilIcon />
          </Box>
        </div>
      </Box>
    </Box>
  );
};

export default TextShortcutBox;
