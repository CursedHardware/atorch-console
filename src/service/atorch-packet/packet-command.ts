import { assertPacket, MessageType, HEADER, getChecksum } from "./utils";

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
