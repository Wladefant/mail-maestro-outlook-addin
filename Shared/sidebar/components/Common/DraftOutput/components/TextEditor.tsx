import { isMobileApp } from "@platformSpecific/sidebar/utils/office";
import { isNativeApp } from "@platformSpecific/sidebar/utils/officeMisc";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import type { Delta as DeltaType } from "quill";
import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import TurndownService from "turndown";
import { updateEmailStatuses } from "../../../../apis/draft";
import { fetchUserTextShortcuts } from "../../../../store/actions/textShortcutsActions";
import { selectToken, selectUserDetails } from "../../../../store/reducers/AuthReducer";
import {
  Draft,
  updateSelectedDraftHtmlBody,
  updateSelectedDraftMarkdownBody,
  updateSelectedDraftStringBody,
} from "../../../../store/reducers/DraftReducer";
import {
  SelectionRange,
  selectAllowHighlighting,
  selectDeltaChange as selectPartialTextEditingDeltaChange,
  selectQuillClipboardModule,
  selectSelectionRange,
  setButtonYPosition,
  setMenuYPosition,
  setQuillClipboardModule,
  setSelectedText,
  setSelectionRange,
} from "../../../../store/reducers/PartialTextEditingReducer";
import {
  selectTextShortcuts,
  selectDeltaChange as selectTextShortcutsDeltaChange,
  setCurrentCursorIndex,
  setShowDialog,
} from "../../../../store/reducers/TextShortcutsReducer";
import { RootState } from "../../../../store/store";
import { convertMarkdownToHTML } from "../../../../utils/html";
import { getTextWithDoubleLinebreaks } from "../../../../utils/string";

const Delta = Quill.import("delta") as typeof DeltaType;

type Props = {
  selectedOption: number;
  drafts: Draft[];
  draftId: string | undefined | null;
  selectedRequestId: string | undefined | null;
};
const turndownService = new TurndownService();

const BlockPrototype = Quill.import("blots/block");

// const registerBlockWithFontPreferences = (font: string, style: string, size: string, color: string) => {
//   class CustomBlock extends BlockPrototype {
//     constructor(domNode, value) {
//       super(domNode, value);
//       this.format("size", size);
//       this.format("font", font);
//       this.format("color", color);
//       this.format("style", style);
//     }
//
//     static tagName = "P";
//
//     format(name, value) {
//       if (name === "size") {
//         this.domNode.style.fontSize = value;
//       } else if (name === "font") {
//         this.domNode.style.fontFamily = value;
//       } else if (name === "color") {
//         this.domNode.style.color = value;
//       } else if (name === "style") {
//         this.domNode.style.fontStyle = value;
//       } else {
//         super.format(name, value);
//       }
//     }
//   }
//
//   Quill.register(CustomBlock, true);
// };

