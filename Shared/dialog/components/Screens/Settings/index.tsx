import { Box, Dialog, DialogContent, DialogContentText, DialogTitle, Typography } from "@mui/material";
import Divider from "@mui/material/Divider";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { CloseIcon } from "../../../../common/Icon/PartialTextEditing/CloseIcon";
import { FontIcon } from "../../../../common/Icon/Settings/FontIcon";
import { FourButtonsIcon } from "../../../../common/Icon/Settings/FourButtonsIcon";
import { GearIcon } from "../../../../common/Icon/Settings/GearIcon";
import { MagicWandIcon } from "../../../../common/Icon/Settings/MagicWandIcon";
import { SignatureIconV2 } from "../../../../common/Icon/Settings/SignatureIconV2";
import { TextBoxIcon } from "../../../../common/Icon/Settings/TextBoxIcon";
import { fetchUsersDetails } from "../../../store/actions/app";
import { selectError, setCustomInstructions, setError } from "../../../store/reducers/customInstructions";
import { selectSettingsModule, selectToken, setSettingsModule } from "../../../store/reducers/dialog";
import { useAppDispatch } from "../../../store/store";
import SettingsOption from "./components/SettingsOption";
import { SettingsOptions } from "./types";
import { getSettingsModuleByScreen } from "./utils";
import { getCustomInstructions } from "../CustomInstructions/api";
import { fetchUserTextShortcuts } from "../../../store/actions/textShortcuts";
import { fetchSignoffAndSignatures } from "../SignoffAndSignature/api";
import { setSignatures } from "../../../store/reducers/signoffAndSignature";

export enum SettingsModule {
  GENERAL = "GENERAL",
  TEXT_SHORTCUTS = "TEXT_SHORTCUTS",
  FONT_PREFERENCE = "FONT_PREFERENCE",
  AI_PERSONALITY = "AI_PERSONALITY",
  SIGNATURE = "SIGNATURE",
  HELP = "HELP",
}

type SettingsProps = {
  onClose: () => void;
  onChromeSignOut?: () => void;
};

const settingsOptions: SettingsOptions[] = [
  {
    title: "General",
    id: "general",
    icon: <GearIcon />,
    module: SettingsModule.GENERAL,
  },
  {
    title: "AI personality",
    id: "ai-personality",
    icon: <MagicWandIcon />,
    module: SettingsModule.AI_PERSONALITY,
  },
  {
    title: "Text shortcuts",
    id: "text-shortcuts",
    icon: <TextBoxIcon />,
    module: SettingsModule.TEXT_SHORTCUTS,
  },
  {
    title: "Font preference",
    id: "font-preference",
    icon: <FontIcon />,
    module: SettingsModule.FONT_PREFERENCE,
  },
  {
    title: "Signature",
    id: "signature",
    icon: <SignatureIconV2 />,
    module: SettingsModule.SIGNATURE,
  },
  {
    title: "Help",
    id: "help",
    icon: <FourButtonsIcon />,
    module: SettingsModule.HELP,
  },
];

