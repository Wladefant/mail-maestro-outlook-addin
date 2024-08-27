import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";
import React, { useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";

export interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({ open, onClose, onDelete }) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClose = () => {
    setIsLoading(false);
    onClose();
  };

  useEffect(() => {
    setIsLoading(false);
  }, [open]);

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
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
          {"Delete Template"}
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
            Are you sure you want to delete the template?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={isLoading}
            sx={{
              borderRadius: "8px",
              border: "1px solid #595D62",
              backgroundColor: "#FFF",
              color: "#595D62",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "transparent",
              },
              padding: "8px 16px",
              width: "98px",
              height: "40px",
            }}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            disabled={isLoading}
            sx={{
              borderRadius: "8px",
              border: "1px solid #595D62",
              backgroundColor: "#D33030",
              color: "#FFF",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#D33030",
              },
              padding: "8px 16px",
              width: "98px",
              height: "40px",
            }}
            onClick={() => {
              setIsLoading(true);
              onDelete();
            }}
            color="error"
          >
            {isLoading ? (
              <CircularProgress
                size={24}
                sx={{
                  color: "#FFF",
                }}
              />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
