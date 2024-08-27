import React from "react";
import { MuiColorInputColors, MuiColorInputFormat } from "mui-color-input";
import { Box, Typography } from "@mui/material";
import "../styles.css";
import { MuiColorInputStyled } from "../styles";

type ColorPickerProps = {
  onChange: (value: string) => void;
  selectedValue: string;
};

const format: MuiColorInputFormat = "hex";

export const ColorPicker: React.FC<ColorPickerProps> = ({ onChange, selectedValue }) => {
  const handleChange = (newValue: string, _colors: MuiColorInputColors) => {
    onChange(newValue);
  };

  return (
    <Box margin={"10px 0"} width={"100%"}>
      <Box width={"100%"} marginBottom={"3px"}>
        <Typography align="left" fontSize={"14px"} fontFamily={"DM Sans"} fontWeight={"400"} color={"#000"}>
          Font color
        </Typography>
      </Box>
      <Box width={"100%"}>
        <MuiColorInputStyled
          className="color-picker"
          value={selectedValue}
          onChange={handleChange}
          format={format}
          sx={{ fontSize: "14px !important" }}
          isAlphaHidden={true}
        />
      </Box>
    </Box>
  );
};
