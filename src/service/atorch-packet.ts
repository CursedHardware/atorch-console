import _ from "lodash";

export const HEADER = Buffer.of(0xff, 0x55);

export enum MessageType {
  Report = 0x01,
  Reply = 0x02,
  Command = 0x11,
}

export enum ReplyType {
  OK = "01010000",
}

export class CommandPacket {
  public static make(type: number, code: number) {
    const packet = new CommandPacket();
    packet.data.set([type, code], 0);
    return packet.toBuffer();
  }

  public data = Buffer.alloc(6);

  public constructor(block?: Buffer) {
    if (block !== undefined) {
      assertPacket(block, MessageType.Command);
      this.data = Buffer.from(block.slice(3, -1));
    }
  }

  public makePayload() {
    if (this.data.length !== 6) {
      throw new Error(".data unexpected length (expect: 6 byte)");
    }
    return Buffer.of(MessageType.Command, ...this.data);
  }

  public toBuffer() {
    const payload = this.makePayload();
    return Buffer.concat([HEADER, payload, Buffer.of(getChecksum(payload))]);
  }
}

export class ReplyPacket {
  public data: Buffer;

  public constructor(block: Buffer) {
    assertPacket(block, MessageType.Reply);
    this.data = Buffer.from(block.slice(3, -1));
    Object.freeze(this);
    Object.seal(this);
  }

  public toType(): ReplyType | undefined {
    const types = [ReplyType.OK];
    for (const type of types) {
      if (!Buffer.from(type, "hex").equals(this.data)) {
        continue;
      }
      return type;
    }
    return;
  }
}

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

export class USBMeterPacket {
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
    assertPacket(block, MessageType.Report);
    assertMeterPacket(block, 0x03, "USB Meter");
    this.mVoltage = readUInt24BE(block, 0x04) * 10;
    this.mAmpere = readUInt24BE(block, 0x07) * 10;
    this.mWatt = Math.round((this.mVoltage * this.mAmpere) / 1000);
    this.mAh = readUInt24BE(block, 0x0a) * 10;
    this.mWh = block.readUInt32BE(0x0d) * 10;
    this.dataN = block.readUInt16BE(0x11) * 10;
    this.dataP = block.readUInt16BE(0x13) * 10;
    this.temperature = block.readUInt16BE(0x15);
    this.duration = readDuration(block, 0x18);
    Object.freeze(this);
    Object.seal(this);
  }
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

function readUInt24BE(block: Buffer, offset: number) {
  return (block.readInt8(offset) << 16) + block.readUInt16BE(offset + 1);
}

function readDuration(block: Buffer, offset: number) {
  const values = [block.readUInt8(offset), block.readUInt8(offset + 1), block.readUInt8(offset + 2)];
  return values.map((value) => value.toString().padStart(2, "0")).join(":");
}

function getChecksum(block: Uint8Array) {
  const checksum = block.reduce((acc, value) => (acc + value) & 0xff);
  return checksum ^ 0x44;
}
