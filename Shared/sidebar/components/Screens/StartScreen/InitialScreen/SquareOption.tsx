import { Box, Typography } from "@mui/material";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import React from "react";
import { useDispatch } from "react-redux";
import { Screen, setScreen } from "../../../../store/reducers/AppReducer";
import { RootState } from "../../../../store/store";
import { slugify } from "../../../../utils/string";
import { InitialOption } from "./types";
import { StarIcon } from "../../../../../common/Icon/SubscriptionExpired/StarIcon";

export interface SquareOptionProps {
  option: InitialOption;
  onOptionHover: (id: string) => void;
  onOptionLeave: () => void;
  optionIdHovered: string;
  disabled: boolean;
  notAvailable?: boolean;
}

export const SquareOption: React.FC<SquareOptionProps> = ({
  option,
  onOptionHover,
  onOptionLeave,
  optionIdHovered,
  disabled,
  notAvailable,
}) => {
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  const onGoPremiumClick = () => {
    dispatch(setScreen(Screen.SubscriptionExpired));
  };

  return (
    <Box
      key={option.id}
      data-testid={`${slugify(option.title)}-button`}
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: `6px 14px`,
        flex: "1 1 0px;",
        width: 0,
        height: "46px",
        margin: "0 1px",
        position: "relative",
        ...(disabled && {
          backgroundColor: "#D7D8D9",
          boxShadow: "0px 0px 6px 0px rgba(0, 0, 0, 0.12)",
          borderRadius: "8px",
        }),
        ...(!disabled && {
          "&:hover": {
            borderRadius: "8px",
            backgroundColor: "#FAFAFA",
            boxShadow: "0px 0px 6px 0px rgba(0, 0, 0, 0.12)",
            cursor: "pointer",
          },
        }),
      }}
      onMouseEnter={() => !disabled && onOptionHover(option.id)}
      onMouseLeave={() => !disabled && onOptionLeave()}
    >
      {notAvailable && (
        <StarIcon
          sx={{
            position: "absolute",
            top: "2px",
            right: "5px",
            color: "#7468FF",
          }}
        />
      )}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          cursor: "pointer",
          width: "100%",
        }}
        onClick={() => (notAvailable ? onGoPremiumClick() : !disabled && option.action())}
      >
        {
          <option.iconComponent
            sx={{
              color: disabled ? "#C5C5C5" : optionIdHovered === option.id ? "#7468FF" : "#595D62",
              marginBottom: "6px",
            }}
          />
        }
        <Typography
          sx={{
            fontFamily: "DM Sans",
            fontSize: "12px",
            fontStyle: "normal",
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: "16px",
            whiteSpace: "nowrap",
            color: disabled ? "#C5C5C5" : optionIdHovered === option.id ? "#7468FF" : "#595D62",
            width: "100%",
            textAlign: "center",
          }}
        >
          {option.title}
        </Typography>
      </Box>
    </Box>
  );
};
