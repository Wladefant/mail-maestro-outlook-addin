import { Box, Dialog, Typography } from "@mui/material";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import React from "react";
import { Field, Form } from "react-final-form";
import { useDispatch, useSelector } from "react-redux";
import { addTextShortcut, editTextShortcut } from "../../../apis/textShortcuts";
import { selectToken } from "../../../store/reducers/AuthReducer";
import {
  TextShortcut,
  setShowDialog,
  editTextShortcut as editTextShorcutOnRedux,
  addTextShortcut as addTextShortcutOnRedux,
  setIsLoading,
  selectIsLoading,
} from "../../../store/reducers/TextShortcutsReducer";
import { RootState } from "../../../store/store";
import PrimaryButton from "../../Common/UI/PrimaryButton";
import SecondaryButton from "../../Common/UI/SecondaryButton";
import TextShortcutFormField from "./TextShortcutFormField";

export type TextShortcutDialogProps = {
  open: boolean;
  initialValues?: TextShortcut | null | undefined;
  onClose: () => void;
};

export interface TextShortcutFormValues {
  shortcut: string;
  snippet: string;
}

const validateShortcut = (value: string) => {
  if (!value) {
    return "Shortcut cannot be empty";
  }
  if (value.endsWith(" ")) {
    return "Shortcut cannot end with a blank space";
  }
  // Aplhanumeric, underscores and hyphens
  const regex = /^[a-zA-Z0-9_-]+$/;
  if (!regex.test(value)) {
    return "Shortcut can only contain letters, numbers, underscores and hyphens";
  }
  return false;
};

const validateSnippet = (value: string) => {
  if (!value) {
    return "Snippet cannot be empty";
  }
  return false;
};

export const TextShortcutDialog: React.FC<TextShortcutDialogProps> = ({ open, initialValues, onClose }) => {
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  const authToken = useSelector(selectToken);
  const isLoading = useSelector(selectIsLoading);

  const closeDialog = () => {
    dispatch(setShowDialog(false));
    onClose();
  };

  const onSubmit = async (values: TextShortcutFormValues) => {
    const { shortcut, snippet } = values;
    const shortcutTag = `!${shortcut}`;
    const textShortcut = {
      shortcut: shortcutTag,
      snippet,
    };
    dispatch(setIsLoading(true));
    if (initialValues) {
      await editTextShortcut(authToken as string, initialValues.id, textShortcut);
      dispatch(
        editTextShorcutOnRedux({
          id: initialValues.id,
          tag: textShortcut.shortcut,
          snippet: textShortcut.snippet,
        }),
      );
    } else {
      const newTextShortcutResponse = await addTextShortcut(authToken as string, values);
      const newTextShortcut = newTextShortcutResponse.payload as TextShortcut;
      dispatch(addTextShortcutOnRedux(newTextShortcut));
    }
    dispatch(setIsLoading(false));
    closeDialog();
  };

  return (
    <Dialog
      open={open}
      sx={{
        "& .MuiModal-backdrop": {
          backgroundColor: "transparent",
        },
        "& .MuiDialog-container": {
          display: "flex",
          flexWrap: "wrap",
          alignContent: "flex-start",
          backgroundColor: "transparent",
          backdropFilter: "blur(20px)",
          "& .MuiDialog-paper": {
            width: "100%",
            borderRadius: "10px",
            margin: "35px 15px",
          },
        },
      }}
    >
      <Box
        padding={"15px"}
        textAlign={"left"}
        display={"flex"}
        flexDirection={"column"}
        alignItems={"flex-start"}
        justifyContent={"flex-start"}
      >
        <Box>
          <Typography align="left" fontSize={"12px"} fontFamily={"Inter"} fontWeight={"700"}>
            Add new shortcut and snippet
          </Typography>
        </Box>

        <Form
          onSubmit={onSubmit}
          initialValues={{
            shortcut: initialValues?.tag.replace("!", ""),
            snippet: initialValues?.snippet,
          }}
          render={({ handleSubmit, form, values, errors }) => {
            const isValid = values.shortcut && values.snippet && !isLoading && !errors?.shortcut && !errors?.snippet;
            return (
              <form style={{ width: "100%" }} onSubmit={handleSubmit}>
                <Box width={"100%"} margin={"15px 0"}>
                  <Field
                    name="shortcut"
                    label="Shortcut"
                    component={TextShortcutFormField}
                    placeholder="Shortcut E.g., !address"
                    required
                    isShortcutField
                    validate={validateShortcut}
                  />
                </Box>

                <Box width={"100%"} margin={"15px 0"}>
                  <Field
                    name="snippet"
                    label="Snippet"
                    component={TextShortcutFormField}
                    required
                    placeholder="Text that you want to replace the shortcut with e.g., 3098 Alfonzo Island. Arizona 356314, United States"
                    validate={validateSnippet}
                  />
                </Box>
                <Box marginTop={"15px"} display={"flex"} justifyContent={"space-between"} width={"100%"}>
                  <PrimaryButton
                    type="submit"
                    disabled={!isValid}
                    sx={{
                      width: "48%",
                      padding: 0,
                    }}
                  >
                    Save
                  </PrimaryButton>
                  <SecondaryButton
                    sx={{
                      width: "45%",
                      padding: "0",
                      border: "1px solid #737373",
                      color: "#737373",
                    }}
                    onClick={() => {
                      form.reset();
                      closeDialog();
                    }}
                  >
                    Cancel
                  </SecondaryButton>
                </Box>
              </form>
            );
          }}
        />
      </Box>
    </Dialog>
  );
};
