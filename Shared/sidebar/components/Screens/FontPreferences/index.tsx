import { Box, Typography } from "@mui/material";
import { isNativeApp } from "@platformSpecific/sidebar/utils/officeMisc";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontIcon } from "../../../../common/Icon/FontPreferences/FontIcon";
import { Screen, setScreen } from "../../../store/reducers/AppReducer";
import { selectPreviousScreen, setPreviousScreen } from "../../../store/reducers/TextShortcutsReducer";
import { RootState, useAppDispatch } from "../../../store/store";
import Header from "../../Common/Header";
import { FontPreferenceSelect } from "./components/FontPreferenceSelect";
import { ColorPicker } from "./components/ColorPicker";
import SecondaryButton from "../../Common/UI/SecondaryButton";
import PrimaryButton from "../../Common/UI/PrimaryButton";
import { selectFontPreferences, selectToken, setFontPreferences } from "../../../store/reducers/AuthReducer";
import { updateFontPreferences } from "../../../apis/fontPreferences";
import { FontPreferences } from "./types";
import MenuItem from "@mui/material/MenuItem";

export const availableFonts = [
  "Aptos",
  "Aptos Display",
  "Aptos Mono",
  "Aptos Narrow",
  "Aptos Serif",
  "Arial",
  "Arial Black",
  "Calibri",
  "Calibri Light",
  "Cambria",
  "Candara",
  "Century Gothic",
  "Comic Sans MS",
  "Consolas",
  "Constantia",
  "Corbel",
  "Courier New",
  "Franklin Gothic Book",
  "Franklin Gothic Demi",
  "Franklin Gothic Medium",
  "Garamond",
  "Georgia",
  "Impact",
  "Lucida Console",
  "Lucida Handwriting",
  "Lucida Sans Unicode",
  "Palatino Linotype",
  "Segoe UI",
  "Sitka Heading",
  "Sitka Text",
  "Tahoma",
  "Times",
  "Times New Roman",
  "Trebuchet MS",
  "TW Cen MT",
  "Verdana",
];

export const FontPreferencesScreen: React.FC = () => {
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const isNative = isNativeApp();
  const previousScreen = useSelector(selectPreviousScreen);
  const fontPreferences = useSelector(selectFontPreferences);
  const token = useSelector(selectToken);

  const onGoBack = () => {
    if (previousScreen) {
      dispatch(setScreen(previousScreen));
      dispatch(setPreviousScreen(null));
    } else {
      dispatch(setScreen(Screen.Start));
    }
  };

  const handleFontFamilyChange = (value: string) => {
    dispatch(setFontPreferences({ ...(fontPreferences as FontPreferences), family: value }));
  };

  const handleFontSizeChange = (value: string) => {
    dispatch(setFontPreferences({ ...(fontPreferences as FontPreferences), size: value }));
  };

  const handleFontColorChange = (value: string) => {
    dispatch(setFontPreferences({ ...(fontPreferences as FontPreferences), color: value }));
  };

  const onSaveFontPreferences = async () => {
    try {
      await updateFontPreferences(token as string, fontPreferences as FontPreferences);
      dispatch(setScreen(Screen.Start));
    } catch (error) {
      console.error("Error saving font preferences:", error);
    }
  };

  const renderFontFamilyOptions = (font: string) => {
    return (
      <MenuItem key={font} value={font} style={{ fontFamily: font, padding: 0, fontSize: "14px" }}>
        {font}
      </MenuItem>
    );
  };

  const renderFontSizeOptions = (size: string) => {
    const formattedStyle = size.toLowerCase();
    return (
      <MenuItem key={formattedStyle} value={formattedStyle} style={{ padding: 0, fontSize: "14px" }}>
        {size}
      </MenuItem>
    );
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
        <Box display={"flex"} flexDirection={"column"} justifyContent={"space-between"} height={"calc(100% - 30px)"}>
          <Box padding={"20px 15px"}>
            <Box display={"flex"} alignItems={"center"}>
              <FontIcon
                sx={{
                  width: "16px",
                  height: "16px",
                  color: "#7468FF",
                  marginRight: "8px",
                }}
              />
              <Typography align="left" fontSize={"16px"} fontFamily={"DM Sans"} fontWeight={"700"}>
                Font preferences
              </Typography>
            </Box>
            <Box display={"flex"} alignItems={"center"} marginTop={"10px"}>
              <Typography
                align="left"
                fontSize={"14px"}
                fontFamily={"Inter"}
                fontWeight={"400"}
                fontStyle={"italic"}
                color={"#6F6F6F"}
              >
                Personalize your font style and see it applied to your emails.
              </Typography>
            </Box>
            <Box display={"flex"} flexDirection={"column"} alignItems={"flex-start"} marginTop={"10px"}>
              <FontPreferenceSelect
                label={"Font"}
                selectedValue={fontPreferences?.family ?? availableFonts[0]}
                valuesList={availableFonts}
                onChange={handleFontFamilyChange}
                renderFunction={renderFontFamilyOptions}
              />
              <FontPreferenceSelect
                label={"Font size"}
                selectedValue={fontPreferences?.size ?? "14"}
                valuesList={["8", "9", "10", "11", "12", "14", "16", "18", "20", "22", "24", "26", "28", "30"]}
                onChange={handleFontSizeChange}
                renderFunction={renderFontSizeOptions}
              />
              <ColorPicker selectedValue={fontPreferences?.color ?? "#FFFFFF"} onChange={handleFontColorChange} />
            </Box>
          </Box>
          <Box padding={"20px 15px"}>
            <Box display={"flex"} justifyContent={"space-between"}>
              <PrimaryButton
                onClick={onSaveFontPreferences}
                style={{
                  margin: "5px",
                  padding: "5px",
                }}
              >
                Save
              </PrimaryButton>
              <SecondaryButton
                onClick={onGoBack}
                style={{
                  margin: "5px",
                  padding: "5px",
                }}
              >
                Cancel
              </SecondaryButton>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default FontPreferencesScreen;
