import { Dispatch, Middleware, MiddlewareAPI } from "redux";
import { fetchToken } from "../actions/authAction";
import { setIsLoading } from "../reducers/AuthReducer";
import { ThunkDispatch, AnyAction } from "@reduxjs/toolkit";
import { checkIfTokenIsExpired } from "../../utils/datetime";
import { RootState } from "../store";

/**
 * Middleware that automatically refreshes the JWT token if it's about to expire.
 */
const jwtRefreshMiddleware: Middleware<{}, any, Dispatch> = ({
  dispatch,
  getState,
}: MiddlewareAPI<ThunkDispatch<any, void, AnyAction>, any>) => {
  return (next: any) => (action: any) => {
    if (typeof action === "function") {
      const state = getState() as RootState;
      const token = state.auth.token;
      const expiry = state.auth.tokenExpiry;
      if (token) {
        if (checkIfTokenIsExpired(parseInt(expiry ?? "0"))) {
          const isStillRefreshing = getState().auth.isLoading;
          if (!isStillRefreshing) {
            // Set loading to true to prevent multiple refreshes
            dispatch(setIsLoading(true));
            dispatch(fetchToken()).then(() => {
              return next(action);
            });
          }
        }
      }
    }
    return next(action);
  };
};

export default jwtRefreshMiddleware;
