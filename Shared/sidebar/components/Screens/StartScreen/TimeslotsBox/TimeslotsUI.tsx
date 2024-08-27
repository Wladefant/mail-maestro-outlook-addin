import { SelectChangeEvent, Skeleton, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { isMobileApp } from "@platformSpecific/sidebar/utils/office";
import moment from "moment";
import React from "react";
import { useSelector } from "react-redux";
import { CalendarDisabledIcon } from "../../../../../common/Icon/CalendarDisabledIcon";
import { CalendarIcon } from "../../../../../common/Icon/CalendarIcon";
import { ChevronIcon } from "../../../../../common/Icon/ChevronIcon";
import { EllipseIcon } from "../../../../../common/Icon/EllipseIcon";
import { RefreshIcon } from "../../../../../common/Icon/RapidReply/RefreshIcon";
import { RightArrowIcon } from "../../../../../common/Icon/Timeslots/RightArrowIcon";
import { WarningIcon } from "../../../../../common/Icon/WarningIcon";
import { Availability, TimeSlots, TimeslotResponse } from "../../../../store/reducers/CalendarReducer";
import { RootState } from "../../../../store/store";
import { formatDateTimeToDisplayOnTimezone } from "../../../../utils/timezone";
import { PermissionHOC } from "../../../Common/PermissionHOC";
import { CustomTooltip } from "../../../Common/Tooltip";
import { OptionBoxContainer } from "../AttachmentsBox/styles";
import { TimeZoneSelector } from "./TimeZoneSelector";

export type TimeslotsUIProps = {
  notAccessible: boolean;
  senderTimezone: string | null;
  handleSlotClick: (timeslot: TimeSlots, available: boolean | null) => void;
  refetchTimeslots: () => void;
  onChangeSenderTimezone: (event: SelectChangeEvent<unknown>) => void;
  onChangeUserTimezone: (event: SelectChangeEvent<unknown>) => void;
};

export const TimeslotsUI: React.FC<TimeslotsUIProps> = ({
  notAccessible,
  senderTimezone,
  handleSlotClick,
  refetchTimeslots,
  onChangeSenderTimezone,
  onChangeUserTimezone,
}) => {
  const { isLoading, timeslotResponses, availabilityResponses, userTimezone } = useSelector(
    (state: RootState) => state.calendar,
  );
  const itemId = useSelector((state: RootState) => state.app.itemId) ?? "";
  const isMobile = isMobileApp();

  const timeslotResponse: TimeslotResponse | undefined = timeslotResponses.find(
    (timeslot: any) => timeslot.item_id === itemId,
  );

  const availabilities: Availability = availabilityResponses[itemId] || {};
  // Show warning if we can't check availability for all timeslots
  const calendarWarning =
    Object.values(availabilities).length > 0 &&
    Object.values(availabilities).every((value) => value!.available === null);

  const timeslotsSorted = [...(timeslotResponse?.timeslots || [])]?.sort((a, b) =>
    a.start < b.start ? -1 : a.start > b.start ? 1 : 0,
  );

  if (!timeslotResponse?.timeslotsDetected) {
    return null;
  }

  if (notAccessible) {
    return null;
  }

  return (
    <OptionBoxContainer onClick={() => {}}>
      <Box display={"flex"} padding={"10px 10px 5px 10px"} flexDirection={"row"} sx={{ width: "100%" }}>
        <Box width={"50%"} paddingLeft={"10px"} display={"flex"} alignItems={"center"} justifyContent={"flex-start"}>
          <CalendarIcon />
          <Typography
            overflow={"hidden"}
            whiteSpace={"nowrap"}
            textOverflow={"ellipsis"}
            align="left"
            fontSize={"14px"}
            fontFamily={"Inter"}
            fontWeight={"400"}
            marginLeft={"7px"}
            marginRight={"3px"}
          >
            Meeting request
          </Typography>
        </Box>
        <Box
          width={"50%"}
          sx={{
            alignItems: "center",
            paddingRight: "10px",
          }}
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"flex-end"}
        >
          <TimeZoneSelector
            title="Sender's Timezone"
            backgroundColor="#F5F5F5"
            value={senderTimezone ?? ""}
            onChange={onChangeSenderTimezone}
            tooltipPrefix="Sender's timezone:"
          />
          <RightArrowIcon
            sx={{
              marginLeft: "3px",
              marginRight: "3px",
            }}
          />
          <TimeZoneSelector
            title="Your Timezone"
            backgroundColor="#EEECFF"
            value={userTimezone ?? ""}
            onChange={onChangeUserTimezone}
            tooltipPrefix="Your timezone:"
          />
          <Box
            sx={{
              display: "flex",
              marginLeft: "8px",
              "&:hover": {
                cursor: "pointer",
              },
            }}
            onClick={() => refetchTimeslots()}
          >
            <RefreshIcon />
          </Box>
        </Box>
      </Box>
      <Box padding={"10px"} flexDirection={"row"} sx={{ width: "100%", paddingTop: 0, paddingBottom: "5px" }}>
        {timeslotsSorted.map((timeslot: any) => {
          const available = !isMobile ? availabilities[timeslot.start]?.available : null;
          const conflict = availabilities[timeslot.start]?.conflict;
          moment.locale();
          const readableDate = formatDateTimeToDisplayOnTimezone(timeslot.start, userTimezone as string);
          return (
            <Box
              onClick={() => handleSlotClick(timeslot, available)}
              key={timeslot.start}
              borderRadius={"6px"}
              display={"flex"}
              flexDirection={"row"}
              alignItems={"center"}
              gap={"10px"}
              margin={"5px 10px 5px 10px"}
              padding={"8px 10px 8px 10px"}
              sx={{
                backgroundColor: available === true ? "#E7FFED" : available === false ? "#FFEFF2" : "#ECECEC",
                color: "#131313",
                fontFamily: "Inter",
                fontSize: "14px",
                fontStyle: "normal",
                fontWeight: 400,
                cursor: available ? "pointer" : "default",
              }}
            >
              {readableDate}
              {available && <ChevronIcon sx={{ marginLeft: "auto" }} />}
              {available === false && (
                <CustomTooltip
                  title={conflict ? `Conflict with "${conflict}"` : "You have already have a meeting at this time."}
                  enterDelay={500}
                  placement="top-start"
                  key={`tooltip-${timeslot.start}`}
                >
                  <Box sx={{ marginLeft: "auto", cursor: "pointer" }}>
                    <WarningIcon />
                  </Box>
                </CustomTooltip>
              )}
              {available === undefined && (
                <img src={"../../../../assets/icon-loading.gif"} style={{ marginLeft: "auto", height: "16px" }} />
              )}
            </Box>
          );
        })}
        {isLoading && (
          <Skeleton
            sx={{
              height: "50px",
              margin: "-5px 10px 5px 10px",
              background: "linear-gradient(90deg, #E8E7FF 0%, #FAFAFF 72.4%, #E8E7FF 100%)",
            }}
          />
        )}
        {(calendarWarning || isMobile) && (
          <Box
            borderRadius={"6px"}
            display={"flex"}
            flexDirection={"row"}
            alignItems={"center"}
            gap={"10px"}
            margin={"5px 10px 5px 10px"}
            padding={"8px 10px 8px 10px"}
            sx={{
              backgroundColor: "#F6F8FC",
              color: "#131313",
              fontFamily: "Inter",
              fontSize: "14px",
              fontStyle: "normal",
              fontWeight: 400,
            }}
          >
            <CalendarDisabledIcon sx={{ width: "45px" }} />{" "}
            {isMobile
              ? "We can't access your calendar on mobile devices"
              : "Connections to certain calendars are not supported"}
          </Box>
        )}
        {timeslotResponse?.finished && timeslotsSorted.length === 0 && (
          <Box
            borderRadius={"6px"}
            display={"flex"}
            flexDirection={"row"}
            alignItems={"center"}
            gap={"10px"}
            margin={"5px 10px 5px 10px"}
            padding={"8px 10px 8px 10px"}
            sx={{
              backgroundColor: "#FFEFF2",

              color: "#131313",

              fontFamily: "Inter",
              fontSize: "14px",
              fontStyle: "normal",
              fontWeight: 400,
            }}
          >
            <EllipseIcon
              sx={{
                color: "#F21B3F",
              }}
            />{" "}
            Unable to list your timeslots
          </Box>
        )}
      </Box>
    </OptionBoxContainer>
  );
};
