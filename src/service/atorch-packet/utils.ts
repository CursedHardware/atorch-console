import { ACMeterPacket } from "./packet-meter-ac";
import { USBMeterPacket } from "./packet-meter-usb";
import { ReplyPacket } from "./packet-reply";
import { CommandPacket } from "./packet-command";

export const HEADER = Buffer.of(0xff, 0x55);

export enum MessageType {
  Report = 0x01,
  Reply = 0x02,
  Command = 0x11,
}

export enum ReplyType {
  OK = "01010000",
}

export type PacketType = ReturnType<typeof readPacket>;

export type MeterPacketType = ACMeterPacket | USBMeterPacket;

export function readPacket(block: Buffer) {
  const type = block.readUInt8(0x02);
  if (type === MessageType.Report) {
    switch (block.readUInt8(0x03)) {
      case 0x01:
        return new ACMeterPacket(block);
      case 0x03:
        return new USBMeterPacket(block);
    }
  } else if (type === MessageType.Reply) {
    return new ReplyPacket(block);
  } else if (type === MessageType.Command) {
    return new CommandPacket(block);
  }
  return;
}

export function isMeterPacket(packet: PacketType): packet is MeterPacketType {
  return packet instanceof ACMeterPacket || packet instanceof USBMeterPacket;
}

export function assertPacket(block: Buffer, type: MessageType): asserts block is Buffer {
  const sizes: Record<MessageType, number> = {
    [MessageType.Report]: 36,
    [MessageType.Reply]: 8,
    [MessageType.Command]: 10,
  };
  if (!Buffer.isBuffer(block)) {
    throw new Error("block not is Buffer object");
  } else if (block.indexOf(HEADER) !== 0) {
    throw new Error("magic header not found");
  } else if (block.readInt8(0x02) !== type) {
    throw new Error(`message type unexpected (expected: 0x${type.toString(16)})`);
  } else if (block.length !== sizes[type]) {
    throw new Error(`command packet size error (expected: 0x${sizes[type].toString(16)})`);
  } else if (block.readUInt8(block.length - 1) !== getChecksum(block.slice(2, -1))) {
    throw new Error(`checksum unexpected (expected: 0x${getChecksum(block.slice(2, -1)).toString(16)})`);
  }
}

export function assertMeterPacket(block: Buffer, type: number, name: string): asserts block is Buffer {
  if (block.readUInt8(0x03) !== type) {
    throw new Error(`this is not a ${name} data packet`);
  }
}

export function readUInt24BE(block: Buffer, offset: number) {
  return (block.readInt8(offset) << 16) + block.readUInt16BE(offset + 1);
}

export function readDuration(block: Buffer, offset: number) {
  const values = [block.readUInt8(offset), block.readUInt8(offset + 1), block.readUInt8(offset + 2)];
  return values.map((value) => value.toString().padStart(2, "0")).join(":");
}

export function getChecksum(block: Uint8Array) {
  const checksum = block.reduce((acc, value) => (acc + value) & 0xff);
  return checksum ^ 0x44;
}
