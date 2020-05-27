import { ACMeterPacket } from './packet-meter-ac';
import { DCMeterPacket } from './packet-meter-dc';
import { USBMeterPacket } from './packet-meter-usb';
import { ReplyPacket } from './packet-reply';
import { MessageType, PacketType } from './types';
import type { MeterPacketType } from './types';

export function readPacket(block: Buffer) {
  const type = block.readUInt8(0x02);
  if (type === MessageType.Report) {
    switch (block.readUInt8(0x03)) {
      case 0x01:
        return new ACMeterPacket(block);
      case 0x02:
        return new DCMeterPacket(block);
      case 0x03:
        return new USBMeterPacket(block);
    }
  } else if (type === MessageType.Reply) {
    return new ReplyPacket(block);
  }
  return;
}

export function isMeterPacket(packet: PacketType): packet is MeterPacketType {
  return packet instanceof ACMeterPacket || packet instanceof DCMeterPacket || packet instanceof USBMeterPacket;
}

export function readUInt24BE(block: Buffer, offset: number) {
  return (block.readInt8(offset) << 16) + block.readUInt16BE(offset + 1);
}

export function readDuration(block: Buffer, offset: number) {
  const values = [
    String(block.readUInt16BE(offset)).padStart(3, '0'),
    String(block.readUInt8(offset + 2)).padStart(2, '0'),
    String(block.readUInt8(offset + 3)).padStart(2, '0'),
  ];
  return values.join(':');
}

export function makeChecksum(block: Uint8Array) {
  const checksum = block.reduce((acc, value) => (acc + value) & 0xff);
  return Buffer.of(checksum ^ 0x44);
}
