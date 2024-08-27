import { Box, FormHelperText, TextField, Tooltip, Typography } from "@mui/material";
import React from "react";
import { FieldRenderProps } from "react-final-form";
import { ExclamationIcon } from "../../../../../common/Icon/ExclamationIcon";
import { QuestionMarkIcon } from "../../../../../common/Icon/QuestionMarkIcon";
import { CustomTooltip } from "../../Tooltip";
import { FieldType } from "../../../../store/reducers/MagicTemplateReducer";

interface MagicTemplateFieldProps extends FieldRenderProps<string> {
  label: string;
  placeholder?: string;
  required?: boolean;
  help_text?: string;
  type: FieldType;
}

const MagicTemplateField: React.FC<MagicTemplateFieldProps> = ({
  input,
  meta,
  label,
  placeholder,
  required,
  help_text,
  props,
}) => {
  const { type } = props;
  const { touched, error } = meta;
  const isError = touched && error;

  return (
    <Box margin={"5px 0 5px 0"}>
      <Box display={"flex"} justifyContent={"flex-start"}>
        <Typography fontSize={"12px"} fontFamily={"Inter"} fontWeight={"400"} marginBottom={"3px"} marginRight={"6px"}>
          {label}
        </Typography>
        {help_text && help_text.length > 0 ? (
          <CustomTooltip placement="top-start" title={help_text} enterDelay={500}>
            <Box>
              <QuestionMarkIcon />
            </Box>
          </CustomTooltip>
        ) : null}
      </Box>
      <TextField
        sx={{
          margin: "0 0 0 0",
          borderRadius: "6px",
          border: `1px solid ${isError ? "#DF0671" : "#7468FF"}`,
          background: "#FFFFFF",
          display: "flex",
          "& .MuiInputBase-root": {
            padding: 0,
          },
          "& .MuiInputBase-input": {
            padding: "8px",
            fontSize: "14px",
          },
        }}
        {...input}
        placeholder={placeholder}
        required={required}
        error={isError}
        {...(type === FieldType.TEXT && { multiline: true, rows: 3 })}
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

export default MagicTemplateField;
