import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import React, { useEffect } from "react";
import ReactGA from "react-ga4";
import { useDispatch, useSelector } from "react-redux";
import { AddIcon } from "../../../../common/Icon/TextShortcuts/AddIcon";
import { SearchIcon } from "../../../../common/Icon/TextShortcuts/SearchIcon";
import { insertTextShortcut } from "../../../store/actions/textShortcutsActions";
import { Screen, selectScreen, setScreen } from "../../../store/reducers/AppReducer";
import { selectIsLoading, selectTextShortcuts, setPreviousScreen } from "../../../store/reducers/TextShortcutsReducer";
import { RootState } from "../../../store/store";
import { GA4_EVENTS } from "../../../utils/events";
import { openTaskPaneByOption } from "@platformSpecific/sidebar/utils/officeMisc";
import { selectToken } from "../../../store/reducers/AuthReducer";
import { SettingsModule } from "../../../../dialog/components/Screens/Settings";

type TextShortcutsDialogProps = {
  open: boolean;
  onClose: () => void;
};

const openTextShortcutsOnSettings = (
  token: string,
  dispatch: ThunkDispatch<RootState, void, AnyAction>,
  handleClose: () => void,
) => {
  openTaskPaneByOption(
    "settings",
    token,
    { settingsModule: SettingsModule.TEXT_SHORTCUTS },
    { height: 850, width: 1200 },
    dispatch,
    handleClose,
  );
};

