import { usePlatformDraft } from "@platformSpecific/sidebar/hooks/usePlatformDraft";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DraftAction, Screen, setScreen } from "../../../../../Shared/sidebar/store/reducers/AppReducer";
import { convertHTMLToText } from "../../../../../Shared/sidebar/utils/html";
import { canCallEwsAsync, getEmailThread, getPlatformType, pasteToOutlook } from "../../../utils/office";
import { getHostName, getHostVersion, getPlatform } from "../../../utils/officeMisc";

import {
  getConversationFromGraphAPIByConversationId,
  getGrahpAPITokenSilently,
  getMessageFromGraphAPIByItemId,
} from "@platformSpecific/sidebar/utils/graphAPI";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { htmlToText } from "html-to-text";
import { RootState } from "../../../../../Shared/sidebar/store/store";

function DebugScreen() {
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const isReply = useSelector((state: any) => state.app.isReply);
  const itemId = useSelector((state: any) => state.app.itemId);
  const conversationId = useSelector((state: any) => state.draft.conversationId);
  const mode = useSelector((state: any) => state.app.mode);
  const { userInput, prevThread, signature, fullHtml } = usePlatformDraft();
  const [previousThread, setPreviousThread] = React.useState<string | null>(null);
  const [ewsAccess, setEwsAccess] = React.useState<boolean>(false);
  const [graphAPIToken, setGraphAPIToken] = React.useState<string | null>(null);
  const [lastMessage, setLastMessage] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  useEffect(() => {
    const get = async () => {
      const tmpThread = await getEmailThread(conversationId);
      setPreviousThread(tmpThread);
      const tmpEwsAccess = await canCallEwsAsync();
      setEwsAccess(tmpEwsAccess as boolean);
    };
    get();
  }, []);

  const onConnectToGraphAPI = async () => {
    const graphAPIToken = await getGrahpAPITokenSilently();
    setGraphAPIToken(graphAPIToken);
  };

  const onGetConversationFromGraphAPI = async () => {
    const lastMessageFromGraphAPI = await getConversationFromGraphAPIByConversationId(conversationId, dispatch);
    setLastMessage(lastMessageFromGraphAPI ?? "");
  };

  const onGetMessageFromGraphAPI = async () => {
    const messageFromGraphAPI = await getMessageFromGraphAPIByItemId(itemId, dispatch);
    setMessage(messageFromGraphAPI ?? "");
  };
  const hostName = getHostName();
  const hostVersion = getHostVersion();

  return (
    <div>
      <h1>MailMaestro Debug Screen</h1>
      <button onClick={() => dispatch(setScreen(Screen.Start))}>Exit Debug Screen</button>

      <h3>Outlook interaction</h3>
      <button onClick={() => pasteToOutlook(mode, "REPLY" as DraftAction, "This is some text")}>
        Paste to Outlook
      </button>
      <h3>Platform Type</h3>
      <div>
        Platform Type: {getPlatformType()} <br />
        <br />
        Hostname: {hostName}
        <br />
        Host version: {hostVersion}
        <br />
        Platform: {getPlatform()}
      </div>
      <h3>Graph API</h3>

      <button onClick={onConnectToGraphAPI}>Sign In to GraphAPI</button>
      <br />
      <button onClick={onGetConversationFromGraphAPI}>Get Conversation</button>
      <br />
      <button onClick={onGetMessageFromGraphAPI}>Get Message</button>
      <h3>Token</h3>
      <p>{graphAPIToken}</p>
      <h3>Last Message</h3>
      <p>{htmlToText(lastMessage as string)}</p>
      <h3>Selected Message</h3>
      <p>{htmlToText(message as string)}</p>
      <h3>Mode</h3>
      <p>{isReply ? "Reply" : "Compose"}</p>
      <h3>Previous Thread</h3>
      <p>{ewsAccess ? "Yes" : "No"}</p>
      <p>{convertHTMLToText(previousThread as string)}</p>
      <h3>Get text written in Outlook</h3>
      <button>Get Outlook text</button>
      <h3>User Input HTML</h3>
      <div>{userInput}</div>
      <h3>User Input Text</h3>
      <div>{convertHTMLToText(userInput)}</div>
      <h3>User Signature</h3>
      <div dangerouslySetInnerHTML={{ __html: signature || "" }} />
      <h3>Previous Thread</h3>
      <div dangerouslySetInnerHTML={{ __html: prevThread || "" }} />
      <h3>Full Html</h3>
      <div>{fullHtml}</div>
    </div>
  );
}

export default DebugScreen;
