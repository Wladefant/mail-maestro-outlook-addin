import { Box, Divider, Typography, Popover, List, ListItem, ListItemText } from "@mui/material";
import React from "react";

export type TemplateOptionsPopOverProps = {
  onClose: () => void;
  open: boolean;
  anchorEl: HTMLElement | null;
  handleEditTemplate: () => void;
  handleDelete: () => void;
};

export const TemplateOptionsPopOver: React.FC<TemplateOptionsPopOverProps> = ({
  onClose,
  open,
  anchorEl,
  handleDelete,
  handleEditTemplate,
}) => {
  return (
    <Popover
      id={open ? "simple-popover" : undefined}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      sx={{
        "& .MuiPaper-root": {
          borderRadius: "12px",
          border: "1px solid #E2E2E2",
          boxShadow: "none",
          padding: "4px",
          width: "112px",
        },
        "& .MuiList-padding": {
          padding: "0",
        },
      }}
      anchorOrigin={{
        vertical: "center",
        horizontal: "left",
      }}
    >
      <List>
        <ListItem
          button
          sx={{
            height: "24px",
            padding: "4px 12px",
          }}
          onClick={handleEditTemplate}
        >
          <ListItemText
            sx={{
              "& .MuiTypography-root": {
                fontFamily: "DM Sans",
              },
            }}
            primary="Edit"
          />
        </ListItem>
        <ListItem
          sx={{
            height: "24px",
            padding: "4px 12px",
          }}
          button
          onClick={handleDelete}
        >
          <ListItemText
            sx={{
              color: "red",
              "& .MuiTypography-root": {
                fontFamily: "DM Sans",
              },
            }}
            primary="Delete"
          />
        </ListItem>
      </List>
    </Popover>
  );
};
