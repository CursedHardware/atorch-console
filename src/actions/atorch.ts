import actionCreatorFactory from "typescript-fsa";
import { asyncFactory } from "typescript-fsa-redux-thunk";

import { AtorchService, CommandType } from "../service/atorch-service";
import { RootState } from "../reducers";

const create = actionCreatorFactory("ATORCH");
const createAsync = asyncFactory<RootState>(create);

export const requestDevice = createAsync("REQUEST_DEVICE", AtorchService.requestDevice);

export const connect = createAsync("CONNECT", (params, dispatch, getState) => {
  const { atorch } = getState();
  return atorch?.connect();
});

export const disconnect = createAsync("DISCONNECT", (params, dispatch, getState) => {
  const { atorch } = getState();
  return atorch?.disconnect();
});

export const sendCommand = createAsync("SEND_COMMAND", (type: CommandType, dispatch, getState) => {
  const { atorch } = getState();
  return atorch?.sendCommand(type);
});
