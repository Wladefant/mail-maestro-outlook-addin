import { Box, Divider, Typography } from "@mui/material";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import React, { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CheckIcon } from "../../../../../../../common/Icon/PartialTextEditing/CheckIcon";
import { CloseIcon } from "../../../../../../../common/Icon/PartialTextEditing/CloseIcon";
import { CycleIcon } from "../../../../../../../common/Icon/PartialTextEditing/CycleIcon";
import { TrashIcon } from "../../../../../../../common/Icon/PartialTextEditing/TrashIcon";
import { updateEmailStatuses } from "../../../../../../apis/draft";
import {
  fetchImproveTextPart,
  improveTextPartFromDraft,
  resetImprovedTextPart,
} from "../../../../../../store/actions/partialTextEditingActions";
import { selectZoomLevel } from "../../../../../../store/reducers/AppReducer";
import { selectToken } from "../../../../../../store/reducers/AuthReducer";
import {
  PartialEditingStep,
  resetPartialTextImprovedOutput,
  selectPartialTextImprovedOutput,
  setStep,
} from "../../../../../../store/reducers/PartialTextEditingReducer";
import { RootState } from "../../../../../../store/store";
import { StyledMenuItem } from ".././styles";
import { convertMarkdownToHTML } from "../../../../../../utils/html";

type Props = {};

const iconStyling = {
  width: "20px",
  height: "20px",
  marginRight: "5px",
  color: "#7468FF",
};

export const SelectionStep: React.FC<Props> = () => {
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const { text: improvedOutput, request_id } = useSelector(selectPartialTextImprovedOutput);

  const authToken = useSelector(selectToken);
  const zoomLevel = useSelector(selectZoomLevel);

  const acceptImprovement = useCallback(async () => {
    dispatch(improveTextPartFromDraft());
    request_id &&
      (await updateEmailStatuses(
        {
          request_id: request_id,
          request_status: "accepted",
        },
        authToken,
      ));
  }, [dispatch, request_id]);

  const discardImprovement = useCallback(async () => {
    request_id &&
      (await updateEmailStatuses(
        {
          request_id: request_id,
          request_status: "rejected",
        },
        authToken,
      ));
    dispatch(resetImprovedTextPart());
  }, [dispatch, request_id]);

  const tryAgain = useCallback(async () => {
    await dispatch(resetPartialTextImprovedOutput());
    await dispatch(fetchImproveTextPart()).unwrap();
    await dispatch(setStep(PartialEditingStep.SELECTION));
  }, [dispatch]);

  const options = useMemo(
    () => [
      {
        label: "Use this version",
        icon: <CheckIcon sx={iconStyling} />,
        callback: acceptImprovement,
      },
      {
        label: "Try again",
        icon: <CycleIcon sx={iconStyling} />,
        callback: tryAgain,
      },
      {
        label: "Discard",
        icon: <TrashIcon sx={iconStyling} />,
        callback: discardImprovement,
      },
    ],
    [dispatch, acceptImprovement, discardImprovement, tryAgain],
  );

  return zoomLevel >= 175 ? (
    <>
      <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
        <Typography fontSize={"14px"} fontFamily={"Inter"} fontWeight={"700"} margin={"5px"}>
          AI response
        </Typography>
        <Box
          sx={{
            "&:hover": {
              cursor: "pointer",
            },
          }}
          onClick={discardImprovement}
        >
          <CloseIcon
            sx={{
              color: "black",
            }}
          />
        </Box>
      </Box>
      <Box>
        <Typography
          color={"#131313"}
          fontFamily={"Inter"}
          padding={"10px"}
          fontSize={"12px"}
          fontWeight={"400"}
          dangerouslySetInnerHTML={{
            __html: improvedOutput ? convertMarkdownToHTML(improvedOutput) : "",
          }}
        />
      </Box>
      <Box margin={"10px"}>
        <Box
          width={"100%"}
          sx={{
            borderRadius: "5px",
            backgroundColor: "#FFFFFF",
            boxShadow: "0px 0px 10px 0px rgba(0, 0, 0, 0.10)",
            margin: "5px 5px 10px 0px",
          }}
        >
          {options.map(({ label, icon, callback }) => (
            <StyledMenuItem key={label} onClick={callback}>
              {icon}
              {label}
            </StyledMenuItem>
          ))}
        </Box>
      </Box>
    </>
  ) : (
    <Box>
      <Box
        sx={{
          backgroundColor: "#FFFFFF",
          height: "100px",
          overflow: "auto",
          "&::-webkit-scrollbar": {
            borderRadius: "4px",
            width: "5px",
            padding: "3px",
          },

          "&::-webkit-scrollbar-thumb": {
            background: "#7468ff",
            borderRadius: "4px",
          },
        }}
      >
        <Box padding={"0 10px 10px 10px"}>
          <Typography
            color={"#131313"}
            fontFamily={"Inter"}
            fontSize={"13px"}
            fontWeight={"400"}
            dangerouslySetInnerHTML={{
              __html: improvedOutput ? convertMarkdownToHTML(improvedOutput) : "",
            }}
          />
        </Box>
      </Box>
      <Divider
        sx={{
          margin: "0 10px 10px 10px",
          borderColor: "rgba(116, 104, 255, 1)",
        }}
      />

      <Box>
        <Box
          sx={{
            borderRadius: "5px",
            backgroundColor: "#FFFFFF",
          }}
        >
          {options.map(({ label, icon, callback }) => (
            <StyledMenuItem key={label} onClick={callback}>
              {icon}
              {label}
            </StyledMenuItem>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
