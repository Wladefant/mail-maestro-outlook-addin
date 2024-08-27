import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, MenuItem, SelectChangeEvent, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { FireIcon } from "../../../../../../common/Icon/FireIcon";
import { FunnyFaceIcon } from "../../../../../../common/Icon/FunnyFaceIcon";
import { GuyWithTieIcon } from "../../../../../../common/Icon/GuyWithTieIcon";
import { HandsIcon } from "../../../../../../common/Icon/HandsIcon";
import { HandshakeIcon } from "../../../../../../common/Icon/HandshakeIcon";
import { HappyFaceIcon } from "../../../../../../common/Icon/HappyFaceIcon";
import { SantaIcon } from "../../../../../../common/Icon/SantaIcon";
import { SuitCaseIcon } from "../../../../../../common/Icon/SuitCaseIcon";
import useLocalStorage from "../../../../../hooks/useLocalStorage";
import { setToneAction } from "../../../../../store/actions/draftActions";
import { selectUserDetails } from "../../../../../store/reducers/AuthReducer";
import { RootState, useAppDispatch } from "../../../../../store/store";
import { StyledSelect } from "./styles";
import { Tone } from "./types";

const IconByTone = {
  [Tone.Professional]: <SuitCaseIcon />,
  [Tone.ProfessionalInformal]: <GuyWithTieIcon />,
  [Tone.Casual]: <HappyFaceIcon />,
  [Tone.Urgent]: <FireIcon />,
  [Tone.Appreciative]: <HandsIcon />,
  [Tone.Funny]: <FunnyFaceIcon />,
  [Tone.Professional_Friendly]: <HandshakeIcon />,
  [Tone.Easter_Egg]: <SantaIcon />,
};

const LabelByTone = {
  [Tone.Professional]: "Formal",
  [Tone.Professional_Friendly]: "Prof. friendly",
  [Tone.ProfessionalInformal]: "Professional",
  [Tone.Casual]: "Casual",
  [Tone.Urgent]: "Urgent",
  [Tone.Appreciative]: "Appreciative",
  [Tone.Funny]: "Funny",
  [Tone.Easter_Egg]: "Santa Claus",
};

const getEmailStyleTextAndIcon = (emailStyleOption: string) => {
  return (
    <>
      <Box marginRight={"5px"} display={"flex"}>
        {IconByTone[emailStyleOption as Tone]}
      </Box>
      <Typography overflow={"hidden"} textOverflow={"ellipsis"} fontSize={"10px"}>
        {LabelByTone[emailStyleOption as Tone]}
      </Typography>
    </>
  );
};

export const emailStyleOptions = [
  { key: Tone.Professional, text: getEmailStyleTextAndIcon(Tone.Professional) },
  {
    key: Tone.ProfessionalInformal,
    text: getEmailStyleTextAndIcon(Tone.ProfessionalInformal),
  },
  {
    key: Tone.Professional_Friendly,
    text: getEmailStyleTextAndIcon(Tone.Professional_Friendly),
  },
  { key: Tone.Casual, text: getEmailStyleTextAndIcon(Tone.Casual) },
  { key: Tone.Urgent, text: getEmailStyleTextAndIcon(Tone.Urgent) },
  { key: Tone.Appreciative, text: getEmailStyleTextAndIcon(Tone.Appreciative) },
  { key: Tone.Funny, text: getEmailStyleTextAndIcon(Tone.Funny) },
  // {
  //   key: Tone.Easter_Egg,
  //   text: getEmailStyleTextAndIcon(Tone.Easter_Egg),
  // },
];

export const EmailStyleSelector = () => {
  const userDetails = useSelector(selectUserDetails);
  const [toneOnLocalStorage, setToneOnLocalStorage] = useLocalStorage<string>(`${userDetails?.email}_tone`, "");

  const tone = useSelector((state: RootState) => state.draft.tone);
  const gaId = userDetails?.ganalytics_id;
  const loadingDraft = useSelector((state: RootState) => state.draft.isLoading);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (toneOnLocalStorage) {
      dispatch(
        setToneAction({
          tone: toneOnLocalStorage as Tone,
          userId: gaId as string,
        }),
      );
    }
  }, [toneOnLocalStorage]);

  return (
    <Box paddingRight={0} width={"38%"}>
      <StyledSelect
        IconComponent={ExpandMoreIcon}
        value={tone}
        variant="standard"
        disableUnderline
        defaultValue={tone}
        disabled={loadingDraft}
        MenuProps={{
          PaperProps: {
            sx: {
              borderRadius: "10px",
              border: "1px solid #E8E7FF",
              "& .MuiMenu-list": {
                padding: "8px",
                "& .MuiMenuItem-root": {
                  padding: "3px 10px 3px 10px",
                  "& .MuiTypography-root": {
                    fontSize: "14px",
                    padding: "3px",
                  },
                  borderRadius: "6px",
                  "&:hover": {
                    backgroundColor: "#E8E7FF",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "#FFFFFF",
                    color: "#7468FF",
                    textDecoration: "underline",
                  },
                },
              },
            },
          },
        }}
        onChange={(event: SelectChangeEvent<unknown>) => {
          setToneOnLocalStorage(event.target.value as string);
          dispatch(
            setToneAction({
              tone: event.target.value as string,
              userId: gaId as string,
            }),
          );
        }}
      >
        {emailStyleOptions.map((option) => (
          <MenuItem key={option.key} value={option.key} sx={{ minHeight: "20px" }}>
            {option.text}
          </MenuItem>
        ))}
      </StyledSelect>
    </Box>
  );
};
