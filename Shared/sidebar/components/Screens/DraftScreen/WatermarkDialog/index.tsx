import { DialogActions } from "@mui/material";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import React from "react";
import { getAssetForChromeExtension } from "../../../../../../ChromeExtension/utils/assets";
import { StarIcon } from "../../../../../common/Icon/SubscriptionExpired/StarIcon";
import { useAppDispatch } from "../../../../store/store";
import { Screen, setScreen } from "../../../../store/reducers/AppReducer";

interface WatermarkDialogProps {
  open: boolean;
  onClose: () => void;
}

const WatermarkDialog: React.FC<WatermarkDialogProps> = ({ open, onClose }) => {
  // @ts-ignore
  const platformType = process.env.PLATFORM_TYPE as string;
  const dispatch = useAppDispatch();

  const onGoPremiumClick = () => {
    dispatch(setScreen(Screen.SubscriptionExpired));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiPaper-root": {
          width: "250px",
          maxWidth: 400,
          borderRadius: "12px",
        },
      }}
    >
      <DialogTitle
        textAlign={"center"}
        color={"#7468FF"}
        fontFamily={"DM Sans"}
        fontSize={"20px"}
        fontWeight={"700"}
        lineHeight={"28px"}
      >
        Watermark
      </DialogTitle>
      <DialogContent
        sx={{
          padding: "0 24px",
        }}
      >
        <Box display={"flex"} flexDirection={"column"} justifyContent={"center"}>
          <Typography
            textAlign={"center"}
            fontFamily={"DM Sans"}
            fontSize={"14px"}
            fontWeight={"400"}
            lineHeight={"20px"}
            color={"#000"}
          >
            A watermark is added when you send a free AI email
          </Typography>
          <img
            src={
              platformType === "chrome_extension"
                ? getAssetForChromeExtension("../../../../../../../assets/watermark_image.svg")
                : "../../../../../../../assets/watermark_image.svg"
            }
            style={{ width: "100%", marginTop: "8px", marginBottom: "8px" }}
          />
          <Typography
            textAlign={"center"}
            fontFamily={"DM Sans"}
            fontSize={"14px"}
            fontWeight={"400"}
            lineHeight={"20px"}
            color={"#000"}
          >
            <strong>Go premium</strong> to remove it now
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          padding: "12px",
          display: "flex",
          justifyContent: "space-between",
          margin: "0px",
        }}
      >
        <Box
          onClick={onClose}
          sx={{
            border: "1px solid #595D62",
            borderRadius: "8px",
            padding: "4px 12px",
            backgroundColor: "#FFF",
            color: "#595D62",
            cursor: "pointer",
            fontFamily: "DM Sans",
            fontSize: "14px",
            fontWeight: 700,
            lineHeight: "24px",
          }}
        >
          Cancel
        </Box>
        <Box
          onClick={onGoPremiumClick}
          sx={{
            border: "1px solid #7468FF",
            borderRadius: "8px",
            padding: "4px 12px",
            backgroundColor: "#7468FF",
            color: "#FFF",
            cursor: "pointer",
            fontFamily: "DM Sans",
            fontSize: "14px",
            fontWeight: 700,
            lineHeight: "24px",
            display: "flex",
            alignItems: "center",
          }}
        >
          Go Premium <StarIcon sx={{ width: "16px", marginLeft: "5px" }} />
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default WatermarkDialog;
