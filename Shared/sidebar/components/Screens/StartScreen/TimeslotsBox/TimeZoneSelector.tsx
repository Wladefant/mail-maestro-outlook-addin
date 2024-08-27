import { Box, Divider, MenuItem, SelectChangeEvent, Typography } from "@mui/material";
import React from "react";
import { WINDOWS_TIMEZONE_MAP } from "../../../../utils/calendar";
import { formatTimezoneAbbreviation } from "../../../../utils/datetime";
import { StyledSelect } from "./styles";
import { isMobileApp } from "@platformSpecific/sidebar/utils/office";
import { CustomTooltip } from "../../../Common/Tooltip";

export type TimeZoneSelectorProps = {
  title: string;
  backgroundColor: string;
  value: string;
  onChange: (event: SelectChangeEvent<unknown>) => void;
  tooltipPrefix: string;
};

const renderSelectedOption = (selected: string, isMobile: boolean, tooltipPrefix: string) => {
  const timezone = formatTimezoneAbbreviation(selected);

  return !isMobile ? (
    <CustomTooltip placement="top-start" title={`${tooltipPrefix} ${selected}`} enterDelay={500}>
      <Typography
        fontSize={"11px"}
        fontFamily={"Inter"}
        overflow={"hidden"}
        whiteSpace={"nowrap"}
        textOverflow={"ellipsis"}
      >
        {timezone}
      </Typography>
    </CustomTooltip>
  ) : (
    <>
      <Typography
        fontSize={"11px"}
        fontFamily={"Inter"}
        overflow={"hidden"}
        whiteSpace={"nowrap"}
        textOverflow={"ellipsis"}
      >
        {timezone}
      </Typography>
    </>
  );
};

export const TimeZoneSelector: React.FC<TimeZoneSelectorProps> = ({
  title,
  backgroundColor,
  value,
  onChange,
  tooltipPrefix,
}) => {
  const isMobile = isMobileApp();

  return (
    <Box>
      <StyledSelect
        backgroundColor={backgroundColor}
        variant="standard"
        disableUnderline
        value={value}
        MenuProps={{
          PaperProps: {
            sx: {
              "&::-webkit-scrollbar": {
                borderRadius: "4px",
                width: "5px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#7468ff",
                borderRadius: "4px",
              },
              borderRadius: "10px",
              border: "1px solid #E8E7FF",
              "& .MuiMenu-list": {
                padding: "8px 16px !important",
                width: "192px !important",
                "& .MuiMenuItem-root": {
                  padding: "8px",
                  margin: "2px",
                  minHeight: "35px !important",
                  height: "35px !important",
                  "& .MuiTypography-root": {
                    fontSize: "14px",
                  },
                  borderRadius: "6px",
                  "&:hover": {
                    backgroundColor: "#E8E7FF",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "#E8E7FF",
                    color: "#7468FF",
                  },
                },
              },
            },
          },
        }}
        onChange={onChange}
        renderValue={(selected) => {
          return renderSelectedOption(selected as string, isMobile, tooltipPrefix);
        }}
      >
        <Box
          component="div"
          sx={{
            height: "40px",
          }}
        >
          <Typography
            fontSize={"16px"}
            fontWeight={"700"}
            color={"#000"}
            sx={{ marginBottom: "4px" }}
            fontFamily={"DM Sans"}
          >
            {title}
          </Typography>
          <Divider
            sx={{
              margin: "4px 0",
              background: "#E8E7FF",
              height: "1px",
              border: "none",
            }}
          />
        </Box>
        {Object.entries(WINDOWS_TIMEZONE_MAP)
          .sort((a, b) => a[1].localeCompare(b[1]))
          .map((option) => (
            <MenuItem key={option[1]} value={option[1]} sx={{ display: "flex" }}>
              <Typography overflow={"hidden"} textOverflow={"ellipsis"}>
                {option[1]}
              </Typography>
            </MenuItem>
          ))}
      </StyledSelect>
    </Box>
  );
};
