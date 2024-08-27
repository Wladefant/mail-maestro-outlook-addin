import { Box } from "@mui/material";
import React from "react";
import TextEditor from "./TextEditor";

export const DraftTextArea: React.FC = ({}) => {
  return (
    <Box overflow={"hidden"} height={"100%"}>
      <TextEditor />
    </Box>
  );
};
