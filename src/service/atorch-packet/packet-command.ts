import _ from 'lodash-es';
import { HEADER } from './asserts';
import { MessageType } from './types';
import { makeChecksum } from './utils';

function makeCommandPacket(type: number, code: number, value = 0) {
  const payload = Buffer.alloc(7);
  payload.writeUInt8(MessageType.Command, 0);
  payload.writeUInt8(type, 1);
  payload.writeUInt8(code, 2);
  payload.writeUInt32BE(value, 3);
  return Buffer.concat([HEADER, payload, makeChecksum(payload)]);
}

export default {
  resetWh(type: number) {
    return makeCommandPacket(type, 0x01);
  },
  resetAh(type: number) {
    return makeCommandPacket(type, 0x02);
  },
  resetDuration(type: number) {
    return makeCommandPacket(type, 0x03);
  },
  resetAll(type: number) {
    return makeCommandPacket(type, 0x05);
  },
  setBacklightTime(type: number, time: number) {
    return makeCommandPacket(type, 0x21, _.clamp(time, 0, 60));
  },
  setPrice(type: number, price: number) {
    return makeCommandPacket(type, 0x22, _.clamp(price, 1, 999999));
  },
  setPlus(type: number) {
    return makeCommandPacket(type, type !== 3 ? 0x11 : 0x33);
  },
  setMinus(type: number) {
    return makeCommandPacket(type, type !== 3 ? 0x12 : 0x34);
  },
  setup(type: number) {
    return makeCommandPacket(type, 0x31);
  },
  enter(type: number) {
    return makeCommandPacket(type, 0x32);
  },
};
