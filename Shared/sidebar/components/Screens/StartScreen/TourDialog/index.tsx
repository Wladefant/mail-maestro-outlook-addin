import { Box, Dialog, Link, Typography } from "@mui/material";
import React from "react";
import { TermsLabel } from "./styles";
import { useSelector } from "react-redux";
import { selectZoomLevel } from "../../../../store/reducers/AppReducer";

export type TourDialogProps = {
  open: boolean;
  onSkip: () => void;
};

export const TourDialog: React.FC<TourDialogProps> = ({ open, onSkip }) => {
  const zoomLevel = useSelector(selectZoomLevel);

  return (
    <Dialog
      open={open}
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
            borderRadius: "20px",
            margin: "35px 15px",
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
      <Box
        textAlign={"center"}
        display={"flex"}
        flexDirection={"column"}
        alignItems={"center"}
        justifyContent={"center"}
        width={"100%"}
      >
        {zoomLevel >= 175 && (
          <Link
            sx={{
              alignSelf: "flex-end",
              padding: "10px",
              "&.MuiTypography-root": {
                color: "#7468FF",
                fontFamily: "Inter",
                fontSize: "14px",
                fontWeight: "400",
                cursor: "pointer",
              },
            }}
            onClick={onSkip}
          >
            Skip
          </Link>
        )}
        <img
          style={{
            marginTop: "20px",
            ...(zoomLevel >= 175 && { width: "130px" }),
          }}
          src={"../../assets/initial-screen-image.svg"}
          alt="writting"
        />
        <Box padding={zoomLevel >= 175 ? "5px" : "20px"}>
          <Typography fontFamily={"Inter"} fontSize={"14px"} fontWeight={"400"} margin={"10px 0"}>
            Take the tour to discover MailMaestro’s amazing features
          </Typography>
          <Typography fontFamily={"Inter"} fontSize={"14px"} fontWeight={"400"}>
            or
          </Typography>
          <Box margin={"10px 10px 25px 10px"}>
            <Link
              sx={{
                "&.MuiTypography-root": {
                  color: "#7468FF",
                  fontFamily: "Inter",
                  fontSize: "14px",
                  fontWeight: "400",
                  cursor: "pointer",
                },
              }}
              onClick={onSkip}
            >
              Skip and start using MailMaestro
            </Link>
          </Box>

          <TermsLabel>
            By signing in, you agree to our{" "}
            <Link
              sx={{
                "&.MuiTypography-root": {
                  color: "#131313",
                  fontWeight: "700",
                },
              }}
              href="https://www.maestrolabs.com/terms"
              target="_blank"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              sx={{
                "&.MuiTypography-root": {
                  color: "#131313",
                  fontWeight: "700",
                },
              }}
              href="https://www.maestrolabs.com/privacy"
              target="_blank"
            >
              Privacy Policy
            </Link>
            .
          </TermsLabel>
        </Box>
      </Box>
    </Dialog>
  );
};
