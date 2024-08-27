import { faker } from "@faker-js/faker";
import { Skeleton, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { useSelector } from "react-redux";
import { RefreshIcon } from "../../../../../common/Icon/RapidReply/RefreshIcon";
import { WandIconV3 } from "../../../../../common/Icon/RapidReply/WandIconV3";
import { selectItemId } from "../../../../store/reducers/AppReducer";
import { TimeSlots, TimeslotResponse } from "../../../../store/reducers/CalendarReducer";
import {
  getRapidReplyMetadataByItemId,
  selectIsLoading,
  selectRapidReplyByItemIdAndRequestId,
} from "../../../../store/reducers/RapidReplyReducer";
import { RootState } from "../../../../store/store";
import { CustomTooltip } from "../../../Common/Tooltip";
import { OptionBoxContainer } from "../AttachmentsBox/styles";
import { isMobileApp } from "@platformSpecific/sidebar/utils/office";

export type RapidReplyUIProps = {
  notAccessible: boolean;
  handleRapidReplyClick?: (rapidReply: string) => void;
  refetchRapidReply?: () => void;
};

const MOCK_RAPID_REPLIES = faker.lorem.lines({ min: 2, max: 5 }).split("\n");

export const RapidReplyUI: React.FC<RapidReplyUIProps> = ({
  notAccessible,
  handleRapidReplyClick,
  refetchRapidReply,
}) => {
  const isLoading = useSelector(selectIsLoading);
  const itemId = useSelector(selectItemId);
  const currentRapidReplyRequestId = useSelector(getRapidReplyMetadataByItemId(itemId as string))?.requestId;

  const { timeslotResponses } = useSelector((state: RootState) => state.calendar);
  const timeslotResponse: TimeslotResponse | undefined = timeslotResponses.find(
    (timeslot: any) => timeslot.item_id === itemId,
  );
  const timeslots: TimeSlots[] = timeslotResponse?.timeslots || [];

  const currentRapidReply = useSelector(
    selectRapidReplyByItemIdAndRequestId(itemId as string, currentRapidReplyRequestId as string),
  );

  const isMobile = isMobileApp();

  if (timeslots.length > 0) {
    return null;
  }

  const getRapidReplies = () => {
    if (notAccessible) {
      return MOCK_RAPID_REPLIES;
    } else {
      return currentRapidReply?.rapidReplyRequest?.content ?? [];
    }
  };

  return (
    <OptionBoxContainer sx={{ padding: "5px 0" }}>
      <Box display={"flex"} padding={"10px"} flexDirection={"row"} sx={{ width: "100%" }} alignItems={"center"}>
        <Box display={"flex"} padding={"0 10px"} width={"100%"} alignItems={"center"}>
          <Box
            sx={{
              width: "25px",
              height: "25px",
              backgroundColor: "rgba(232, 231, 255, 1)",
              borderRadius: "25px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <WandIconV3 />
          </Box>
          <Box padding={"0 10px"} width={"65%"}>
            <Typography align="left" fontSize={"14px"} fontFamily={"Inter"} fontWeight={"400"}>
              Rapid reply
            </Typography>
          </Box>
          <Box display={"flex"} justifyContent={"flex-end"} alignItems={"center"} width={"100%"}>
            <Box
              sx={{
                backgroundColor: notAccessible ? "#dbdbdb" : "#ECEBFF",
                borderRadius: "3px",
                border: "1px solid #7468FF",
                display: "flex",
                ...(!notAccessible && { "&:hover": { cursor: "pointer" } }),
              }}
              onClick={() => !isLoading && refetchRapidReply && refetchRapidReply()}
            >
              <RefreshIcon />
            </Box>
          </Box>
        </Box>
      </Box>
      <Box width={"100%"}>
        {currentRapidReply?.rapidReplyRequest?.errors?.map((error: string, index: number) => (
          <Box
            key={index}
            sx={{
              borderRadius: "6px",
              background: "#F6F8FC",
              height: "33px",
              margin: "5px 10px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography
              margin={"0 10px"}
              fontFamily={"Inter"}
              fontWeight={"400"}
              fontSize={"14px"}
              overflow={"hidden"}
              whiteSpace={"nowrap"}
              textOverflow={"ellipsis"}
            >
              {error}
            </Typography>
          </Box>
        ))}
        {(getRapidReplies() ?? []).map((rapidReply: string, index: number) => (
          <Box
            onClick={() => handleRapidReplyClick && handleRapidReplyClick(rapidReply)}
            key={index}
            sx={{
              ...(notAccessible && { filter: "blur(5px)" }),
              borderRadius: "6px",
              background: "#F6F8FC",
              height: "33px",
              margin: "5px 10px",
              display: "flex",
              alignItems: "center",
              ...(!notAccessible && { "&:hover": { cursor: "pointer", background: "#E8E7FF" } }),
            }}
          >
            {isMobile ? (
              <Typography
                margin={"0 10px"}
                fontFamily={"Inter"}
                fontWeight={"400"}
                fontSize={"14px"}
                overflow={"hidden"}
                whiteSpace={"nowrap"}
                textOverflow={"ellipsis"}
                sx={{ ...(notAccessible && { userSelect: "none" }) }}
              >
                {rapidReply}
              </Typography>
            ) : (
              <CustomTooltip
                placement="top-start"
                title={!notAccessible ? rapidReply : ""}
                enterDelay={500}
                key={`tooltip-${index}`}
              >
                <Typography
                  sx={{ ...(notAccessible && { userSelect: "none" }) }}
                  margin={"0 10px"}
                  fontFamily={"Inter"}
                  fontWeight={"400"}
                  fontSize={"14px"}
                  overflow={"hidden"}
                  whiteSpace={"nowrap"}
                  textOverflow={"ellipsis"}
                >
                  {rapidReply}
                </Typography>
              </CustomTooltip>
            )}
          </Box>
        ))}
        {!notAccessible && (!currentRapidReply || (isLoading && !currentRapidReply?.finished)) && (
          <Box sx={{ height: "45px", padding: "0 15px" }}>
            <Skeleton
              sx={{
                height: "50px",
                margin: "-4px",
                background: "linear-gradient(90deg, #E8E7FF 0%, #FAFAFF 72.4%, #E8E7FF 100%)",
              }}
            />
          </Box>
        )}
      </Box>
    </OptionBoxContainer>
  );
};
