import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { DialogActions } from "@mui/material";
import Box from "@mui/material/Box";
import { getAssetForChromeExtension } from "../../../../../../ChromeExtension/utils/assets";

interface ErrorDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({ open, onClose, title, description }) => {
  const platformType = process.env.PLATFORM_TYPE as string;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="error-dialog-title"
      aria-describedby="error-dialog-description"
      sx={{
        "& .MuiPaper-root": {
          width: "250px",
          maxWidth: 400,
        },
      }}
    >
      <DialogTitle id="error-dialog-title" fontFamily={"DM Sans"} fontSize={"16px"}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
            "&:hover": {
              boxShadow: "none",
            },
          }}
        >
          <CloseIcon
            sx={{
              height: 16,
            }}
          />
        </IconButton>
        {title}
      </DialogTitle>
      <DialogContent>
        <Box display={"flex"} justifyContent={"center"}>
          <img
            src={
              platformType === "chrome_extension"
                ? getAssetForChromeExtension("../../../../../../../assets/error.svg")
                : "../../../../../../../assets/error.svg"
            }
            width="220px"
            style={{ marginBottom: "16px" }}
          />
        </Box>
        <DialogContentText id="error-dialog-description" fontFamily={"DM Sans"} fontSize={"14px"}>
          {description}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Box
          onClick={onClose}
          sx={{
            border: "1px solid #E0E0E0",
            borderRadius: "4px",
            padding: "8px 16px",
            backgroundColor: "#7468FF",
            color: "#FFF",
            cursor: "pointer",
            fontFamily: "DM Sans",
            fontSize: "14px",
            "&:hover": {
              backgroundColor: "#FFF",
              color: "#7468FF",
            },
          }}
        >
          Close
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorDialog;
