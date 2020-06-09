import { readPacket } from "./utils";
import { ACMeterPacket } from "./packet-meter-ac";
import { USBMeterPacket } from "./packet-meter-usb";

export type PacketType = ReturnType<typeof readPacket>;

export type MeterPacketType = ACMeterPacket | USBMeterPacket;

export enum MessageType {
  Report = 0x01,
  Reply = 0x02,
  Command = 0x11,
}

export enum ReplyType {
  OK = "01010000",
  Unsupported = "01030000",
}
