import { Box, Divider, Typography, Link } from "@mui/material";
import React from "react";
import { Field, Form, FormRenderProps } from "react-final-form";
import { useSelector } from "react-redux";
import {
  MagicTemplate,
  selectMagicTemplateResponse,
  setHasResponsesValidationErrors,
  setMagicTemplateResponse,
  setTemplateId,
} from "../../../../store/reducers/MagicTemplateReducer";
import { useAppDispatch } from "../../../../store/store";
import { removeDuplicatesByProperty } from "../../../../utils/common";
import MagicTemplateField from "./MagicTemplateField";

interface FormData {
  [fieldName: string]: string | number | Date;
}
interface MagicTemplateFormProps {
  magicTemplate: MagicTemplate;
}

const MagicTemplateForm: React.FC<MagicTemplateFormProps> = ({ magicTemplate }) => {
  const dispatch = useAppDispatch();
  const { title, description } = magicTemplate;
  const magicTemplateResponse = useSelector(selectMagicTemplateResponse(magicTemplate.id));

  const onClearMagicTemplateResponse = () => {
    dispatch(setMagicTemplateResponse({ magicTemplateId: magicTemplate.id, responses: {} }));
  };

  const renderFields = (formProps: FormRenderProps<FormData>) => {
    formProps.form.subscribe(
      (formState) => {
        dispatch(setHasResponsesValidationErrors(formProps.hasValidationErrors));
        dispatch(
          setMagicTemplateResponse({
            magicTemplateId: magicTemplate.id,
            responses: formState.values,
          }),
        );
      },
      { values: true },
    );
    return removeDuplicatesByProperty(magicTemplate.fields, "name").map((field) => {
      let value = "";
      if (magicTemplateResponse && Object.keys(magicTemplateResponse.responses).length > 0) {
        value = magicTemplateResponse.responses[field.name];
      }
      return (
        <div key={field.label}>
          <Field
            name={field.name}
            component={MagicTemplateField}
            label={field.label}
            help_text={field.help_text}
            placeholder={field.placeholder}
            required={field.required}
            value={value}
            validate={field.required ? valueRequired : undefined}
            props={{
              type: field.type,
            }}
          />
        </div>
      );
    });
  };

  const valueRequired = (value: string) => {
    return value ? undefined : "This field is required";
  };

  const onSubmit = (values: FormData) => {
    dispatch(
      setMagicTemplateResponse({
        magicTemplateId: magicTemplate.id,
        responses: values,
      }),
    );
  };

  return (
    <Box
      sx={{
        marginBottom: "10px",
      }}
      height={"calc(100% - 70px)"}
    >
      <Typography fontSize={"14px"} fontFamily={"Inter"} fontWeight={"400"}>
        {title}
      </Typography>
      <Typography fontSize={"10px"} fontFamily={"Inter"} fontWeight={"400"}>
        {description}
      </Typography>

      <Divider sx={{ margin: "10px 0 5px 0" }} />
      <Box position={"absolute"} right={"20px"}>
        <Link
          component="button"
          variant="body2"
          sx={{
            color: "#7468ff",
            fontSize: "12px",
            fontFamily: "DM Sans",
            fontWeight: "500",
            cursor: "pointer",
          }}
          onClick={onClearMagicTemplateResponse}
        >
          Clear
        </Link>
      </Box>
      <Box
        sx={{
          overflow: "auto",
          height: "100%",
          "&::-webkit-scrollbar": {
            borderRadius: "4px",
            width: "5px",
          },

          "&::-webkit-scrollbar-thumb": {
            background: "#7468ff",
            borderRadius: "4px",
          },
          paddingRight: "5px",
        }}
      >
        <Form initialValues={magicTemplateResponse?.responses} onSubmit={onSubmit}>
          {(formProps) => {
            return (
              <Box>
                <form onSubmit={formProps.handleSubmit}>{renderFields(formProps)}</form>
              </Box>
            );
          }}
        </Form>
      </Box>
    </Box>
  );
};

export default MagicTemplateForm;
