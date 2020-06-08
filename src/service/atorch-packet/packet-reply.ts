import { assertPacket, MessageType, ReplyType } from "./utils";

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
