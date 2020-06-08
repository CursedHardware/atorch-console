import { assertPacket, assertMeterPacket, MessageType, readUInt24BE, readDuration } from "./utils";

export class ACMeterPacket {
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
    assertMeterPacket(block, 0x01, "AC Meter");
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
