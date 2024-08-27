import { Box, FormHelperText, TextField, Typography } from "@mui/material";
import React from "react";
import { FieldRenderProps } from "react-final-form";
import { ExclamationIcon } from "../../../../common/Icon/ExclamationIcon";

interface TextShortcutFormFieldProps extends FieldRenderProps<string> {
  label: string;
  placeholder?: string;
  required?: boolean;
  isShortcutField?: boolean;
}

const TextShortcutFormField: React.FC<TextShortcutFormFieldProps> = ({
  input,
  meta,
  label,
  placeholder,
  required,
  isShortcutField,
}) => {
  const { touched, error } = meta;
  const isError = touched && error;

  return (
    <Box width={"100%"} margin={"15px 0"}>
      <Typography align="left" fontSize={"12px"} fontFamily={"Inter"} fontWeight={"400"} marginBottom={"5px"}>
        {label}
      </Typography>
      {isShortcutField && (
        <Typography
          align="left"
          fontSize={"14px"}
          fontFamily={"Inter"}
          fontWeight={"700"}
          color="#7468FF"
          position={"absolute"}
          left={"23px"}
          top={"79px"}
          zIndex={"1"}
        >
          !
        </Typography>
      )}
      <TextField
        fullWidth
        variant="outlined"
        sx={{
          border: "none",
          position: "relative",
          fontSize: "12px",
          "& .MuiInputBase-root": {
            border: isShortcutField ? "none" : "1px solid #E8E7FF",
            padding: 0,
          },
          "& input": {
            padding: "8px 9px 8px 12px",
            fontSize: "14px",
            border: "1px solid #E8E7FF",
            borderRadius: "6px",
            backgroundColor: "#FFFFFF",
            fontFamily: "Inter",
            fontWeight: "400",
            color: "#131313",
            "&::placeholder": {
              color: "#999999",
              fontSize: "14px",
              opacity: 1,
              lineHeight: "16px",
            },
          },
          "& textarea": {
            padding: "8px",
            fontSize: "14px",
            borderRadius: "6px",
            backgroundColor: "#FFFFFF",
            fontFamily: "Inter",
            fontWeight: "400",
            color: "#131313",
            "&::placeholder": {
              color: "#999999",
              fontSize: "14px",
              lineHeight: "16px",
              opacity: 1,
            },
          },
          "& fieldset": { border: "none" },
        }}
        {...input}
        {...(!isShortcutField && {
          multiline: true,
          rows: 4,
        })}
        placeholder={placeholder}
        required={required}
        error={isError}
      />
      {isError && (
        <FormHelperText
          sx={{
            fontFamily: "Inter",
            fontSize: "10px",
            fontWeight: "700",
            color: "#DF0671",
          }}
          error
        >
          <ExclamationIcon /> {error}
        </FormHelperText>
      )}
    </Box>
  );
};

export default TextShortcutFormField;
