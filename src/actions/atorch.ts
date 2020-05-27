import actionCreatorFactory from 'typescript-fsa';
import { asyncFactory } from 'typescript-fsa-redux-thunk';
import { AtorchService } from '../service/atorch-service';
import { PacketType } from '../service/atorch-packet';

const create = actionCreatorFactory('ATORCH');
const createAsync = asyncFactory(create);

export const setConnected = create<boolean>('SET_CONNECTED');
export const updatePacket = create<PacketType>('UPDATE_PACKET');

export const connect = createAsync('CONNECT', async (params, dispatch) => {
  const device = await AtorchService.requestDevice();
  dispatch(setConnected(true));
  device.on('disconnected', () => {
    dispatch(setConnected(false));
  });
  device.on('packet', (packet) => {
    dispatch(updatePacket(packet));
  });
  await device.connect();
  return device;
});

export const disconnect = createAsync('DISCONNECT', async (params, dispatch, getState) => {
  const { atorch } = getState();
  return atorch?.disconnect();
});

export const sendCommand = createAsync('SEND_COMMAND', async (block: Buffer | undefined, dispatch, getState) => {
  if (block === undefined) {
    return;
  }
  const { atorch } = getState();
  return atorch?.sendCommand(block);
});
