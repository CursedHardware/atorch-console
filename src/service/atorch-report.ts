export class USBReport {
  public readonly voltage: number;
  public readonly amp: number;
  public readonly watt: number;
  public readonly mah: number;
  public readonly wh: number;
  public readonly dataP: number;
  public readonly dataN: number;
  public readonly temperature: number;
  public readonly duration: string;

  public constructor(block: Buffer) {
    const voltage = (block.readInt8(0x04) << 16) + block.readUInt16BE(0x05);
    const amp = (block.readInt8(0x07) << 16) + block.readUInt16BE(0x08);
    this.voltage = voltage / 100;
    this.amp = amp / 100;
    this.watt = (voltage * amp) / 10000;
    this.mah = (block.readInt8(0x0a) << 16) + block.readUInt16BE(0x0b);
    this.wh = block.readUInt32BE(0x0d) / 100;
    this.dataP = block.readUInt16BE(0x11) / 100;
    this.dataN = block.readUInt16BE(0x13) / 100;
    this.temperature = ((block.readInt8(0x15) << 16) + block.readUInt16BE(0x16)) / 100;
    this.duration = [block.readUInt8(0x18), block.readUInt8(0x19), block.readUInt8(0x1a)]
      .map(String)
      .map((item) => item.padStart(2, "0"))
      .join(":");
    Object.freeze(this);
    Object.seal(this);
  }

  public toString() {
    return `${this.voltage} V @ ${this.amp} A (${this.watt} W)`;
  }
}

export type ReportType = ReturnType<typeof makeReport>;

export function makeReport(block: Buffer) {
  if (block[0x03] === 0x03) {
    return new USBReport(block);
  }
}
