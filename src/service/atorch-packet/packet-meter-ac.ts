import { CommandPacket } from "./packet-command";
import { readUInt24BE, readDuration } from "./utils";
import { assertPacket, assertMeterPacket } from "./asserts";
import { MessageType } from "./types";

const type = 0x01;

export class ACMeterPacket {
  public static makeCommand(code: number) {
    return CommandPacket.make(type, code);
  }

  public readonly mVoltage: number;
  public readonly mAmpere: number;
  public readonly mWatt: number;
  public readonly mWh: number;
  public readonly price: number;
  public readonly fee: number;
  public readonly frequency: number;
  public readonly pf: number;
  public readonly temperature: number;
  public readonly duration: string;

  public constructor(block: Buffer) {
    assertPacket(block, MessageType.Report);
    assertMeterPacket(block, type, "AC Meter");
    this.mVoltage = readUInt24BE(block, 0x04) * 100;
    this.mAmpere = readUInt24BE(block, 0x07);
    this.mWatt = readUInt24BE(block, 0x0a) * 100;
    this.mWh = block.readUInt32BE(0x0d) * 10000;
    this.price = readUInt24BE(block, 0x11);
    this.fee = (this.mWh * this.price) / 1000000;
    this.frequency = block.readUInt16BE(0x14) / 10;
    this.pf = block.readUInt16BE(0x16) / 1000;
    this.temperature = block.readUInt16BE(0x18);
    this.duration = readDuration(block, 0x1a);
    Object.freeze(this);
    Object.seal(this);
  }
}
