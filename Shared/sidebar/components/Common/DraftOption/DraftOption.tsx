import React from "react";
import { StyledDraftOption } from "./styles";
import { CircularProgress } from "@mui/material";

export type DraftOptionProps = {
  label: string;
  isSelected: boolean;
  selectOption: (option: number) => void;
  draftOption: number;
  isLoading: boolean;
};

export const DraftOption: React.FC<DraftOptionProps> = ({
  label,
  isSelected,
  selectOption,
  draftOption,
  isLoading,
}) => {
  const onClick = () => {
    selectOption(draftOption);
  };

  return (
    <>
      <StyledDraftOption
        label={isLoading ? <CircularProgress size={"15px"} /> : label}
        isselected={!!isSelected}
        onClick={onClick}
      />
    </>
  );
};
