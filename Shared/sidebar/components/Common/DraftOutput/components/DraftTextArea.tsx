import { Box } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { Draft } from "../../../../store/reducers/DraftReducer";
import { selectMenuYPosition } from "../../../../store/reducers/PartialTextEditingReducer";
import { PartialTextEditing } from "../../../Screens/DraftScreen/PartialTextEditing";
import TextEditor from "./TextEditor";

type Props = {
  selectedOption: number;
  drafts: Draft[];
  draftId: string | undefined | null;
  selectedRequestId: string | undefined | null;
};

export const HEADER_HEIGHT = 150;

export const DraftTextArea: React.FC<Props> = ({ selectedOption, draftId, drafts, selectedRequestId }) => {
  const menuYPosition = useSelector(selectMenuYPosition);

  return (
    <Box overflow={"inherit"} height={"calc(100% - 50px)"}>
      <TextEditor
        selectedOption={selectedOption}
        drafts={drafts}
        draftId={draftId}
        selectedRequestId={selectedRequestId}
      />
      <PartialTextEditing yPos={menuYPosition + HEADER_HEIGHT} />
    </Box>
  );
};