const TextEditor: React.FC<Props> = ({ selectedOption, drafts, draftId, selectedRequestId }) => {
  const authToken = useSelector(selectToken);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const selectionRange = useSelector(selectSelectionRange);
  const allowHighlighting = useSelector(selectAllowHighlighting);
  const partialTextEditingDeltaChange = useSelector(selectPartialTextEditingDeltaChange);
  const textShortcutsDeltaChange = useSelector(selectTextShortcutsDeltaChange);
  const textShortcuts = useSelector(selectTextShortcuts);
  const userDetails = useSelector(selectUserDetails);

  // TODO: This can be used to deactivate the feature for some users
  //    Partial Editing is disbaled on mobile devices
  const highlightColor = isMobileApp() ? "#FFF" : "#E8E7FF";
  const clipboard = useSelector(selectQuillClipboardModule);
  // const fontPreferences = useSelector(selectFontPreferences);

  // useEffect(() => {
  //   registerBlockWithFontPreferences(
  //     fontPreferences?.family || "Arial",
  //     fontPreferences?.style || "normal",
  //     fontPreferences?.size || "13px",
  //     fontPreferences?.color || "#131313",
  //   );
  // }, [fontPreferences]);

  const quillRef = useRef<ReactQuill | null>(null);
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  const draft = drafts[selectedOption];

  const modules = {
    toolbar: false,
  };

  const isNative = isNativeApp();

  const hasFreeSubscription = userDetails?.subscription?.type === "FREE";

  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const clipboard = quill.clipboard;
      dispatch(setQuillClipboardModule(clipboard));
    }
  }, [selectedOption]);

  const handleMouseUp = () => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const selection = quill.getSelection();

      if (selection && selection.length !== 0) {
        dispatch(setSelectionRange(selection as SelectionRange));
        const { index, length } = selection;
        //@ts-ignore
        const selectedText = quill.getText(index, length);
        const nextCharIndex = index + length;
        const nextChar = quill.getText(nextCharIndex, 1);
        const previousChar = quill.getText(index - 1, 1);
        const lastCharIndex = selection.index + selection.length - 1;

        quill.formatText(0, draft?.formatted_html_body?.length as number, {
          background: "transparent",
        });

        dispatch(
          setSelectedText({
            text: selectedText,
            hasFinalLineBreak: nextChar === "\n",
            hasInitialLineBreak: previousChar === "\n",
          }),
        );

        const lastLineBounds = quill.getBounds(lastCharIndex);
        if (lastLineBounds.top + 15 > 400) {
          dispatch(setMenuYPosition(lastLineBounds.top - 15 - 250 + (isNative ? 50 : 50)));
        } else {
          dispatch(setMenuYPosition(lastLineBounds.top + 15 + (isNative ? 5 : 0)));
        }

        quill.formatText(selection.index, selectedText.length, {
          background: highlightColor,
        });
      }
    }
  };

  const onCopy = async (e: any) => {
    if (userDetails?.subscription?.type === "FREE") {
      e.preventDefault();
      return;
    }
    if (quillRef.current) {
      e.preventDefault();
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      // This prevents from copying formatting like the font and background color
      if (range) {
        const text = quill.getText(range.index, range.length);
        const textToCopy = getTextWithDoubleLinebreaks(text);
        e.clipboardData.setData("text/plain", textToCopy);
      }
    }
    await updateEmailStatuses(
      {
        draft_id: draftId ?? "",
        draft_status: "copied",
        request_id: draft?.request_id,
        request_status: "accepted",
      },
      authToken,
    );
  };

  const handleEditorChange = (content: string) => {
    // Quill editor adds a <p><br></p> tag when the editor is empty
    if (draft && content !== "<p><br></p>") {
      const markdown = turndownService.turndown(content);
      dispatch(updateSelectedDraftHtmlBody(content));
      dispatch(updateSelectedDraftMarkdownBody(markdown));
    }
  };

  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      quill.on("text-change", () => {
        const content = quill.getText();
        textShortcuts.forEach((shortcut) => {
          const start = content.indexOf(`${shortcut.tag} `);
          if (start === -1) {
            return;
          }

          const formattedSnippet = shortcut.snippet.replace(/\n\r/g, "");
          const paragraphMatches = formattedSnippet.match(/\n/g);
          const numberOfParagraphs = paragraphMatches ? paragraphMatches.length : 0;
          const delta = new Delta({ ops: [] })
            .retain(start as number)
            .delete(shortcut.tag.length)
            .insert(formattedSnippet)
            .insert(" ");
          quill.updateContents(delta);
          setTimeout(() => quill.setSelection(start + formattedSnippet.length - numberOfParagraphs + 1, 0), 0);
        });
      });
    }
  }, [quillRef.current]);

  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      quill.on("text-change", (_delta, _oldDelta, source) => {
        // Check if the change is a user input
        if (source === "user") {
          // Get the current cursor position
          const cursorPosition = quill.getSelection()?.index;
          if (cursorPosition != null && cursorPosition > 0) {
            // Get the text before the cursor
            const textBeforeCursor = quill.getText(0, cursorPosition);

            // Check the character before "!" (if there is one) and the character at the cursor (should be "!")
            const charBeforeExclamation = textBeforeCursor[cursorPosition - 2]; // Character before "!"
            const charAtCursor = textBeforeCursor[cursorPosition - 1]; // Character at the cursor ("!")

            // Check if the "!" is at the start of a new line or after a space
            if (
              (charAtCursor === "!" && (charBeforeExclamation === "\n" || charBeforeExclamation === " ")) ||
              (cursorPosition === 1 && charAtCursor === "!")
            ) {
              dispatch(setCurrentCursorIndex(cursorPosition - 1));
              // Dispatch an action to open the dialog
              dispatch(setShowDialog(true));
            } else {
              dispatch(setCurrentCursorIndex(cursorPosition));
            }
          }
        }
      });
    }
  }, [quillRef.current, dispatch]);

  useEffect(() => {
    const fetchTextShortcuts = async () => {
      try {
        await dispatch(fetchUserTextShortcuts()).unwrap();
      } catch (error) {
        console.error("Error fetching text shortcuts.", error);
      }
    };
    textShortcuts.length === 0 && fetchTextShortcuts();
  }, [dispatch]);

  const handleScroll = () => {
    if (!quillRef.current) {
      return setShouldAutoScroll(false);
    }
    const quillInstance = quillRef.current.getEditor();
    const editorContainer = quillInstance.root;
    if (quillRef.current && editorContainer.scrollTop + editorContainer.clientHeight !== editorContainer.scrollHeight) {
      setShouldAutoScroll(false);
    } else {
      setShouldAutoScroll(true);
    }
  };

  const userDraft = useMemo(() => {
    const parsed = convertMarkdownToHTML(draft?.mail_body);

    if (!draft?.finished || !draft?.formatted_html_body) {
      return parsed;
    }

    return draft?.formatted_html_body;
  }, [draft?.formatted_html_body, draft?.mail_body, draft?.finished, selectedOption, draft?.formatted_html_body]);

  /* Event listeners for Editor */

  // Attach onMouseUp event listener to the editor
  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      quill.root.addEventListener("mouseup", handleMouseUp);
      return () => {
        quill.root.removeEventListener("mouseup", handleMouseUp);
      };
    }
    return;
  }, [handleMouseUp, quillRef.current]);

  // Attach onCopy event listener to the editor
  useEffect(() => {
    if (quillRef.current) {
      const quillInstance = quillRef.current.getEditor();
      const editorRoot = quillInstance.root;

      editorRoot.addEventListener("copy", onCopy);

      return () => {
        editorRoot.removeEventListener("copy", onCopy);
      };
    }
    return () => {};
  }, [draftId, authToken, draft?.request_id]);

  // Attach onScroll event listener to the editor
  useEffect(() => {
    if (quillRef.current) {
      const quillInstance = quillRef.current.getEditor();
      const editorRoot = quillInstance.root;

      editorRoot.addEventListener("scroll", handleScroll);

      return () => {
        editorRoot.removeEventListener("scroll", handleScroll);
      };
    }
    return () => {};
  }, [quillRef.current, handleScroll]);

  // Scroll to bottom of the editor
  useEffect(() => {
    if (quillRef.current && shouldAutoScroll && !draft?.finished) {
      const quillInstance = quillRef.current.getEditor();
      const editorContainer = quillInstance.root;
      // Scroll the textarea to the bottom
      editorContainer.scrollTop = editorContainer.scrollHeight;
    }
  }, [userDraft]);

  // Scroll to bottom of the editor
  useEffect(() => {
    if (quillRef.current) {
      const quillInstance = quillRef.current.getEditor();
      const lines = quillInstance.getLines();
      const lastLine = lines[lines.length - 1];
      const lastLineIndex = quillInstance.getIndex(lastLine);
      const lastLineBounds = quillInstance.getBounds(lastLineIndex);
      dispatch(setButtonYPosition(lastLineBounds.bottom));
    }
  }, [userDraft]);

  // Update the editor's content when the selected draft changes
  useEffect(() => {
    if (draft) {
      if (!draft?.formatted_html_body) {
        const parsed = convertMarkdownToHTML(draft?.mail_body);
        dispatch(updateSelectedDraftHtmlBody(parsed));
      }
      const quill = quillRef.current?.getEditor();
      if (quill) {
        quill.formatText(0, draft?.formatted_html_body?.length as number, {
          background: "transparent",
        });
      }
    }
  }, [selectedOption]);

  //Update draft's html body when the draft is finished
  useEffect(() => {
    if (draft && draft.request_id === selectedRequestId) {
      const parsed = convertMarkdownToHTML(draft?.mail_body);
      dispatch(updateSelectedDraftHtmlBody(parsed));
    }
  }, [draft?.finished]);

  // Update string content when html body changes (for the purpose of calculating the highlighting indexes)
  useEffect(() => {
    if (draft) {
      const quillInstance = quillRef?.current?.getEditor();
      if (quillInstance) {
        const text = quillInstance.getText();
        dispatch(updateSelectedDraftStringBody(text));
      }
    }
  }, [draft?.formatted_html_body]);

  // Update the editor's highlight formatting when the selection range changes
  useEffect(() => {
    if (!selectionRange) {
      const quill = quillRef.current?.getEditor();
      if (quill) {
        quill.formatText(0, draft?.formatted_html_body?.length as number, {
          background: "transparent",
        });
      }
    }
  }, [selectionRange]);

  // Update the editor's content when the delta changes
  useEffect(() => {
    if (textShortcutsDeltaChange) {
      const quill = quillRef.current?.getEditor();
      if (quill) {
        console.log("delta");
        quill.updateContents(textShortcutsDeltaChange);
        const length = quill.getLength();
        quill.setSelection(length, 0);
      }
    }
    if (partialTextEditingDeltaChange) {
      const quill = quillRef.current?.getEditor();
      if (quill) {
        console.log("delta");
        quill.updateContents(partialTextEditingDeltaChange);
      }
    }
  }, [partialTextEditingDeltaChange, textShortcutsDeltaChange]);

  /*  */

  return (
    <CustomQuillEditorWrapper
      style={{
        height: `calc(100% - ${hasFreeSubscription ? 24 : 50}px)`,
        marginTop: hasFreeSubscription ? "24px" : "50px",
        resize: "none",
        wordBreak: "break-word",
        borderRadius: "0 10px 0 0",
        background: "#ffffff",
        border: "1px solid #e8e7ff",
        overflowX: "auto",
      }}
      value={userDraft}
      ref={quillRef}
      modules={modules}
      readOnly={allowHighlighting}
      onChange={handleEditorChange}
      onChangeSelection={handleMouseUp}
    />
  );
};

export default TextEditor;

const CustomQuillEditorWrapper = styled(ReactQuill)`
  &::-webkit-scrollbar {
    border-radius: 4px;
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: #7468ff;
    border-radius: 4px;
  }
  .ql-container {
    height: 100%;
  }
  .ql-clipboard {
    display: none;
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
    user-select: text;
  }
  .ql-editor {
    background: #ffffff;
    border-radius: 10px;
    padding: 15px;
    font-family: Inter;
    font-style: normal;
    font-weight: 400;
    font-size: 13px;
    line-height: 16px;
    color: #131313;
    word-break: break-word;
    p {
      text-align: left;
    }
    &:focus {
      outline: none;
      &::-webkit-input-placeholder {
        color: transparent;
      }
    }
    &::-webkit-scrollbar {
      border-radius: 4px;
      width: 5px;
    }
    &::-webkit-scrollbar-thumb {
      background: #7468ff;
      border-radius: 4px;
    }
  }
`;
