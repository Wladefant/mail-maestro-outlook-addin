import { Box, Divider, Typography, Popover, List, ListItem, ListItemText } from "@mui/material";
import { isMobileApp } from "@platformSpecific/sidebar/utils/office";
import { isNativeApp, openTaskPaneByOption } from "@platformSpecific/sidebar/utils/officeMisc";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import React, { useCallback } from "react";
import ReactGA from "react-ga4";
import { useDispatch, useSelector } from "react-redux";
import { WandIconV2 } from "../../../../common/Icon/WandIconV2";
import { createDraftAction } from "../../../store/actions/draftActions";
import { DraftAction, Screen, selectIsReply, setScreen } from "../../../store/reducers/AppReducer";
import { selectToken, selectUserDetails } from "../../../store/reducers/AuthReducer";
import { updateUserDraftTemplateId } from "../../../store/reducers/DraftReducer";
import { MagicTemplate, selectMagicTemplates, setTemplateId } from "../../../store/reducers/MagicTemplateReducer";
import { RootState } from "../../../store/store";
import { GA4_EVENTS } from "../../../utils/events";
import Header from "../../Common/Header";
import { CustomTooltip } from "../../Common/Tooltip";
import PrimaryButton from "../../Common/UI/PrimaryButton";
import { ThreeDotsIcon } from "../../../../common/Icon/ThreeDotsIcon";
import { fetchMagicTemplates } from "../../../store/actions/magicTemplateActions";
import { TemplateOptionsPopOver } from "./components/TemplateOptionsPopOver";
import { DeleteDialog } from "./components/DeleteDialog";
import { deleteMagicTemplate } from "../../../../dialog/components/Screens/MagicTemplateBuilder/api";
import { WandIcon } from "../../../../common/Icon/MagicTemplatesBuilder/WandIcon";

