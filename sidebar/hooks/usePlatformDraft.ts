import { isMac } from "@fluentui/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../Shared/sidebar/store/store";
import { splitOutlookNativeDraft, splitOutlookWebDraft } from "../../../Shared/sidebar/utils/html";
import { replacePWithLiTags } from "../utils/office";
import { OfficeModes } from "./usePlatformMetadata";
import { selectShowDraftOptions } from "../../../Shared/sidebar/store/reducers/DraftReducer";

export const usePlatformDraft = () => {
  const [officeValues, setOfficeValues] = useState({
    userInput: "",
    prevThread: "",
    signature: "",
    fullHtml: "",
  });
  // This can be used to get the current host (web, windows, mac, etc)
  // Possible values:
  // "Outlook" -> Mac and Windows client  TODO: To be confirmed for Windows
  // "OutlookWebApp" -> Outlook Web
  // "OutlookIOS" -> Outlook for iOS
  // "OutlookAndroid" -> Outlook for Android
  const host = Office.context.mailbox.diagnostics.hostName;
  const mode = useSelector((state: RootState) => state.app.mode);
  const showDraftOptions = useSelector(selectShowDraftOptions);

  useEffect(() => {
    // Get current draft from office only in WRITE_VIEW mode
    if (mode === OfficeModes.WRITE_VIEW) {
      Office.context.mailbox.item!.body.getAsync(
        "html",
        { asyncContext: "This is passed to the callback" },
        function (result) {
          // This part is for the case when we get the full thread instead of only the written draft
          // It happens often on mac and windows clients and "sometimes" on web.
          // The idea is to remove the previous part thread and put it back to the generated text later.
          let prevThread = "";
          let messageToImprove = "";
          let signature = "";
          if (host === "OutlookWebApp" || host === "newOutlookWindows") {
            // web way to split body from previous emails
            ({ prevThread, messageToImprove, signature } = splitOutlookWebDraft(result.value));
          } else if (host === "Outlook") {
            // MacOS and Win11 way
            ({ prevThread, messageToImprove, signature } = splitOutlookNativeDraft(result.value));

            if (isMac()) {
              messageToImprove = replacePWithLiTags(messageToImprove);
            }
          }

          setOfficeValues({
            userInput: messageToImprove,
            prevThread,
            signature,
            fullHtml: result.value,
          });
        },
      );
    }
  }, [mode, showDraftOptions]);

  return officeValues;
};
