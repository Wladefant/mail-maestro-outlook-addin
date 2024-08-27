import axios from "axios";
import * as Sentry from "@sentry/browser";
import moment from "moment/moment";

export const exchangeToken = async (platformToken: string, name?: string, email?: string) => {
  const url = `${process.env.BACKEND_URL}auth/signin-eit`;
  const timezone = moment.tz.guess();
  const data = {
    EIT: platformToken,
    email,
    name,
    timezone,
  };
  try {
    const result = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return result.data;
  } catch (error) {
    Sentry.captureException(error);
    return error;
  }
};
