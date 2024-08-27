import { Dialog } from "@mui/material";
import React from "react";

export type PartialTextEditingDialogProps = {
  showMenu: boolean;
  children: React.ReactNode;
};

export const PartialTextEditingDialog: React.FC<PartialTextEditingDialogProps> = ({ showMenu, children }) => {
  return (
    <Dialog
      open={showMenu}
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
            height: "calc(100% - 40px)",
            margin: "15px",
            padding: "5px",
            "&::-webkit-scrollbar": {
              borderRadius: "4px",
              width: "5px",
            },

            "&::-webkit-scrollbar-thumb": {
              background: "#7468ff",
              borderRadius: "4px",
            },
          },
        },
      }}
    >
      {children}
    </Dialog>
  );
};
