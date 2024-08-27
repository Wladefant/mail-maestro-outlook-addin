import { Box, CircularProgress, Typography } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { WandIcon } from "../../../../../../../common/Icon/PartialTextEditing/WandIcon";
import { selectZoomLevel } from "../../../../../../store/reducers/AppReducer";

export const LoadingStep: React.FC = () => {
  const zoomLevel = useSelector(selectZoomLevel);
  return zoomLevel >= 175 ? (
    <>
      <Box
        display={"flex"}
        height={"100%"}
        width={"100%"}
        alignItems={"center"}
        flexDirection={"column"}
        justifyContent={"center"}
      >
        <img src="../../../../../../../../../assets/wand.svg" />
        <Typography
          color={"rgba(116, 104, 255, 1)"}
          fontFamily={"Inter"}
          fontSize={"14px"}
          fontWeight={"700"}
          marginTop={"20px"}
        >
          AI is writing...
        </Typography>
      </Box>
    </>
  ) : (
    <Box
      padding={"5px"}
      display={"flex"}
      justifyContent={"space-between"}
      alignItems={"center"}
      sx={{
        color: "#FFFFFF",
      }}
      margin={"5px"}
    >
      <Box display={"flex"}>
        <WandIcon
          sx={{
            color: "#7468FF",
            marginRight: "3px",
            marginLeft: "5px",
            width: "12px",
          }}
        />
        <Typography fontFamily={"Inter"} fontSize={"12px"} fontWeight={"400"} color={"#7468FF"}>
          AI is writing...
        </Typography>
      </Box>

      <CircularProgress
        size={12}
        sx={{
          "& span": {
            width: "12px",
            height: "12px",
            color: "rgb(116, 104, 255)",
          },
        }}
      />
    </Box>
  );
};
