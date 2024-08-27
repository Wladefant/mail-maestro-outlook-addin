import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, MenuItem, SelectChangeEvent, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { GlobeIcon } from "../../../../../../../common/Icon/GlobeIcon";
import { RootState, useAppDispatch } from "../../../../../../store/store";
import { StyledSelect } from "./styles";
import { completedListOfLanguageOptions } from "../types";
import useLocalStorage from "../../../../../../hooks/useLocalStorage";
import { selectUserDetails } from "../../../../../../store/reducers/AuthReducer";
import { setLanguageAction } from "../../../../../../store/actions/draftActions";
import { sortByProperty } from "../../../../../../utils/array";

export const LanguageSelector = () => {
  const userDetails = useSelector(selectUserDetails);
  const [languageOnLocalStorage, setLanguageOnLocalStorage] = useLocalStorage<string>(
    `${userDetails?.email}_language`,
    "",
  );
  const language = useSelector((state: RootState) => state.draft.language);
  const gaId = userDetails?.ganalytics_id;
  const loadingDraft = useSelector((state: RootState) => state.draft.isLoading);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (languageOnLocalStorage) {
      dispatch(
        setLanguageAction({
          language: languageOnLocalStorage,
          userId: gaId as string,
        }),
      );
    }
  }, [languageOnLocalStorage]);

  return (
    <Box paddingRight={0} width={"38%"}>
      <StyledSelect
        IconComponent={ExpandMoreIcon}
        value={language}
        variant="standard"
        disableUnderline
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
        defaultValue={"xx"}
        onChange={(event: SelectChangeEvent<unknown>) => {
          setLanguageOnLocalStorage(event.target.value as string);
          dispatch(
            setLanguageAction({
              language: event.target.value as string,
              userId: gaId as string,
            }),
          );
        }}
        renderValue={(selected) => {
          return (
            <>
              <Box marginRight={"5px"}>
                <GlobeIcon />
              </Box>{" "}
              <Typography fontSize={"10px"} overflow={"hidden"} textOverflow={"ellipsis"}>
                {completedListOfLanguageOptions.find((option) => option.key === selected)?.text}
              </Typography>
            </>
          );
        }}
      >
        {sortByProperty(completedListOfLanguageOptions, "text").map((option) => (
          <MenuItem key={option.key} value={option.key} sx={{ display: "flex", minHeight: "18px" }}>
            <Typography overflow={"hidden"} textOverflow={"ellipsis"}>
              {option.text}
            </Typography>
          </MenuItem>
        ))}
      </StyledSelect>
    </Box>
  );
};