export const Settings: React.FC<SettingsProps> = ({ onClose, onChromeSignOut }) => {
  const dispatch = useAppDispatch();
  const settingsModule = useSelector(selectSettingsModule);
  const token = useSelector(selectToken);
  const error = useSelector(selectError);

  // @ts-ignore
  const platformType = process.env.PLATFORM_TYPE;

  const onCloseErrorDialog = () => {
    dispatch(setError(null));
  };

  useEffect(() => {
    async function getUserDetails() {
      dispatch(fetchUsersDetails(token));
    }
    getUserDetails();
  }, []);

  useEffect(() => {
    async function fetchCustomInstructions() {
      const { customInstructions, status } = await getCustomInstructions(token);
      if (status !== "success") {
        /* dispatch(setError(status));
        return; */
      }
      dispatch(setCustomInstructions(customInstructions));
    }
    token && fetchCustomInstructions();
  }, [token]);

  useEffect(() => {
    const fetchTextShortcuts = async () => {
      try {
        await dispatch(fetchUserTextShortcuts()).unwrap();
      } catch (error) {
        console.error("Error fetching text shortcuts.", error);
      }
    };
    token && fetchTextShortcuts();
  }, [dispatch, token]);

  useEffect(() => {
    const getSignOffAndSignatures = async () => {
      try {
        if (!token) return;
        const data = await fetchSignoffAndSignatures(token as string);
        if (!data || data.length === 0) {
          return;
        }
        dispatch(setSignatures(data));
      } catch (error) {
        console.error("Error fetching resources:", error);
      }
    };

    getSignOffAndSignatures();
  }, [token]);

  useEffect(() => {
    dispatch(setSettingsModule(SettingsModule.GENERAL));
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        padding: "10px",
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: "#FFF",
        ...(platformType === "chrome_extension" && { height: "600px" }),
        ...(platformType === "outlook_addin" && { height: "calc(100vh - 35px)" }),
      }}
    >
      <Dialog
        open={Boolean(error)}
        onClose={onCloseErrorDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          "& .MuiDialog-paper": {
            margin: "22px",
            padding: "12px",
            borderRadius: "12px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "DM Sans",
            fontSize: "20px",
            color: "#D33030",
          }}
          id="alert-dialog-title"
        >
          {"Error"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{
              fontFamily: "DM Sans",
              fontSize: "14px",
              padding: "0 24px",
              textAlign: "center",
            }}
            id="alert-dialog-description"
          >
            {error}
          </DialogContentText>
        </DialogContent>
      </Dialog>
      <Box margin={"10px"} width={"100%"} display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
        <Box>
          <Box style={{ flexGrow: 1, cursor: "text" }}>
            <Typography sx={{ fontSize: "16px" }} fontFamily={"DM Sans"} fontWeight={"700"}>
              Settings
            </Typography>
          </Box>
        </Box>
        <Box
          display={"flex"}
          alignItems={"center"}
          sx={{
            ...(platformType === "chrome_extension" && { marginRight: "35px" }),
            "&:hover": {
              cursor: "pointer",
            },
          }}
          onClick={onClose}
        >
          <CloseIcon
            sx={{
              color: "#000",
              width: "25px",
              height: "25px",
            }}
          />
        </Box>
      </Box>
      <Box width={"100%"} display={"flex"} justifyContent={"space-between"}>
        <Divider sx={{ width: "100%" }} />
      </Box>
      <Box height={"100%"} width={"100%"} display={"flex"} overflow={"auto"}>
        <Box
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
          minWidth={"25%"}
          display={"flex"}
          flexDirection={"column"}
          padding={"16px 0 0 0"}
          overflow={"auto"}
        >
          <SettingsOption option={settingsOptions[0]} />
          <Divider sx={{ width: "100%", margin: "5px 0" }} />
          <Box
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
            display={"flex"}
            justifyContent={"space-between"}
            flexDirection={"column"}
            height={"100%"}
            overflow={"auto"}
          >
            <Box>
              {[...settingsOptions]
                .filter((option) => {
                  if (option.id === "font-preference" && platformType === "chrome_extension") {
                    return false;
                  }
                  return true;
                })
                .map((option) => {
                  if (option.id === "general" || option.id === "help") {
                    return null;
                  }
                  return <SettingsOption key={option.id} option={option} />;
                })}
            </Box>
            <Box>
              <SettingsOption option={settingsOptions[5]} />
            </Box>
          </Box>
        </Box>
        <Divider
          sx={{
            height: "auto",
            margin: "0 10px",
            width: "auto",
          }}
          orientation="vertical"
          flexItem
        />
        <Box
          width={"100%"}
          display={"flex"}
          flexDirection={"column"}
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
          {getSettingsModuleByScreen(settingsModule, onClose, onChromeSignOut)}
        </Box>
      </Box>
    </Box>
  );
};

export default Settings;
