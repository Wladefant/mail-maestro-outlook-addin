import { Box } from "@mui/material";
import React from "react";
import ReactDOM from "react-dom";
import { useSelector } from "react-redux";
import usePusher, { EventResponse } from "../../../../hooks/usePusher";
import { selectZoomLevel } from "../../../../store/reducers/AppReducer";
import { selectUserDetails } from "../../../../store/reducers/AuthReducer";
import { selectDraftId } from "../../../../store/reducers/DraftReducer";
import {
  PartialEditingStep,
  addFrameToPartialTextOutput,
  selectShowMenu,
  selectStep,
  setStep,
} from "../../../../store/reducers/PartialTextEditingReducer";
import { useAppDispatch } from "../../../../store/store";
import { EventName } from "../../../../utils/constants";
import { PartialTextEditingDialog } from "./PartialTextEditingDialog";
import { PartialTextEditingMenu } from "./PartialTextEditingOptionsMenu";
import { LoadingStep } from "./PartialTextEditingOptionsMenu/Steps/LoadingStep";
import { OptionsStep } from "./PartialTextEditingOptionsMenu/Steps/OptionsStep";
import { SelectionStep } from "./PartialTextEditingOptionsMenu/Steps/SelectionStep";

type PartialTextEditingProps = {
  yPos: number;
};

const steps: Record<PartialEditingStep, JSX.Element> = {
  [PartialEditingStep.OPTIONS]: <OptionsStep />,
  [PartialEditingStep.LOADING]: <LoadingStep />,
  [PartialEditingStep.SELECTION]: <SelectionStep />,
};

export const PartialTextEditing: React.FC<PartialTextEditingProps> = ({ yPos }) => {
  const showMenu = useSelector(selectShowMenu);
  const draftId = useSelector(selectDraftId);
  const dispatch = useAppDispatch();
  const zoomLevel = useSelector(selectZoomLevel);
  const step = useSelector(selectStep);

  const userDetails = useSelector(selectUserDetails);

  usePusher(
    {
      channelName: userDetails?.settings?.pusher_channel as string,
      eventName: EventName.IMPROVE_TEXT_PART,
    },
    (data: EventResponse) => {
      dispatch(setStep(PartialEditingStep.SELECTION));
      dispatch(
        addFrameToPartialTextOutput({
          ...data,
          draftId: draftId as string,
        }),
      );
    },
  );

  return zoomLevel >= 175 ? (
    <PartialTextEditingDialog showMenu={showMenu}>{steps[step] ?? null}</PartialTextEditingDialog>
  ) : (
    ReactDOM.createPortal(
      <Box position={"absolute"} bottom={"95px"} sx={{ backgroundColor: "#FFFFFF" }} left={"25px"}>
        <PartialTextEditingMenu open={showMenu} yPos={yPos}>
          {steps[step] ?? null}
        </PartialTextEditingMenu>
      </Box>,
      document.body,
    )
  );
};
