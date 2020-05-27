import { MessageType } from './types';
import { makeChecksum } from './utils';

export const HEADER = Buffer.of(0xff, 0x55);

const packetSize: Record<MessageType, number> = {
  [MessageType.Report]: 36,
  [MessageType.Reply]: 8,
  [MessageType.Command]: 10,
};

export function assertPacket(block: Buffer | null, type: MessageType): asserts block is Buffer {
  const length = packetSize[type];
  if (!Buffer.isBuffer(block)) {
    throw new Error('block not is Buffer object');
  } else if (block.indexOf(HEADER) !== 0) {
    throw new Error('magic header not found');
  } else if (block.readInt8(0x02) !== type) {
    throw new Error(`message type unexpected (expected: ${type})`);
  } else if (block.length !== length) {
    throw new Error(`command packet size error (expected: ${length})`);
  } else if (!makeChecksum(block.slice(2, -1)).equals(block.slice(-1))) {
    throw new Error(`checksum unexpected`);
  }
}

export function assertMeterPacket(block: Buffer, type: number, name: string): asserts block is Buffer {
  if (block.readUInt8(0x03) !== type) {
    throw new Error(`this is not a ${name} data packet`);
  }
}
