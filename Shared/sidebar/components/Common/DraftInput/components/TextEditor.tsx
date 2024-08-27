import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import type { Delta as DeltaType } from "quill";
import "quill-paste-smart";
import React, { useEffect, useRef } from "react";
import ReactQuill, { Quill } from "react-quill";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { usePrevious } from "../../../../hooks/usePrevious";
import { setUserDraftForInputAction } from "../../../../store/actions/draftActions";
import { selectDraftAction } from "../../../../store/reducers/AppReducer";
import {
  selectDeltaChange as selectPartialTextEditingDeltaChange,
  setDeltaChange as setDeltaChangeForPartialTextEditing,
} from "../../../../store/reducers/PartialTextEditingReducer";
import {
  selectTextShortcuts,
  selectDeltaChange as selectTextShortcutsDeltaChange,
  setCurrentCursorIndex,
  setDeltaChange as setDeltaChangeForTextShortcuts,
  setShowDialog,
} from "../../../../store/reducers/TextShortcutsReducer";
import { RootState } from "../../../../store/store";

import { fetchUserTextShortcuts } from "../../../../store/actions/textShortcutsActions";
import { selectCurrentUserDraft } from "../../../../store/reducers/DraftReducer";
import { getPlaceholderAndButtonMessage } from "../../../Screens/DraftScreen/DraftInput";
import { selectFontPreferences } from "../../../../store/reducers/AuthReducer";
const Delta = Quill.import("delta") as typeof DeltaType;

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

const TextEditor: React.FC = ({}) => {
  const partialTextEditingDeltaChange = useSelector(selectPartialTextEditingDeltaChange);
  const textShortcutsDeltaChange = useSelector(selectTextShortcutsDeltaChange);
  const textShortcuts = useSelector(selectTextShortcuts);
  const draftAction = useSelector(selectDraftAction);
  const currentUserDraft = useSelector(selectCurrentUserDraft);
  const previousDraft = usePrevious(currentUserDraft?.userDraft);
  const userDetails = useSelector((state: any) => state.auth.userDetails);
  const fontPreferences = useSelector(selectFontPreferences);

  const quillRef = useRef<ReactQuill | null>(null);
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  // useEffect(() => {
  //   registerBlockWithFontPreferences(
  //     fontPreferences?.family || "Arial",
  //     fontPreferences?.style || "normal",
  //     fontPreferences?.size || "13px",
  //     fontPreferences?.color || "#131313",
  //   );
  // }, [fontPreferences]);

  useEffect(() => {
    const { placeholder } = getPlaceholderAndButtonMessage(draftAction, userDetails?.first_name);

    if (quillRef.current && quillRef.current.getEditor()) {
      quillRef.current.getEditor().root.dataset.placeholder = placeholder || "";
    }
  }, [quillRef, userDetails, draftAction]);

  const modules = {
    toolbar: false,
  };

  const handleEditorChange = (content: string) => {
    dispatch(setUserDraftForInputAction(content));
  };

  /* Update editor value with value coming from already in progress draft on outlook (HTML) */
  useEffect(() => {
    if (!previousDraft) {
      dispatch(setUserDraftForInputAction(currentUserDraft?.userDraft as string));
    }
  }, [currentUserDraft?.userDraft]);

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

  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      quill.on("text-change", () => {
        const content = quill.getText();
        textShortcuts.forEach((shortcut) => {
          const start = content.toLowerCase().indexOf(`${shortcut.tag.toLowerCase()} `);
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

  // Update the editor's content when the delta changes
  useEffect(() => {
    if (textShortcutsDeltaChange) {
      const quill = quillRef.current?.getEditor();
      if (quill) {
        console.log("delta");
        quill.updateContents(textShortcutsDeltaChange);
        const length = quill.getLength();
        quill.setSelection(length, 0);
        dispatch(setDeltaChangeForTextShortcuts(null));
      }
    }
    if (partialTextEditingDeltaChange) {
      const quill = quillRef.current?.getEditor();
      if (quill) {
        console.log("delta");
        quill.updateContents(partialTextEditingDeltaChange);
        dispatch(setDeltaChangeForPartialTextEditing(null));
      }
    }
  }, [partialTextEditingDeltaChange, textShortcutsDeltaChange]);

  return (
    <CustomQuillEditorWrapper
      style={{
        height: "100%",
        resize: "none",
        wordBreak: "break-word",
        borderRadius: "10px",
        background: "#ffffff",
        border: "1px solid #e8e7ff",
        overflowX: "auto",
      }}
      {...(currentUserDraft && { defaultValue: currentUserDraft?.userDraft })}
      {...(currentUserDraft && { value: currentUserDraft?.userDraft })}
      ref={quillRef}
      modules={modules}
      onChange={handleEditorChange}
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
    height: 97%;
  }
  .ql-clipboard {
    display: none;
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
    user-select: text;
  }
  .ql-editor {
    height: 100%;
    max-height: 100%;
    background: #ffffff;
    border-radius: 10px;
    padding: 0 15px;
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
    &.ql-blank::before {
      color: #999999;
      content: attr(data-placeholder);
      white-space: break-spaces;
      font-style: italic;
      left: 15px;
      pointer-events: none;
      position: absolute;
      right: 15px;
      margin: 0 15px;
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
