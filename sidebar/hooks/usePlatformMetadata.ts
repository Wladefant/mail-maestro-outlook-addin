import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserDetailsIfNeeded } from "../../../Shared/sidebar/store/actions/authAction";
import { NEW_EMAIL_CONVERSATION_ID, selectNewConversation } from "../../../Shared/sidebar/store/actions/draftActions";
import {
  selectItemId,
  setCCRecipients,
  setFrom,
  setIsReply,
  setItem,
  setItemId,
  setMode,
  setRecipients,
  setSubject,
} from "../../../Shared/sidebar/store/reducers/AppReducer";
import { selectToken } from "../../../Shared/sidebar/store/reducers/AuthReducer";
import {
  resetGeneratedDrafts,
  resetUserDraft,
  selectConversationId,
  setConversationId,
} from "../../../Shared/sidebar/store/reducers/DraftReducer";
import { RootState } from "../../../Shared/sidebar/store/store";
import { setTemplateId } from "../../../Shared/sidebar/store/reducers/MagicTemplateReducer";
import * as Sentry from "@sentry/browser";
import { doesConversationExist, getItemId } from "../utils/office";
import { waitASecond } from "../utils/time";

export enum OfficeModes {
  READ_VIEW = "READ_VIEW",
  WRITE_VIEW = "WRITE_VIEW",
}

export const usePlatformMetadata = () => {
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  let conversationId = useSelector(selectConversationId);
  let itemId = useSelector(selectItemId);
  const token = useSelector(selectToken);

  const fetchUserData = async () => {
    if (token) {
      dispatch(fetchUserDetailsIfNeeded(token));
    }
  };

  const changeHandler = async (item: any) => {
    let newConversationId = item?.initialData?.conversationId;
    let newItemId = item?.initialData?.id;

    if (!newConversationId) {
      Sentry.captureMessage(
        "item.initialData on Outlook changeHandler not available. Retrying with mailbox.item.",
        "warning",
      );
      await waitASecond();
      newConversationId = Office.context.mailbox.item?.conversationId;
      newItemId = await getItemId();
    }

    let isReply = false;
    if (Office.context.mailbox?.item?.subject?.getAsync != null) {
      // in write mode
      isReply = await doesConversationExist(newConversationId);
    } else {
      // in read mode
      isReply = true;
    }

    if (isReply && !newConversationId) {
      Sentry.captureMessage("mailbox.item on Outlook changeHandler also not available.", "error");
      return;
    }

    await dispatch(selectNewConversation(newConversationId, newItemId, undefined, isReply));
    await dispatch(resetGeneratedDrafts());
    //await dispatch(resetUserDraft());
    await dispatch(setTemplateId(null));
    fetchUserData();
  };

  useEffect(() => {
    if (!token) return;

    const tmpItem = Office.context.mailbox.item as any;
    // Check if we are replying to a message
    conversationId = Office.context.mailbox.item!.conversationId;
    dispatch(resetUserDraft());
    dispatch(resetGeneratedDrafts());
    const conversationIdToStore = conversationId || NEW_EMAIL_CONVERSATION_ID;

    let tmpMode: string = "";
    if (Office.context.mailbox.item?.subject?.getAsync != null) {
      // in read mode
      tmpMode = OfficeModes.WRITE_VIEW;
    } else {
      // in compose mode
      tmpMode = OfficeModes.READ_VIEW;
    }
    dispatch(setMode(tmpMode as OfficeModes));

    // Apply change handler ony once
    // https://learn.microsoft.com/en-us/office/dev/add-ins/outlook/pinnable-taskpane?tabs=xmlmanifest#handling-ui-updates-based-on-currently-selected-message
    Office.context.mailbox.addHandlerAsync(Office.EventType.ItemChanged, changeHandler);

    // Set some values on Addin start
    // We need to handle both READ_VIEW and WRITE_VIEW
    if (tmpMode === OfficeModes.WRITE_VIEW) {
      // In WRITE_VIEW check if the conversation exists
      // Based on that we can determine if we are replying to a message
      doesConversationExist(conversationId).then((exists) => {
        dispatch(setConversationId(conversationIdToStore));
        dispatch(setItem(tmpItem));
        dispatch(setIsReply(exists));
      });

      // Set subject for selected item on Addin start
      tmpItem.subject.getAsync((result: any) => {
        dispatch(setSubject(result.value));
      });

      // get recipients
      tmpItem.to.getAsync((result: any) => {
        dispatch(setRecipients(result.value || []));
      });
      // get cc recipients
      tmpItem.cc.getAsync((result: any) => {
        dispatch(setCCRecipients(result.value || []));
      });
      tmpItem.getItemIdAsync((result: any) => {
        dispatch(setItemId(result.value));
      });
    } else {
      itemId = Office.context.mailbox.item!.itemId;
      dispatch(setConversationId(conversationIdToStore));
      dispatch(setItem(tmpItem));
      // In READ_VIEW we are always replying to a message
      dispatch(setIsReply(true));
      dispatch(setItemId(itemId));
      dispatch(setSubject(tmpItem.subject));
      dispatch(setFrom(tmpItem.from || null));
      dispatch(setRecipients(tmpItem.to || []));
      dispatch(setCCRecipients(tmpItem.cc || []));
    }
  }, [token]);
};
