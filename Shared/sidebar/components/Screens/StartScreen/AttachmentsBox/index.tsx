import React, { useEffect } from "react";
import { PermissionHOC } from "../../../Common/PermissionHOC";
import { SelectChangeEvent } from "@mui/material";
import { isMobileApp } from "@platformSpecific/sidebar/utils/office";
import { useSelector } from "react-redux";
import { outlookItemStats } from "../../../../store/actions/authAction";
import { Screen, selectItemId, setScreen } from "../../../../store/reducers/AppReducer";
import { setSelectedAttachmentId } from "../../../../store/reducers/AttachmentsReducer";
import { selectUserPermissions } from "../../../../store/reducers/AuthReducer";
import { RootState, useAppDispatch } from "../../../../store/store";
import { AttachmentsUI } from "./AttachmentsUI";

interface AttachmentsBoxProps {
  icon: React.ReactNode;
  notAccessible: boolean;
}

export const AttachmentsBox: React.FC<AttachmentsBoxProps> = ({ icon, notAccessible }) => {
  const attachments = useSelector((state: RootState) => state.attachments.attachments);
  const itemId = useSelector(selectItemId);
  const userPermissions = useSelector(selectUserPermissions);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Store attachment stats in backend
    if (userPermissions?.can_summarize_attachments) {
      //@ts-ignore
      dispatch(outlookItemStats(attachments));
    }
  }, [itemId]);

  if (attachments.length === 0 || isMobileApp()) {
    return null;
  }

  const onSummarizeClick = () => {
    dispatch(setScreen(Screen.AttachmentsSummary));
  };

  const onUpgradeToPremiumClick = () => {
    dispatch(setScreen(Screen.SubscriptionExpired));
  };

  const onSelectAttachment = (event: SelectChangeEvent<unknown>) => {
    dispatch(setSelectedAttachmentId(event.target.value as string));
  };

  return (
    <AttachmentsUI
      icon={icon}
      notAccessible={notAccessible}
      onSummarizeClick={onSummarizeClick}
      onUpgradeToPremiumClick={onUpgradeToPremiumClick}
      onSelectAttachment={onSelectAttachment}
    />
  );
};

export const PermissionedAttachmentsBox = PermissionHOC(AttachmentsBox, "can_summarize_attachments");
