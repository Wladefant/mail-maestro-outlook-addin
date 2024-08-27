import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import thunkMiddleware from "redux-thunk";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import jwtRefreshMiddleware from "./middlewares/jwtRefreshMiddleware";
import * as Sentry from "@sentry/react";

import rootReducer from "./reducers";

const sentryReduxEnhancer = Sentry.createReduxEnhancer({});

const rootPersistConfig = {
  key: "root",
  storage,
  whitelist: ["attachments"],
};

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: [jwtRefreshMiddleware, thunkMiddleware],
  enhancers: [sentryReduxEnhancer],
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;
export const persistor = persistStore(store);
