import * as Sentry from "@sentry/browser";
import { exchangeToken } from "@platformSpecific/sidebar/apis/exchangeToken";

import jwtDecode from "jwt-decode";
import { getWithExpiry, setWithExpiry } from "./localStorage";
import { getEmail, getName, getOutlookToken } from "@platformSpecific/sidebar/utils/officeMisc";

export const BACKEND_TOKEN = "authToken";
export const OFFICE_CORE_DATA = "officeCoreData";

export const formatAPIStructure = (apiParams: any, token: string, method = "POST") => {
  return {
    body: JSON.stringify(apiParams),
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };
};

export const formatAPIStructureForAxios = (url: string, apiParams: any, token: string) => {
  return {
    url,
    body: apiParams,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };
};

export const getBackendTokenAPI = async (senderName: string, senderAddress: string) => {
  return new Promise<{ data: string | null }>((resolve) => {
    getOutlookToken(async (token: any) => {
      if (!token) {
        resolve({ data: null });
        return;
      }
      const res = await exchangeToken(token, senderName, senderAddress);
      if (!res?.token) {
        resolve({ data: null });
        return;
      }
      resolve({ data: res?.token });
    });
  });
};

export const getAuthToken = async () => {
  const senderName = getName();
  const senderAddress = getEmail();
  const platform_type = process.env.PLATFORM_TYPE;

  // We only cache the token for Outlook
  // TODO: In gmail we don't have the user email At this point.
  //    So we can't store the token based on user email.
  const tokenKey = `${BACKEND_TOKEN}-${senderAddress}`;
  if (platform_type === "outlook_addin") {
    let tokenData = getWithExpiry(tokenKey);
    if (tokenData) {
      const decoded: { exp?: number } = jwtDecode(tokenData.value as string);
      return {
        token: tokenData.value,
        expiry: decoded.exp?.toString() ?? null,
      };
    }
  }

  let retry = 0;
  const maxRetries = 1; // Number of retry attempts

  while (retry <= maxRetries) {
    try {
      let resultToken = await getBackendTokenAPI(senderName, senderAddress);
      const decoded: { exp?: number } = jwtDecode(resultToken.data as string);
      if (platform_type === "outlook_addin") {
        // cache token for 1 hour (3600 seconds)
        setWithExpiry(tokenKey, resultToken.data, 3600 * 1000);
      }
      return {
        token: resultToken.data,
        expiry: decoded.exp?.toString() ?? null,
      };
    } catch (error) {
      if (retry === maxRetries) {
        Sentry.captureException(error); // Capture error if we've exhausted retries
        throw error;
      }
      // Retry after a delay (2 seconds)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      retry++;
    }
  }
  return null;
};
