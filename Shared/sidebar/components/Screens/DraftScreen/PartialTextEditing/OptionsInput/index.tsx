import CloseIcon from "@mui/icons-material/Close";
import { Box } from "@mui/material";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import React from "react";
import { useDispatch } from "react-redux";
import { RightArrowButtonIcon } from "../../../../../../common/Icon/PartialTextEditing/RightArrowButtonIcon";
import { OptionData, removeOption, setInputValue } from "../../../../../store/reducers/PartialTextEditingReducer";
import { RootState } from "../../../../../store/store";
import { WandIcon } from "../../../../../../common/Icon/PartialTextEditing/WandIcon";

type Props = {
  buttonDisabled: boolean;
  options: OptionData[];
  inputValue: string;
  improveTextPart: () => void;
};

export const PartialTextEditingOptionsInput: React.FC<Props> = ({
  buttonDisabled,
  options,
  inputValue,
  improveTextPart,
}) => {
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setInputValue(event.target.value));
  };

  const handleOptionDelete = (optionToDelete: OptionData) => () => {
    dispatch(removeOption(optionToDelete.id));
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !buttonDisabled) {
      improveTextPart();
    }
  };

  return (
    <Box
      sx={{
        background: "#FFF",
        margin: "0 10px",
      }}
    >
      <Box
        style={{
          display: "flex",
          alignItems: "center",
          position: "relative",
        }}
      >
        <WandIcon
          sx={{
            color: "#7468FF",
            width: "12px",
          }}
        />
        <TextField
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder="Add your instructions or pick from below"
          fullWidth
          variant="outlined"
          sx={{
            position: "relative",
            "& input": { padding: "5px 10px", fontSize: "12px" },
            "& fieldset": { border: "none" },
            "& input::placeholder": {
              fontSize: "11px",
            },
          }}
        />
        <Box
          sx={{
            marginRight: "5px",
            marginTop: "5px",
            "&:hover": {
              ...(options.length > 0 && { cursor: "pointer" }),
            },
          }}
        >
          <div onClick={() => !buttonDisabled && improveTextPart()}>
            <RightArrowButtonIcon color={!buttonDisabled ? "#7468FF" : "#868686"} />
          </div>
        </Box>
      </Box>
      <Box marginTop={"5px"}>
        {options.map((option: OptionData) => (
          <Chip
            key={option.id}
            label={option.text}
            onDelete={handleOptionDelete(option)}
            sx={{
              "& span": {
                fontSize: "12px",
              },
              borderRadius: "4px",
              background: "#E8E7FF",
              height: "20px",
              margin: "5px",
            }}
            deleteIcon={<CloseIcon style={{ color: "#7468FF", width: "12px", height: "12px" }} />}
          />
        ))}
      </Box>
    </Box>
  );
};
