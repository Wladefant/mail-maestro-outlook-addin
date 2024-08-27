import CloseIcon from "@mui/icons-material/Close";
import { Box, Dialog, Divider, Typography } from "@mui/material";
import React, { useEffect } from "react";
import ReactGA from "react-ga4";
import { useSelector } from "react-redux";
import { ClockIcon } from "../../../../common/Icon/ClockIcon";
import { WandIcon } from "../../../../common/Icon/PartialTextEditing/WandIcon";
import { PinIcon } from "../../../../common/Icon/PinIcon";
import { selectUserDetails } from "../../../store/reducers/AuthReducer";
import {
  MagicTemplate,
  MagicTemplateResponse,
  selectMagicTemplateResponses,
  selectMagicTemplates,
  setMagicTemplateResponse,
  setTemplateId,
} from "../../../store/reducers/MagicTemplateReducer";
import {
  getPromptHistory,
  selectPromptHistory,
  updatePromptHistory as updatePromptHistoryAction,
} from "../../../store/reducers/promptHistoryReducer";
import { RootState, useAppDispatch } from "../../../store/store";
import { removeDuplicatesByProperty } from "../../../utils/common";
import { GA4_EVENTS } from "../../../utils/events";
import { getUserPrompts, updatePromptHistory as updatePromptHistoryLocalStorage } from "../../../utils/localStorage";
import { addDateTimeIfNeeded, formatDate, sortPrompts } from "../../../utils/prompt";
import { CustomTooltip } from "../Tooltip";
import { PinButton } from "../UI/PinButton";
import { Prompt } from "./types";
import { updateRecipientsName, updateUserDraft, updateUserDraftTemplateId } from "../../../store/reducers/DraftReducer";
import { uuid4 } from "../../../utils/uuid";

export type PromptHistoryProps = {
  open: boolean;
  onClose: () => void;
};

const getTooltipText = (
  prompt: Prompt,
  magicTemplates: MagicTemplate[],
  magicTemplateResponse?: MagicTemplateResponse,
) => {
  let tooltipText = "";

  if (prompt.magicTemplate) {
    const template = prompt.magicTemplate
      ? magicTemplates.find((magicTemplate) => magicTemplate.id === prompt.magicTemplate?.magicTemplateId)
      : undefined;

    if (template) {
      removeDuplicatesByProperty(template.fields, "name").map((field) => {
        tooltipText += `${field.label}: ${magicTemplateResponse?.responses[field.name]}\n`;
      });
    }
  } else {
    tooltipText = prompt.prompt;
  }
  return tooltipText;
};

