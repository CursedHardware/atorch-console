export class ACReport {
  public readonly mVoltage: number;
  public readonly mAmpere: number;
  public readonly mWatt: number;
  public readonly frequency: number;
  public readonly pf: number;
  public readonly temperature: number;
  public readonly duration: string;

  public constructor(block: Buffer) {
    this.mVoltage = readUInt24BE(block, 0x04) * 100;
    this.mAmpere = readUInt24BE(block, 0x07) * 10;
    this.mWatt = readUInt24BE(block, 0x0a) * 100;
    this.frequency = block.readUInt16BE(0x14) / 100;
    this.pf = block.readUInt16BE(0x16) / 1000;
    this.temperature = block.readUInt16BE(0x18) / 100;
    this.duration = this.formatDuration(block.readUInt32BE(0x1a));
    Object.freeze(this);
    Object.seal(this);
  }

  public toString() {
    return `${this.mVoltage / 1000} V @ ${this.mAmpere / 1000} A`;
  }

  private formatDuration(input: number) {
    const hours = Math.floor(input / 3600);
    const minutes = Math.floor((input - hours * 3600) / 60);
    const seconds = input - hours * 3600 - minutes * 60;
    return [hours, minutes, seconds].map((item) => String(item).padStart(2, "0")).join(":");
  }
}

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
    this.mVoltage = readUInt24BE(block, 0x04) * 10;
    this.mAmpere = readUInt24BE(block, 0x07) * 10;
    this.mWatt = Math.round((this.mVoltage * this.mAmpere) / 1000);
    this.mAh = readUInt24BE(block, 0x0a) * 10;
    this.mWh = block.readUInt32BE(0x0d) * 10;
    this.dataN = block.readUInt16BE(0x11) * 10;
    this.dataP = block.readUInt16BE(0x13) * 10;
    this.temperature = readUInt24BE(block, 0x15) / 100;
    this.duration = [block.readUInt8(0x18), block.readUInt8(0x19), block.readUInt8(0x1a)]
      .map(String)
      .map((item) => item.padStart(2, "0"))
      .join(":");
    Object.freeze(this);
    Object.seal(this);
  }

  public toString() {
    return `${this.mVoltage / 1000} V @ ${this.mAmpere / 1000} A`;
  }
}

export type ReportType = ReturnType<typeof makeReport>;

export function makeReport(block: Buffer) {
  const type = block.readUInt8(0x03);
  switch (type) {
    case 0x01:
      return new ACReport(block);
    case 0x03:
      return new USBReport(block);
  }
}

function readUInt24BE(block: Buffer, offset: number) {
  return (block.readInt8(offset) << 16) + block.readUInt16BE(offset + 1);
}
