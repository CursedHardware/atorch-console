import actionCreatorFactory from "typescript-fsa";
import { asyncFactory } from "typescript-fsa-redux-thunk";

import { AtorchService } from "../service/atorch-service";
import { RootState } from "../reducers";
import { gtag } from "../tracker";

const create = actionCreatorFactory("ATORCH");
const createAsync = asyncFactory<RootState>(create);

export const requestDevice = createAsync("REQUEST_DEVICE", async () => {
  try {
    gtag("event", "request-device");
    return await AtorchService.requestDevice();
  } catch (err) {
    gtag("event", "exception", {
      description: err,
      fatal: false,
    });
    throw err;
  }
});

export const connect = createAsync(
  "CONNECT",
  async (params, dispatch, getState) => {
    const { atorch } = getState();
    try {
      gtag("event", "connect");
      return await atorch?.connect();
    } catch (err) {
      gtag("event", "exception", {
        description: err,
        fatal: false,
      });
      throw err;
    }
  },
);

export const disconnect = createAsync(
  "DISCONNECT",
  async (params, dispatch, getState) => {
    const { atorch } = getState();
    try {
      gtag("event", "disconnect");
      return await atorch?.disconnect();
    } catch (err) {
      gtag("event", "exception", {
        description: err,
        fatal: false,
      });
      throw err;
    }
  },
);

export const sendCommand = createAsync(
  "SEND_COMMAND",
  async (block: Buffer, dispatch, getState) => {
    const { atorch } = getState();
    try {
      gtag("event", "send-command", {
        block: block.toString("hex"),
      });
      return await atorch?.sendCommand(block);
    } catch (err) {
      gtag("event", "exception", {
        description: err,
        fatal: false,
      });
      throw err;
    }
  },
);
