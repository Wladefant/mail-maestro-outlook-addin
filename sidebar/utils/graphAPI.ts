import { PublicClientApplication, InteractionRequiredAuthError } from "@azure/msal-browser";
import * as Sentry from "@sentry/browser";
import { setPlatformSetting, getPlatformSetting } from "./officeMisc";

// Configuration for Azure MSAL
export const msalConfig = {
  auth: {
    clientId: process.env.MS_GRAPH_CLIENT_ID,
    authority: "https://login.microsoftonline.com/common",
    redirectUri: process.env.MS_GRAPH_REDIRECT_URI,
  },
  cache: {
    cacheLocation: "localStorage",
  },
};
// @ts-ignore
export const msalInstance = new PublicClientApplication(msalConfig);

/*
 * Sign in with Microsoft Graph API.
 *
 * This opens the consent dialog for the user to sign in and grant permissions to the application.
 */
export async function getGraphAPITokenByPopup(): Promise<string | null> {
  const loginRequest = {
    scopes: ["user.read", "mail.read", "calendars.read"], // Specify scopes needed for your application
    prompt: "select_account", // Ensures the user can select an account and complete MFA
  };

  try {
    const loginResponse = await msalInstance.loginPopup(loginRequest);
    const accessToken = loginResponse.accessToken;
    const accounts = msalInstance.getAllAccounts();

    if (accounts.length > 0) {
      console.log("Account info: ", accounts[0]);
      await setPlatformSetting("graphAPIAccount", JSON.stringify(accounts[0]));
    }
    return accessToken;
  } catch (error) {
    Sentry.captureMessage(`Error getting Graph API token: ${error}`, "error");
    return null;
  }
}

/**
 * Logout from Microsoft Graph API.
 *
 * This logs out the user and clears the MSAL cache.
 */
export async function logoutFromGraphAPI(): Promise<void> {
  const logoutRequest = {
    account: msalInstance.getActiveAccount(), // Optional: specify the account to be logged out
    postLogoutRedirectUri: process.env.MS_GRAPH_POST_LOGOUT_REDIRECT_URI, // Optional: specify where to redirect after logout
  };

  try {
    await msalInstance.logoutPopup(logoutRequest);
    await setPlatformSetting("graphAPIAccount", null);
    console.log("Successfully logged out using popup.");
  } catch (error) {
    try {
      await msalInstance.logoutRedirect(logoutRequest);
      console.log("Successfully logged out using redirect.");
    } catch (redirectError) {
      Sentry.captureMessage(`Logout using popup failed.`, "error");
    }
  }
}

/*
 * Acquires token silently for Microsoft Graph API.
 *
 * This function tries to acquire token silently first. If it fails, it falls back to acquiring token using popup.
 */
export async function getGrahpAPITokenSilently(): Promise<string | null> {
  const accounts = msalInstance.getAllAccounts();
  let userAccount = null;
  let roamingUserAccount = null;

  if (accounts.length === 0) {
    // try to get from roaming settings
    const accountString = await getPlatformSetting("graphAPIAccount");
    roamingUserAccount = accountString ? JSON.parse(accountString) : null;
    if (!roamingUserAccount) {
      return null;
    }
  }
  userAccount = accounts[0] || roamingUserAccount;

  try {
    const response = await msalInstance.acquireTokenSilent({
      scopes: ["user.read", "mail.read", "calendars.read"], // Specify scopes needed for your application
      account: userAccount,
    });
    return response.accessToken;
  } catch (error) {
    console.log("Silent token acquisition fails. Acquiring token using popup");
    if (error instanceof InteractionRequiredAuthError) {
      try {
        const loginRequest = {
          scopes: ["user.read", "mail.read", "calendars.read"], // Specify scopes needed for your application
          prompt: "select_account", // Ensures the user can select an account and complete MFA
        };
        const tokenResponse = await msalInstance.acquireTokenPopup(loginRequest);
        return tokenResponse.accessToken;
      } catch (popupError) {
        Sentry.captureMessage(`Error getting Graph API token: ${popupError}`, "error");
        return null;
      }
    } else {
      Sentry.captureMessage(`Error getting Graph API token: ${error}`, "error");
      return null;
    }
  }
}

export async function fetchMessageById(accessToken: string, messageId: string) {
  // Note: The itemId is in EWS format, so we need to convert it to a REST ID
  const graphAPIId = Office.context.mailbox.convertToRestId(messageId, Office.MailboxEnums.RestVersion.v2_0);

  const url = `https://graph.microsoft.com/v1.0/me/messages/${graphAPIId}`;
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${accessToken}`);
  headers.append("Content-Type", "application/json");

  try {
    const response = await fetch(url, { headers: headers });
    if (!response.ok) {
      throw new Error("Failed to fetch message");
    }
    const message = await response.json();
    return message;
  } catch (error) {
    console.error("Error fetching the message:", error);
  }
}

/*
 * Fetches the newest message in a conversation.
 *
 * Unfortunately, the Microsoft Graph API does not provide a way to fetch the newest message in a conversation directly.
 * The workaround is to fetch all messages in a conversation and sort them by receivedDateTime in descending order.
 *
 * Last message usually contains all messages as quited text
 */
export async function fetchNewestMessage(accessToken: string, conversationId: string, pageSize = 50) {
  let shouldContinue = true;
  let url = `https://graph.microsoft.com/v1.0/me/messages?$filter=conversationId eq '${encodeURIComponent(conversationId)}'&$top=${pageSize}`;
  const allMessages = [];
  while (shouldContinue) {
    const response = await fetch(url, {
      headers: new Headers({
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      }),
    });
    const data = await response.json();
    allMessages.push(...data.value);
    if (data["@odata.nextLink"]) {
      url = data["@odata.nextLink"]; // Go to next page
    } else {
      shouldContinue = false;
      console.log("Reached the end of messages, no more to fetch.");
    }
  }
  // @ts-ignore
  allMessages.sort((a, b) => new Date(b.receivedDateTime) - new Date(a.receivedDateTime));
  return allMessages[0];
}

/*
 * Get the conversation from the Graph API by conversation ID.
 */
export const getConversationFromGraphAPIByConversationId = async (conversationId: string): Promise<string | null> => {
  const graphAPIToken = await getGrahpAPITokenSilently();
  if (graphAPIToken) {
    // Construct the URL to access emails from a specific conversation
    const latestMessage = await fetchNewestMessage(graphAPIToken, conversationId);
    return latestMessage?.body?.content ?? "";
  } else {
    return null;
  }
};

/*
 * Get the message from the Graph API by item ID.
 */
export const getMessageFromGraphAPIByItemId = async (itemId: string): Promise<string | null> => {
  const graphAPIToken = await getGrahpAPITokenSilently();
  if (graphAPIToken) {
    const message = await fetchMessageById(graphAPIToken, itemId);
    return message?.body?.content ?? "";
  } else {
    return null;
  }
};
