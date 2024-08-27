import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, Typography } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import { SelectChangeEvent } from "@mui/material/Select";
import React from "react";
import { StyledSelect } from "../styles";

export type FontPreferenceSelectProps = {
  label: string;
  onChange: (value: string) => void;
  selectedValue: string;
  valuesList: string[];
  renderFunction?: (value: unknown) => React.ReactNode;
};

export const FontPreferenceSelect: React.FC<FontPreferenceSelectProps> = ({
  label,
  selectedValue,
  valuesList,
  onChange,
  renderFunction,
}) => {
  const renderMenuItem = (option: string) => {
    if (renderFunction) {
      return renderFunction(option);
    }
    return (
      <MenuItem
        key={option}
        value={option}
        sx={{
          padding: "0px",
          fontSize: "14px",
          fontFamily: "Inter",
        }}
      >
        <Typography fontSize={"14px"} overflow={"hidden"} textOverflow={"ellipsis"}>
          {option}
        </Typography>
      </MenuItem>
    );
  };

  return (
    <Box margin={"10px 0"} width={"100%"}>
      <Box width={"100%"} marginBottom={"3px"}>
        <Typography align="left" fontSize={"14px"} fontFamily={"DM Sans"} fontWeight={"400"} color={"#000"}>
          {label}
        </Typography>
      </Box>
      <Box width={"100%"}>
        <StyledSelect
          IconComponent={ExpandMoreIcon}
          value={selectedValue}
          variant="standard"
          disableUnderline
          defaultValue={selectedValue}
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
                      padding: "3px",
                    },
                    borderRadius: "6px",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                      color: "#7468FF",
                      textDecoration: "underline",
                    },
                  },
                },
              },
            },
          }}
          {...(renderFunction && { renderValue: renderFunction })}
          onChange={(event: SelectChangeEvent<unknown>) => {
            onChange(event.target.value as string);
          }}
        >
          {valuesList.map((option) => renderMenuItem(option))}
        </StyledSelect>
      </Box>
    </Box>
  );
};
