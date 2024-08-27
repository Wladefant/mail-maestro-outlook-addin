import { Box, Divider, Menu, Typography } from "@mui/material";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronRightIcon } from "../../../../../../../common/Icon/PartialTextEditing/ChevronRightIcon";
import { CloseIcon } from "../../../../../../../common/Icon/PartialTextEditing/CloseIcon";
import {
  fetchImproveActionsOptions,
  fetchImproveTextPart,
  resetImprovedTextPart,
} from "../../../../../../store/actions/partialTextEditingActions";
import { selectZoomLevel } from "../../../../../../store/reducers/AppReducer";
import {
  ImproveActionOptions,
  PartialEditingStep,
  SubOption,
  addOption,
  selectAvailableOptions,
  selectPartialEditingInputValue,
  selectPartialTextImprovedOutput,
  selectSelectedOptions,
  selectSelectedText,
  setStep,
} from "../../../../../../store/reducers/PartialTextEditingReducer";
import { RootState, useAppDispatch } from "../../../../../../store/store";
import { sortImproveActions } from "../../../../../../utils/partialTextEditing";
import { uuid4 } from "../../../../../../utils/uuid";
import { IconMapper } from "../../IconMapper";
import { PartialTextEditingOptionsInput } from "../../OptionsInput";
import { StyledMenuItem } from "../styles";

export const OptionsStep: React.FC = () => {
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  const options = useSelector(selectAvailableOptions);
  const selectedOptions = useSelector(selectSelectedOptions);
  const inputValue = useSelector(selectPartialEditingInputValue);
  const improvedOutput = useSelector(selectPartialTextImprovedOutput);
  const selectedText = useSelector(selectSelectedText);
  const zoomLevel = useSelector(selectZoomLevel);

  const buttonDisabled = selectedOptions.length === 0 && inputValue.trim() === "";

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        await dispatch(fetchImproveActionsOptions()).unwrap();
      } catch (error) {
        console.error("Error fetching magic templates.", error);
      }
    };
    fetchOptions();
  }, [dispatch]);

  const improveTextPart = async () => {
    await dispatch(fetchImproveTextPart()).unwrap();
    improvedOutput.finished && dispatch(setStep(PartialEditingStep.SELECTION));
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !buttonDisabled) {
      improveTextPart();
    }
  };

  const onCloseDialog = () => {
    dispatch(resetImprovedTextPart());
  };

  return (
    <Box>
      {zoomLevel >= 175 && (
        <>
          <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
            <Typography fontSize={"14px"} fontFamily={"Inter"} fontWeight={"700"} margin={"5px"}>
              Improve selected Text
            </Typography>
            <Box
              sx={{
                "&:hover": {
                  cursor: "pointer",
                },
              }}
              onClick={onCloseDialog}
            >
              <CloseIcon
                sx={{
                  color: "black",
                }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              background: "rgba(246, 248, 252, 1)",
              padding: "10px",
              margin: "5px",
              borderRadius: "5px",
              maxHeight: "168px",
              overflow: "hidden",
            }}
          >
            <Typography
              fontSize={"13px"}
              fontFamily={"Inter"}
              fontWeight={"400"}
              sx={{
                background: "linear-gradient(180deg, #131313 0%, rgba(19, 19, 19, 0.00) 93.75%)",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {selectedText.text}
            </Typography>
          </Box>
        </>
      )}
      <div
        style={{
          marginTop: "10px",
        }}
        onKeyDown={handleInputKeyDown}
      >
        <Box
          marginTop={"5px"}
          maxHeight={"160px"}
          overflow={"auto"}
          sx={{
            "&::-webkit-scrollbar": {
              borderRadius: "4px",
              width: "5px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#7468ff",
              borderRadius: "4px",
            },
          }}
        >
          <PartialTextEditingOptionsInput
            buttonDisabled={buttonDisabled}
            options={selectedOptions}
            inputValue={inputValue}
            improveTextPart={improveTextPart}
          />
        </Box>
        <Divider
          sx={{
            margin: "10px",
            borderColor: "rgba(116, 104, 255, 1)",
          }}
        />
        <Box
          sx={{
            borderRadius: "5px",
            backgroundColor: "#FFFFFF",
          }}
        >
          {[...options].sort(sortImproveActions).map((option: ImproveActionOptions) => {
            const { options } = option;
            const hasSubOptions = options && options.length > 0;

            return !hasSubOptions ? <MenuOption option={option} /> : <SelectOption option={option} />;
          })}
        </Box>
      </div>
    </Box>
  );
};

const SelectOption = ({ option }: { option: ImproveActionOptions }) => {
  const { icon, title, name, options } = option;
  const dispatch = useAppDispatch();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const onOptionClick = useCallback(
    (text: string, value: string) => {
      dispatch(
        addOption({
          key: name,
          text,
          value,
          id: uuid4(),
        }),
      );
      handleClose();
    },
    [dispatch],
  );

  return (
    <Box>
      <StyledMenuItem key={name} onClick={(e) => handleClick(e)}>
        <Box display="flex" justifyContent={"space-between"} width={"100%"} paddingRight="5px">
          <Box display="flex">
            <IconMapper icon={icon} />
            {title}
          </Box>
          <Box>
            <ChevronRightIcon />
          </Box>
        </Box>
      </StyledMenuItem>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{
          borderRadius: "10px",
          border: "1px solid #E8E7FF",
          "& .MuiMenu-list": {
            padding: "8px",
            "& .MuiMenuItem-root": {
              padding: "3px 10px 3px 10px",
              "& .MuiTypography-root": {
                fontSize: "14px",
                padding: "3px",
              },
              borderRadius: "6px",
              "&:hover": {
                backgroundColor: "#E8E7FF",
              },
              "&.Mui-selected": {
                backgroundColor: "#FFFFFF",
                color: "#7468FF",
                textDecoration: "underline",
              },
            },
          },
        }}
      >
        {options?.map((subOption: SubOption) => {
          return (
            <StyledMenuItem
              key={subOption.value}
              onClick={() => onOptionClick(`${title}: ${subOption.title}`, subOption.value)}
            >
              <IconMapper
                sx={{
                  width: "15px",
                  height: "15px",
                  marginRight: "5px",
                }}
                icon={subOption.icon}
              />
              {subOption.title}
            </StyledMenuItem>
          );
        })}
      </Menu>
    </Box>
  );
};

const MenuOption = ({ option }: { option: ImproveActionOptions }) => {
  const { icon, title, name } = option;
  const dispatch = useAppDispatch();

  const onOptionClick = useCallback(() => {
    dispatch(
      addOption({
        text: title,
        key: name,
        value: true,
        id: uuid4(),
      }),
    );
  }, [dispatch]);

  return (
    <StyledMenuItem key={name} onClick={() => onOptionClick()}>
      <IconMapper icon={icon} />
      {title}
    </StyledMenuItem>
  );
};
