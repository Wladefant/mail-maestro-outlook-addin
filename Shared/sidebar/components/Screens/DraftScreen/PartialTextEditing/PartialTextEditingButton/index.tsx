import React from "react";
import { useSelector } from "react-redux";
import { SelectIcon } from "../../../../../../common/Icon/PartialTextEditing/SelectIcon";
import { WandIconV2 } from "../../../../../../common/Icon/WandIconV2";
import { Draft } from "../../../../../store/reducers/DraftReducer";
import {
  PartialEditingStep,
  selectSelectedText,
  selectShowMenu,
  selectStep,
  setShowMenu,
} from "../../../../../store/reducers/PartialTextEditingReducer";
import { useAppDispatch } from "../../../../../store/store";
import { StyledButton } from "./styles";

type Props = {
  YPosition: number;
  selectedDraft: Draft;
};

export const EDITOR_HEIGHT = 520;

const calculateButtonYposition = (_YPosition: number): React.CSSProperties => {
  return {
    bottom: "97px",
  };
  // if (YPosition > EDITOR_HEIGHT) {
  //   return {
  //     bottom: "97px",
  //   };
  // }
  // return {
  //   top: YPosition + HEADER_HEIGHT,
  // };
};

export const PartialTextEditingButton: React.FC<Props> = ({ YPosition, selectedDraft }) => {
  const showMenu = useSelector(selectShowMenu);

  const selectedText = useSelector(selectSelectedText);
  const step = useSelector(selectStep);

  const dispatch = useAppDispatch();
  const handleClick = () => {
    dispatch(setShowMenu(!showMenu));
  };

  const isDisabled = !selectedText.text || step === PartialEditingStep.LOADING;
  return selectedDraft?.finished ? (
    <StyledButton
      istextselected={!!selectedText.text}
      sx={calculateButtonYposition(YPosition)}
      disabled={isDisabled}
      onClick={handleClick}
    >
      {isDisabled ? <SelectIcon sx={{ marginRight: "3px" }} /> : <WandIconV2 sx={{ marginRight: "3px" }} />}
      {isDisabled ? "Select text to improve" : "Improve selected text"}
    </StyledButton>
  ) : null;
};
