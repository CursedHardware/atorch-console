import { assertMeterPacket, assertPacket } from './asserts';
import { MessageType } from './types';
import { readDuration, readUInt24BE } from './utils';

const type = 0x03;

export class USBMeterPacket {
  public readonly type = type;

  public readonly mVoltage: number;
  public readonly mAmpere: number;
  public readonly mWatt: number;
  public readonly mAh: number;
  public readonly mWh: number;
  public readonly dataP: number;
  public readonly dataN: number;
  public readonly temperature: number;
  public readonly duration: string;
  public readonly backlightTime: number;

  public constructor(block: Buffer) {
    assertPacket(block, MessageType.Report);
    assertMeterPacket(block, type, 'USB Meter');
    this.mVoltage = readUInt24BE(block, 0x04) * 10;
    this.mAmpere = readUInt24BE(block, 0x07) * 10;
    this.mWatt = Math.round((this.mVoltage * this.mAmpere) / 1000);
    this.mAh = readUInt24BE(block, 0x0a) * 10;
    this.mWh = block.readUInt32BE(0x0d) * 10;
    this.dataN = block.readUInt16BE(0x11) * 10;
    this.dataP = block.readUInt16BE(0x13) * 10;
    this.temperature = block.readInt16BE(0x15);
    this.duration = readDuration(block, 0x17);
    this.backlightTime = block[0x1b];
    Object.freeze(this);
    Object.seal(this);
  }
}
