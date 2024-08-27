import { Box, Typography } from "@mui/material";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetImprovedTextPart } from "../../../../../store/actions/partialTextEditingActions";
import { RootState } from "../../../../../store/store";
import { StyledMenu } from "./styles";
import { ExpandIcon } from "../../../../../../common/Icon/PartialTextEditing/ExpandIcon";
import {
  selectIsExpanded,
  selectPartialTextImprovedOutput,
  setIsExpanded,
} from "../../../../../store/reducers/PartialTextEditingReducer";
import { CollapseIcon } from "../../../../../../common/Icon/PartialTextEditing/CollapseIcon";

type PartialTextEditingMenuProps = {
  open: boolean;
  yPos: number;
  children: React.ReactNode;
};

export const PartialTextEditingMenu: React.FC<PartialTextEditingMenuProps> = ({ open, yPos, children }) => {
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  const isExpanded = useSelector(selectIsExpanded);
  const { text: improvedOutput } = useSelector(selectPartialTextImprovedOutput);

  const handleDisplay = () => {
    dispatch(setIsExpanded(!isExpanded));
  };

  const handleCloseMenu = () => {
    dispatch(resetImprovedTextPart());
  };

  return (
    <Box>
      <StyledMenu
        open={open}
        onClose={handleCloseMenu}
        anchorReference="anchorPosition"
        anchorPosition={{ top: yPos, left: 20 }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          style: {
            width: "100%",
          },
        }}
        isExpanded={isExpanded}
      >
        <Box>
          <Box
            sx={{
              textAlign: "left",
              borderRadius: "10px 10px 0 0",
              backgroundColor: "#D2CEFF",
              padding: "4px 12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              textWrap: "nowrap",
            }}
          >
            {!isExpanded && improvedOutput ? (
              <Typography
                fontSize={"13px"}
                fontFamily={"Inter"}
                fontWeight={"400"}
                overflow={"hidden"}
                textOverflow={"ellipsis"}
                padding={"0 5px"}
              >
                {improvedOutput}
              </Typography>
            ) : (
              <Typography fontSize={"16px"} fontFamily={"Inter"} fontWeight={"700"}>
                Improve text
              </Typography>
            )}

            <Box
              sx={{
                "&:hover": {
                  cursor: "pointer",
                },
              }}
            >
              <div onClick={handleDisplay}>{!isExpanded ? <ExpandIcon /> : <CollapseIcon />}</div>
            </Box>
          </Box>

          <Box
            sx={{
              "&::-webkit-scrollbar": {
                borderRadius: "4px",
                width: "5px",
                padding: "3px",
              },

              "&::-webkit-scrollbar-thumb": {
                background: "#7468ff",
                borderRadius: "4px",
              },
              height: "200px",
              ...(!isExpanded && {
                height: "0px",
              }),
              overflowY: "auto",
            }}
          >
            {children}
          </Box>
        </Box>
      </StyledMenu>
    </Box>
  );
};
