import { Box, Link, Typography } from "@mui/material";
import { isNativeApp } from "@platformSpecific/sidebar/utils/officeMisc";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TypingIcon } from "../../../../common/Icon/InitialScreen/TypingIcon";
import { AddIcon } from "../../../../common/Icon/TextShortcuts/AddIcon";
import { Screen, selectZoomLevel, setScreen } from "../../../store/reducers/AppReducer";
import {
  TextShortcut,
  selectPreviousScreen,
  selectShowEditingDialog,
  selectTextShortcuts,
  setPreviousScreen,
  setShowEditingDialog,
} from "../../../store/reducers/TextShortcutsReducer";
import { RootState } from "../../../store/store";
import Header from "../../Common/Header";
import TextShortcutBox from "./TextShortcutBox";
import { TextShortcutDialog } from "./TextShortcutDialog";
import { getAssetForChromeExtension } from "../../../../../ChromeExtension/utils/assets";

const TEXT_SHORTCUTS_VIDEO = "https://go.maestrolabs.com/asIZUC";

const TextShortcuts: React.FC = () => {
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const isNative = isNativeApp();
  const zoomLevel = useSelector(selectZoomLevel);
  const previousScreen = useSelector(selectPreviousScreen);
  const platformType = process.env.PLATFORM_TYPE as string;

  const [shortcutForEdit, setShortcutForEdit] = React.useState<TextShortcut | null>(null);

  const showEditingDialog = useSelector(selectShowEditingDialog);
  const textShortcuts = useSelector(selectTextShortcuts);

  const addNewShortcut = () => {
    dispatch(setShowEditingDialog(true));
  };

  const editShortcut = (shortcut: TextShortcut) => {
    setShortcutForEdit(shortcut);
    dispatch(setShowEditingDialog(true));
  };

  const onGoBack = () => {
    if (previousScreen) {
      dispatch(setScreen(previousScreen));
      dispatch(setPreviousScreen(null));
    } else {
      dispatch(setScreen(Screen.Start));
    }
  };

  const onCloseDialog = () => {
    setShortcutForEdit(null);
    dispatch(setShowEditingDialog(false));
  };

  useEffect(() => {
    if (previousScreen) {
      addNewShortcut();
    }
  }, [previousScreen]);

  return (
    <>
      <Box
        sx={{
          background: "linear-gradient(180deg, #FFF 0%, #ECEBFF 100%)",
        }}
        height={"100vh"}
      >
        <Header isNative={isNative} onGoBack={onGoBack} />
        <TextShortcutDialog open={showEditingDialog} initialValues={shortcutForEdit} onClose={onCloseDialog} />
        <Box padding={"20px 15px"}>
          <Box display={"flex"} alignItems={"center"}>
            <TypingIcon
              sx={{
                width: "16px",
                height: "16px",
                color: "#7468FF",
                marginRight: "5px",
              }}
            />
            <Typography align="left" fontSize={"16px"} fontFamily={"DM Sans"} fontWeight={"700"}>
              Text shortcuts
            </Typography>
          </Box>
          <Box display={"flex"} alignItems={"center"}>
            <Link
              href={TEXT_SHORTCUTS_VIDEO}
              target="_blank"
              rel="noopener noreferrer"
              color={"#7468FF"}
              fontFamily={"Inter"}
              fontWeight={"700"}
              fontSize={"12px"}
              margin="5px 0"
              sx={{
                textDecoration: "none",
              }}
            >
              Learn more
            </Link>
          </Box>

          <Box>
            <Box
              color={"#FFFFFF"}
              padding={"5px 0 5px 10px"}
              borderRadius={"5px 5px 0 0"}
              marginTop={"10px"}
              sx={{
                backgroundColor: "#7468FF",
              }}
            >
              <Typography align="left" fontSize={"12px"} fontFamily={"Inter"} fontWeight={"400"}>
                Your shortcuts
              </Typography>
            </Box>
            <Box
              maxHeight={zoomLevel >= 175 ? "100px" : "250px"}
              sx={{
                overflowY: "auto",
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
              {textShortcuts.map((textShortcut) => (
                <TextShortcutBox
                  key={textShortcut.id}
                  shortcut={textShortcut.tag}
                  text={textShortcut.snippet}
                  onEdit={() => editShortcut(textShortcut)}
                />
              ))}
            </Box>
            <div onClick={addNewShortcut}>
              <Box
                sx={{
                  "&:hover": {
                    cursor: "pointer",
                  },
                  backgroundColor: "#FFFFFF",
                }}
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}
                padding={"10px"}
                border={"1px solid #E8E7FF"}
                borderRadius={"0 0 5px 5px"}
              >
                <AddIcon />
                <Typography align="left" fontSize={"12px"} fontFamily={"Inter"} fontWeight={"400"} color={"#7468FF"}>
                  New shortcut
                </Typography>
              </Box>
            </div>
            <Box marginTop={"60px"}>
              <Box>
                <img
                  src={
                    platformType === "chrome_extension"
                      ? getAssetForChromeExtension("../../../../../../assets/text-shortcuts.svg")
                      : "../../../../../../assets/text-shortcuts.svg"
                  }
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default TextShortcuts;