const MagicTemplatesScreen = () => {
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const user = useSelector(selectUserDetails);
  const draftId = useSelector((state: RootState) => state.draft.draftId);
  const userTemplates = useSelector(selectMagicTemplates);
  const isNative = isNativeApp();
  const isReply = useSelector(selectIsReply);
  const token = useSelector(selectToken);
  const isMobile = isMobileApp();

  const [popOverAnchor, setPopOverAnchor] = React.useState<HTMLElement | null>(null);
  const [currentTemplateId, setCurrentTemplateId] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const popOverOpen = Boolean(popOverAnchor);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>, templateId: string) => {
    setPopOverAnchor(event.currentTarget);
    setCurrentTemplateId(templateId);
  };

  const handlePopoverClose = () => {
    setPopOverAnchor(null);
    setCurrentTemplateId(null);
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    handlePopoverClose();
  };

  const handleEditTemplate = () => {
    const magicTemplateToEdit = userTemplates.find((template) => template.id === currentTemplateId);
    openTaskPaneByOption(
      "magicTemplateBuilder",
      token as string,
      { templateToEdit: magicTemplateToEdit as MagicTemplate },
      { height: 600, width: 900 },
      dispatch,
      async () => {
        await dispatch(fetchMagicTemplates()).unwrap();
      },
    );
    handlePopoverClose();
  };

  const handleDeleteTemplate = async () => {
    await deleteMagicTemplate(token as string, currentTemplateId as string);
    await dispatch(fetchMagicTemplates()).unwrap();
    handleDialogClose();
  };

  const handleCreateTemplate = () => {
    openTaskPaneByOption(
      "magicTemplateBuilder",
      token as string,
      {},
      { height: 600, width: 900 },
      dispatch,
      async () => {
        await dispatch(fetchMagicTemplates()).unwrap();
      },
    );
  };

  const onMagicTemplateClick = useCallback(
    async (item: MagicTemplate) => {
      dispatch(setScreen(Screen.DraftInput));
      dispatch(setTemplateId(item.id));
      await dispatch(createDraftAction(isReply ? DraftAction.REPLY : DraftAction.COMPOSE));
      ReactGA.event(GA4_EVENTS.MAGIC_TEMPLATE_ELEMENT_CLICKED, {
        draftID: draftId,
        userID: user?.ganalytics_id,
      });
      dispatch(updateUserDraftTemplateId(item.id));
    },
    [dispatch, draftId, user],
  );

  const onGoBack = () => {
    dispatch(setScreen(Screen.Start));
  };

  return (
    <>
      <Box
        sx={{
          background: "linear-gradient(180deg, #FFF 0%, #ECEBFF 100%)",
        }}
        height={"100vh"}
      >
        <Header isNative={isNative} onGoBack={onGoBack} />
        <TemplateOptionsPopOver
          open={popOverOpen}
          anchorEl={popOverAnchor}
          onClose={handlePopoverClose}
          handleDelete={handleDialogOpen}
          handleEditTemplate={handleEditTemplate}
        />
        <DeleteDialog open={dialogOpen} onClose={handleDialogClose} onDelete={handleDeleteTemplate} />
        <Box
          width={"auto"}
          m={"30px 15px 10px 15px"}
          height={`calc(100% - ${isMobile ? "70" : "120"}px)`}
          overflow={"auto"}
          sx={{
            "&::-webkit-scrollbar": {
              borderRadius: "4px",
              width: "5px",
            },

            "&::-webkit-scrollbar-thumb": {
              background: "#7468ff",
              borderRadius: "4px",
            },
          }}
        >
          <Box height={"19px"} display={"flex"} marginBottom={"15px"} justifyContent={"space-between"}>
            <Box display={"flex"} alignItems={"center"}>
              <WandIconV2 sx={{ marginRight: "5px", color: "#7468FF" }} width="17px" height="17px" />{" "}
              <Typography fontFamily={"DM Sans"} fontSize={"16px"}>
                Magic template
              </Typography>
            </Box>
          </Box>
          <Divider />
          <Box>
            {[...userTemplates].map((item: MagicTemplate, index: number) => {
              return (
                <Box
                  sx={{
                    cursor: "pointer",
                    backgroundColor: "#FFF",
                    ":hover": {
                      bgcolor: "#ECEBFF", // background color on hover
                      transition: "background-color 0.5s ease",
                    },
                    border: "1px solid #E2E2E2",
                    borderRadius: "8px",
                    justifyContent: "space-between",
                  }}
                  key={index}
                  display={"flex"}
                  flexDirection={"row"}
                  margin={"8px 0"}
                  padding={"8px"}
                >
                  {isMobile ? (
                    <Box
                      display={"flex"}
                      flexDirection={"row"}
                      flexGrow={1}
                      alignItems={"center"}
                      justifyContent={"space-between"}
                    >
                      <Box
                        fontSize={"14px"}
                        overflow={"hidden"}
                        whiteSpace={"nowrap"}
                        textOverflow={"ellipsis"}
                        fontFamily={"DM Sans"}
                        width={"200px"}
                        onClick={() => onMagicTemplateClick(item)}
                      >
                        {item.title}
                      </Box>
                      <Box display={"flex"} justifyContent={"center"} justifyItems={"flex-end"}>
                        {!item.static && (
                          <Box display={"flex"} alignItems={"center"}>
                            <WandIcon />
                          </Box>
                        )}
                        {item.ownership === "private" && !isMobile && (
                          <Box display={"flex"} onClick={(e) => handlePopoverOpen(e, item.id)}>
                            <ThreeDotsIcon />
                          </Box>
                        )}
                      </Box>
                    </Box>
                  ) : (
                    <CustomTooltip
                      placement="top-start"
                      title={item.description}
                      enterDelay={500}
                      key={`tooltip-${index}`}
                    >
                      <Box
                        display={"flex"}
                        flexDirection={"row"}
                        flexGrow={1}
                        alignItems={"center"}
                        justifyContent={"space-between"}
                      >
                        <Box
                          fontSize={"14px"}
                          overflow={"hidden"}
                          whiteSpace={"nowrap"}
                          textOverflow={"ellipsis"}
                          fontFamily={"DM Sans"}
                          width={"200px"}
                          onClick={() => onMagicTemplateClick(item)}
                        >
                          {item.title}
                        </Box>
                        <Box display={"flex"} justifyContent={"center"} justifyItems={"flex-end"}>
                          {!item.static && (
                            <Box display={"flex"} alignItems={"center"}>
                              <WandIcon />
                            </Box>
                          )}
                          {item.ownership === "private" && (
                            <Box display={"flex"} onClick={(e) => handlePopoverOpen(e, item.id)}>
                              <ThreeDotsIcon />
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </CustomTooltip>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
        {!isMobile ? (
          <Box display={"flex"} justifyContent={"center"}>
            <PrimaryButton
              sx={{
                height: "32px",
                width: "100%",
                margin: "0 15px",
              }}
              onClick={handleCreateTemplate}
            >
              Create template
            </PrimaryButton>
          </Box>
        ) : null}
      </Box>
    </>
  );
};

export default MagicTemplatesScreen;
