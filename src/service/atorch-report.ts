export class USBReport {
  public readonly mVoltage: number;
  public readonly mAmpere: number;
  public readonly mWatt: number;
  public readonly mAh: number;
  public readonly mWh: number;
  public readonly dataP: number;
  public readonly dataN: number;
  public readonly temperature: number;
  public readonly duration: string;

  public constructor(block: Buffer) {
    this.mVoltage = readUInt24BE(block, 0x04);
    this.mAmpere = readUInt24BE(block, 0x07);
    this.mWatt = (this.mVoltage * this.mAmpere) / 100;
    this.mAh = readUInt24BE(block, 0x0a);
    this.mWh = block.readUInt32BE(0x0d);
    this.dataP = block.readUInt16BE(0x11);
    this.dataN = block.readUInt16BE(0x13);
    this.temperature = readUInt24BE(block, 0x15) / 100;
    this.duration = [block.readUInt8(0x18), block.readUInt8(0x19), block.readUInt8(0x1a)]
      .map(String)
      .map((item) => item.padStart(2, "0"))
      .join(":");
    Object.freeze(this);
    Object.seal(this);
  }

  public toString() {
    return `${this.mVoltage / 100} V @ ${this.mAmpere / 100} A`;
  }
}

export type ReportType = ReturnType<typeof makeReport>;

export function makeReport(block: Buffer) {
  if (block.readUInt8(0x03) === 0x03) {
    return new USBReport(block);
  }
}

function readUInt24BE(block: Buffer, offset: number) {
  return (block.readInt8(offset) << 16) + block.readUInt16BE(offset + 1);
}
