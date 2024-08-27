import { useEffect, useRef } from "react";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import Pusher, { Channel, Options } from "pusher-js/with-encryption";
import { RootState } from "../store/store";
import { useSelector, useDispatch } from "react-redux";
import { fetchToken } from "../store/actions/authAction";
import jwtDecode from "jwt-decode";
import moment from "moment";

type PusherHookOptions = {
  channelName: string;
  eventName: string;
};

export type EventResponse = {
  draft_id: string;
  request_id: string;
  frame_index: number;
  last_frame: boolean;
  content: string;
};

type PusherHookCallback = (data: any) => void;

const CLUSTER = process.env.PUSHER_CLUSTER || "";
const APP_KEY = process.env.PUSHER_KEY || "";

const usePusher = (options: PusherHookOptions, callback: PusherHookCallback, activeSubscription: boolean = true) => {
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const pusherRef = useRef<Pusher | null>(null); // Ref to store Pusher instance

  useEffect(() => {
    if (!token) {
      return;
    }

    if (!activeSubscription) {
      return;
    }

    // if token is about to expire, refresh it
    const decoded: { exp?: number } = jwtDecode(token);
    if (decoded.exp && decoded.exp - moment().unix() < 20) {
      dispatch(fetchToken());
      return;
    }

    const { channelName, eventName } = options;

    const pusherOptions: Options = {
      cluster: CLUSTER,
      // This endpoint is used to authenticate private-encrypted channels
      // Pusher will do a call to this endpoint with the channel name and socket id
      channelAuthorization: {
        endpoint: `${process.env.BACKEND_URL}auth/pusher`,
        transport: "ajax",
        headersProvider: () => ({
          Authorization: "Token " + token,
        }),
      },
    };

    if (!pusherRef.current) {
      pusherRef.current = new Pusher(APP_KEY, pusherOptions); // Create Pusher instance if it doesn't exist
    }

    const pusher = pusherRef.current;

    if (channelName) {
      const channel: Channel = pusher.subscribe(`private-encrypted-${channelName}`);

      const eventCallback = (data: any) => {
        callback(data);
      };

      channel.bind(eventName, eventCallback);

      return () => {
        channel.unbind(eventName, eventCallback);
        pusher.unsubscribe(channelName);
      };
    }

    return () => {};
  }, [options, callback, token]);
};

export default usePusher;
