import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import appReducer from "./reducers/app";
import customInstructionsReducer from "./reducers/customInstructions";
import dialogReducer from "./reducers/dialog";
import magicTemplateBuilderReducer from "./reducers/magicTemplateBuilder";
import signoffAndSignatureReducer from "./reducers/signoffAndSignature";
import textShortcutsReducer from "./reducers/textShortcuts";

export const store = configureStore({
  reducer: {
    dialog: dialogReducer,
    app: appReducer,
    signoffAndSignature: signoffAndSignatureReducer,
    magicTemplateBuilder: magicTemplateBuilderReducer,
    customInstructions: customInstructionsReducer,
    textShortcuts: textShortcutsReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch = () => useDispatch<AppDispatch>();