export const PromptHistoryDialog: React.FC<PromptHistoryProps> = ({ open, onClose }) => {
  const dispatch = useAppDispatch();

  const promptHistory = useSelector(selectPromptHistory);
  const magicTemplates = useSelector(selectMagicTemplates);
  const magicTemplatesResponses = useSelector(selectMagicTemplateResponses);
  const hasPinnedPrompts = promptHistory.some((prompt: Prompt) => prompt.pinned);
  const user = useSelector(selectUserDetails);
  const draftId = useSelector((state: RootState) => state.draft.draftId);

  useEffect(() => {
    if (user) {
      dispatch(getPromptHistory(user?.email));
    }
  }, [user]);

  const togglePinPrompt = (prompt: Prompt) => {
    ReactGA.event(GA4_EVENTS.PROMPT_HISTORY_ELEMENT_PINNED, {
      draftID: draftId,
    });
    const updatedPrompt = {
      ...prompt,
      pinned: !prompt.pinned,
    };

    updatePromptHistoryLocalStorage(user?.email as string, updatedPrompt);

    dispatch(updatePromptHistoryAction(getUserPrompts(user?.email as string).map(addDateTimeIfNeeded)));
  };

  const onPromptClick = (prompt: Prompt) => {
    if (prompt.magicTemplate) {
      dispatch(setTemplateId(prompt.magicTemplate.magicTemplateId));
      dispatch(setMagicTemplateResponse(prompt.magicTemplate));
      dispatch(updateUserDraftTemplateId(prompt.magicTemplate.magicTemplateId));
    } else {
      const draftToStore = prompt?.htmlPrompt ?? prompt.prompt;
      dispatch(updateUserDraft(draftToStore));
      dispatch(updateRecipientsName(prompt.recipientsName ?? ""));
    }
    onClose();
    ReactGA.event(GA4_EVENTS.PROMPT_HISTORY_ELEMENT_CLICKED, {
      draftID: draftId,
    });
  };

  return (
    <Dialog
      open={open}
      hideBackdrop={true}
      onClose={onClose}
      sx={{
        "& .MuiDialog-container": {
          "& .MuiDialog-paper": {
            maxHeight: "100%",
            margin: 0,
            backgroundColor: "white",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          },
        },
      }}
    >
      <Box width={"auto"} m={"30px 20px 10px 20px"}>
        <Box height={"19px"} display={"flex"} marginBottom={"15px"} justifyContent={"space-between"}>
          <Box display={"flex"} alignItems={"center"}>
            <ClockIcon sx={{ marginRight: "5px", color: "#7468FF" }} width="17px" height="17px" />{" "}
            <Typography>Prompt history</Typography>
          </Box>

          <CloseIcon
            sx={{
              color: "#7468FF",
              fontSize: "16px",
              cursor: "pointer",
            }}
            onClick={onClose}
          />
        </Box>
        <Divider />
        <Box>
          {!hasPinnedPrompts && (
            <Box
              sx={{
                backgroundColor: "#F6F8FC",
                fontFamily: "Inter",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: 14,
                textAlign: "center",
                color: "#888888",
                alignItems: "center",
              }}
              display={"flex"}
              flexDirection={"column"}
              margin={"10px 0 10px 0"}
              padding={"10px"}
            >
              <PinIcon height={20} width={20} />
              <p
                style={{
                  marginTop: 6,
                  marginBottom: 0,
                }}
              >
                Pin your favorite prompts
              </p>
            </Box>
          )}
          {sortPrompts([...promptHistory], "desc")
            .filter((item: Prompt) => item.prompt || item.magicTemplate?.magicTemplateId)
            .map(addDateTimeIfNeeded)
            .map(formatDate)
            .map((item: Prompt, index: number) => {
              const template = item.magicTemplate
                ? magicTemplates.find((magicTemplate) => magicTemplate.id === item.magicTemplate?.magicTemplateId)
                : undefined;
              const magicTemplateResponse = magicTemplatesResponses.find(
                (magicTemplateResponse) => magicTemplateResponse.magicTemplateId === template?.id,
              );

              const tooltipText = getTooltipText(item, magicTemplates, magicTemplateResponse);
              return item.prompt || template ? (
                <CustomTooltip placement="bottom-start" title={tooltipText} enterDelay={500} key={uuid4()}>
                  <Box
                    onClick={() => onPromptClick(item)}
                    sx={{
                      cursor: "pointer",
                      backgroundColor: item.pinned ? "#ECEBFF" : "#F6F8FC",
                      border: "1px solid #ECEBFF",
                      borderRadius: "4px",
                      justifyContent: "space-between",
                    }}
                    key={uuid4()}
                    display={"flex"}
                    flexDirection={"row"}
                    margin={"10px 0 10px 0"}
                    padding={"10px"}
                  >
                    <Box display={"flex"} flexDirection={"column"} flexGrow={1}>
                      <Box display={"flex"} width={"100%"} justifyContent={"space-between"}>
                        <Box fontFamily={"Inter"} fontSize={"10px"} fontWeight={"400"} color={"#BFC4CD"}>
                          {item.formattedDate} @ {item.time}
                        </Box>
                      </Box>
                      <Box
                        marginTop={"5px"}
                        fontSize={"13px"}
                        overflow={"hidden"}
                        whiteSpace={"nowrap"}
                        textOverflow={"ellipsis"}
                        fontFamily={"Inter"}
                        fontWeight={"400"}
                        width={"200px"}
                      >
                        {template ? template.title : item.prompt}
                      </Box>
                      {!!template && (
                        <Box display={"flex"} flexDirection={"row"} alignItems={"center"} marginTop={"5px"}>
                          <WandIcon
                            sx={{
                              color: "#7468FF",
                              height: "15px",
                              marginRight: "5px",
                            }}
                          />
                          <Typography
                            sx={{
                              fontFamily: "Inter",
                              fontSize: "12px",
                              fontWeight: 400,
                              color: "#888888",
                              marginTop: "5px",
                            }}
                          >
                            Magic template
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <Box>
                      <PinButton
                        pinned={item.pinned}
                        clickHandler={(e: any) => {
                          togglePinPrompt(item);
                          e.stopPropagation();
                        }}
                      />
                    </Box>
                  </Box>
                </CustomTooltip>
              ) : null;
            })}
        </Box>
      </Box>
    </Dialog>
  );
};
