import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, MenuItem, SelectChangeEvent, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../../../../../store/store";
import { LongLengthIcon } from "../../../UI/Icon/LongLengthIcon";
import { MediumLengthIcon } from "../../../UI/Icon/MediumLengthIcon";
import { ShortLengthIcon } from "../../../UI/Icon/ShortLengthIcon";
import { VeryShortLengthIcon } from "../../../UI/Icon/VeryShortLengthIcon";
import { StyledSelect } from "./styles";
import { EmailLength, EmailLengthValues } from "./types";
import useLocalStorage from "../../../../../hooks/useLocalStorage";
import { selectUserDetails } from "../../../../../store/reducers/AuthReducer";
import { setEmailLengthAction } from "../../../../../store/actions/draftActions";

export const emailLengthOptions = [
  {
    key: EmailLengthValues.VeryShort,
    text: "Extra Short",
    icon: <VeryShortLengthIcon />,
  },
  { key: EmailLengthValues.Short, text: "Short", icon: <ShortLengthIcon /> },
  { key: EmailLengthValues.Medium, text: "Medium", icon: <MediumLengthIcon /> },
  { key: EmailLengthValues.Detailed, text: "Long", icon: <LongLengthIcon /> },
];

export const LengthSelector = () => {
  const userDetails = useSelector(selectUserDetails);
  const [lengthOnLocalStorage, setLengthOnLocalStorage] = useLocalStorage<string>(`${userDetails?.email}_length`, "");
  const emailLength = useSelector((state: RootState) => state.draft.emailLength);
  const gaId = userDetails?.ganalytics_id;
  const loadingDraft = useSelector((state: RootState) => state.draft.isLoading);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (lengthOnLocalStorage) {
      dispatch(
        setEmailLengthAction({
          emailLength: lengthOnLocalStorage,
          userId: gaId as string,
        }),
      );
    }
  }, [lengthOnLocalStorage]);

  return (
    <Box>
      <StyledSelect
        IconComponent={ExpandMoreIcon}
        value={emailLength}
        variant="standard"
        disableUnderline
        defaultValue={"medium"}
        disabled={loadingDraft}
        MenuProps={{
          PaperProps: {
            sx: {
              borderRadius: "10px",
              border: "1px solid #E8E7FF",
              "& .MuiMenu-list": {
                padding: "8px",
                "& .MuiMenuItem-root": {
                  padding: "3px 10px 3px 10px",
                  "& .MuiTypography-root": {
                    fontSize: "14px",
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
            },
          },
        }}
        renderValue={(selected) => {
          return emailLengthOptions.find((option) => option.key === selected)?.icon;
        }}
        onChange={(event: SelectChangeEvent<unknown>) => {
          setLengthOnLocalStorage(event.target.value as string);
          dispatch(
            setEmailLengthAction({
              emailLength: event.target.value as string,
              userId: gaId as string,
            }),
          );
        }}
      >
        {emailLengthOptions.map((option) => (
          <MenuItem
            key={option.key}
            value={option.key}
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              minHeight: "20px",
            }}
          >
            <Box display={"flex"}>{option.icon}</Box>
            <Box marginLeft={"5px"}>{option.text}</Box>
          </MenuItem>
        ))}
      </StyledSelect>
    </Box>
  );
};