export const TextShortcutsDialog: React.FC<TextShortcutsDialogProps> = ({ open, onClose }) => {
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  const textShortcuts = useSelector(selectTextShortcuts);
  const isLoading = useSelector(selectIsLoading);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const draftId = useSelector((state: RootState) => state.draft.draftId);
  const gaId = useSelector((state: RootState) => state.auth?.userDetails?.ganalytics_id);
  const currentScreen = useSelector(selectScreen);
  const token = useSelector(selectToken);

  const [searchTerm, setSearchTerm] = React.useState(""); // Search input state
  const [focusedIndex, setFocusedIndex] = React.useState(0);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredShortcuts = textShortcuts.filter(
    (shortcut) =>
      shortcut.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shortcut.snippet.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const listItemRefs = React.useRef([]);

  useEffect(() => {
    listItemRefs.current = filteredShortcuts.map((_, i) => listItemRefs.current[i] || React.createRef());
  }, [filteredShortcuts.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        const nextIndex = (focusedIndex + 1) % filteredShortcuts.length;
        setFocusedIndex(nextIndex);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        const nextIndex = (focusedIndex - 1 + filteredShortcuts.length) % filteredShortcuts.length;
        setFocusedIndex(nextIndex);
      } else if (event.key === "Enter") {
        if (focusedIndex >= 0) {
          event.preventDefault();
          setFocusedIndex(0);
          onShortcutClick(filteredShortcuts[focusedIndex].snippet);
        } else {
          filteredShortcuts.length > 0 && onShortcutClick(filteredShortcuts[0].snippet);
        }
      } else {
        searchInputRef.current?.focus();
      }
    };

    if (open) {
      ReactGA.event(GA4_EVENTS.TEXT_SHORTCUT_REPLACEMENT_OPENED, {
        draftID: draftId,
        userID: gaId,
      });
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [focusedIndex, filteredShortcuts.length, open]);

  // Focus on the selected item
  useEffect(() => {
    if (open && focusedIndex >= 0 && listItemRefs.current[focusedIndex]) {
      // @ts-ignore
      listItemRefs.current[focusedIndex]?.current?.focus();
    }
  }, [focusedIndex, open]);

  // Reset focus to first element when the list changes
  useEffect(() => {
    if (filteredShortcuts.length > 0) {
      setFocusedIndex(0);
    }
  }, [filteredShortcuts.length]);

  const handleOpenTextShortcuts = () => {
    ReactGA.event(GA4_EVENTS.TEXT_SHORTCUT_REPLACEMENT_CREATE_NEW, {
      draftID: draftId,
      userID: gaId,
    });
    openTextShortcutsOnSettings(token as string, dispatch, handleClose);
    handleClose();
  };

  const handleClose = () => {
    setSearchTerm("");
    setFocusedIndex(0);
    onClose();
  };

  const onShortcutClick = (shortcut: string) => {
    handleClose();
    dispatch(insertTextShortcut(shortcut));
  };

  const handleDialogEntered = () => {
    searchInputRef.current?.focus();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionProps={{
        onEntered: handleDialogEntered,
      }}
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "12px",
          backgroundColor: "#f4f6f8",
          maxWidth: "calc(100% - 32px)",
          width: "400px",
        },
      }}
    >
      <DialogContent
        sx={{
          padding: "5px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#FFF",
        }}
      >
        <Box
          sx={{
            width: "100%",
            marginBottom: "4px",
          }}
        >
          <InputBase
            value={searchTerm}
            onChange={handleSearchChange}
            inputRef={searchInputRef}
            autoFocus
            startAdornment={
              <IconButton
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                disableRipple
                disableFocusRipple
                edge="start"
                size="small"
              >
                <SearchIcon
                  sx={{
                    padding: "0 5px",
                    height: "16px",
                    width: "16px",
                  }}
                />{" "}
                <Typography
                  marginLeft={"5px"}
                  fontFamily={"DM Sans"}
                  fontSize={"14px"}
                  fontWeight={"400"}
                  color={"#7468FF"}
                >
                  !
                </Typography>
              </IconButton>
            }
            {...(searchTerm === "" && {
              endAdornment: (
                <Typography
                  sx={{
                    marginRight: "10px",
                    fontSize: "14px",
                    color: "#B1B1B1",
                    textWrap: "nowrap",
                  }}
                >
                  Esc to exit
                </Typography>
              ),
            })}
            sx={{
              width: "100%",
              padding: "8px",
              borderRadius: "8px",
              backgroundColor: "#F6F7F9",
              border: "1.5px solid #7468FF",
              boxShadow: "0px 0px 0px 4px rgba(78, 70, 180, 0.20)",
              "& .MuiInputBase-input": {
                padding: "0",
              },
              "& .MuiButtonBase-root": {
                padding: "0",
              },
            }}
          />
        </Box>

        <List
          sx={{
            overflow: "auto",
            maxHeight: "150px",
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
          {isLoading && (
            <ListItem
              sx={{
                backgroundColor: "#fff",
                borderBottom: "1px solid #E2E2E2",
                padding: "8px 12px",
                height: "134px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <CircularProgress
                sx={{
                  height: "30px",
                  width: "30px",
                }}
              />
            </ListItem>
          )}
          {!isLoading && textShortcuts.length === 0 && (
            <ListItem
              sx={{
                backgroundColor: "#fff",
                borderBottom: "1px solid #E2E2E2",
                padding: "8px 12px",
                height: "134px",
              }}
            >
              <Typography color={"#595D62"} align="center" fontSize={"12px"} fontFamily={"DM Sans"} fontWeight={"400"}>
                You haven't created any text shortcuts yet
              </Typography>
            </ListItem>
          )}
          {!isLoading && filteredShortcuts.length === 0 && textShortcuts.length !== 0 && (
            <ListItem
              sx={{
                backgroundColor: "#fff",
                borderBottom: "1px solid #E2E2E2",
                padding: "8px 12px",
                height: "134px",
              }}
            >
              <Typography color={"#595D62"} align="center" fontSize={"12px"} fontFamily={"DM Sans"} fontWeight={"400"}>
                You haven't created any text shortcuts with that name yet
              </Typography>
            </ListItem>
          )}
          {!isLoading &&
            filteredShortcuts.map((shortcut, index) => (
              <ListItem
                key={index}
                ref={listItemRefs.current[index]}
                tabIndex={-1}
                onClick={() => onShortcutClick(shortcut.snippet)}
                sx={{
                  backgroundColor: focusedIndex === index ? "rgba(116, 104, 255, 0.2)" : "#fff", // Highlight if focused
                  borderBottom: "1px solid #E2E2E2",
                  "&:hover": {
                    backgroundColor: "rgba(116, 104, 255, 0.12)",
                    cursor: "pointer",
                  },
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      textWrap: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      width: "220px",
                    }}
                    align="left"
                    fontSize={"14px"}
                    fontFamily={"DM Sans"}
                    fontWeight={"400"}
                  >
                    {shortcut.tag}
                  </Typography>
                  <Typography
                    align="left"
                    fontSize={"12px"}
                    fontFamily={"DM Sans"}
                    fontWeight={"400"}
                    color={"#737373"}
                    sx={{
                      textWrap: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      width: "220px",
                    }}
                  >
                    {shortcut.snippet}
                  </Typography>
                </Box>
              </ListItem>
            ))}
        </List>

        <Box
          onClick={handleOpenTextShortcuts}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#fff",
            padding: "5px",
            "&:hover": {
              cursor: "pointer",
            },
          }}
        >
          <AddIcon />
          <Typography
            marginLeft={"5px"}
            align="left"
            fontSize={"14px"}
            fontFamily={"DM Sans"}
            fontWeight={"400"}
            color={"#7468FF"}
          >
            Create new
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
