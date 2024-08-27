import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, MenuItem, SelectChangeEvent, Typography } from "@mui/material";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GlobeIcon } from "../../../../../../../common/Icon/GlobeIcon";
import useLocalStorage from "../../../../../../hooks/useLocalStorage";
import { fetchOneSentenceSummary, fetchSummary } from "../../../../../../store/actions/summaryActions";
import { resetAttachmentSummaries } from "../../../../../../store/reducers/AttachmentsReducer";
import { selectUserDetails } from "../../../../../../store/reducers/AuthReducer";
import {
  clearSummaryThreadHashes,
  selectIsLoadingSummary,
  selectSummaryLanguage,
  updateLanguage,
} from "../../../../../../store/reducers/SummaryReducer";
import { RootState } from "../../../../../../store/store";
import { sortByProperty } from "../../../../../../utils/array";
import { languageOptions } from "../types";
import { StyledSelect } from "./styles";
import { selectItemId } from "../../../../../../store/reducers/AppReducer";
import {
  removeRapidReplyByItemIdAndRequestId,
  selectSelectedRapidReplyRequestId,
  setIsLoading as setIsLoadingRapidReply,
} from "../../../../../../store/reducers/RapidReplyReducer";
import { fetchRapidReplyAction } from "../../../../../../store/actions/rapidReplyActions";

const DEFAULT_LANGUAGE = "en-us";

type SummaryLanguageSelectorProps = {
  disableSelect?: boolean;
};

export const SummaryLanguageSelector: React.FC<SummaryLanguageSelectorProps> = ({ disableSelect }) => {
  const userDetails = useSelector(selectUserDetails);
  const [languageOnLocalStorage, setLanguageOnLocalStorage] = useLocalStorage<string>(
    `${userDetails?.email}_summary_language`,
    DEFAULT_LANGUAGE,
  );
  const loadingSummary = useSelector(selectIsLoadingSummary);
  const language = useSelector(selectSummaryLanguage);
  const itemId = useSelector(selectItemId);
  const selectedRapidReplyRequestId = useSelector(selectSelectedRapidReplyRequestId);

  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  useEffect(() => {
    if (languageOnLocalStorage) {
      dispatch(updateLanguage(languageOnLocalStorage));
    }
  }, [languageOnLocalStorage, userDetails?.email]);

  const refetchRapidReply = async () => {
    await dispatch(setIsLoadingRapidReply(true));
    await dispatch(
      removeRapidReplyByItemIdAndRequestId({
        itemId: itemId as string,
        requestId: selectedRapidReplyRequestId as string,
      }),
    );
    await dispatch(fetchRapidReplyAction()).unwrap();
    await dispatch(setIsLoadingRapidReply(false));
  };

  const refetchOneSentenceSummary = async () => {
    await dispatch(fetchOneSentenceSummary()).unwrap();
  };

  const refetchSummary = async () => {
    await dispatch(fetchSummary()).unwrap();
  };

  const onHandleChange = async (event: SelectChangeEvent<unknown>) => {
    if (disableSelect) return;
    setLanguageOnLocalStorage(event.target.value as string);
    dispatch(updateLanguage(event.target.value as string));
    dispatch(resetAttachmentSummaries());
    dispatch(clearSummaryThreadHashes());
    refetchOneSentenceSummary();
    refetchSummary();
    refetchRapidReply();
  };

  return (
    <Box paddingRight={0} width={"30%"}>
      <StyledSelect
        IconComponent={ExpandMoreIcon}
        value={language}
        variant="standard"
        disableUnderline
        disabled={loadingSummary || !language || disableSelect}
        native={false}
        displayEmpty={true}
        MenuProps={{
          PaperProps: {
            sx: {
              borderRadius: "3px",
              border: "1px solid #E8E7FF",
              "& .MuiMenu-list": {
                padding: "8px",
                "& .MuiMenuItem-root": {
                  padding: "3px 10px 3px 10px",
                  "& .MuiTypography-root": {
                    fontSize: "14px",
                  },
                  borderRadius: "3px",
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
        onChange={onHandleChange}
        renderValue={(selected) => {
          return (
            <>
              <Box marginRight={"5px"}>
                <GlobeIcon />
              </Box>{" "}
              <Typography fontSize={"10px"} overflow={"hidden"} textOverflow={"ellipsis"}>
                {
                  languageOptions.find(
                    (option) =>
                      option.key === language ||
                      option.key === selected ||
                      (!language && !selected && option.key === DEFAULT_LANGUAGE),
                  )?.text
                }
              </Typography>
            </>
          );
        }}
      >
        {sortByProperty(languageOptions, "text").map((option) => (
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
