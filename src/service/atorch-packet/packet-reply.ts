import { MessageType, ReplyType } from "./types";
import { assertPacket } from "./asserts";

export class ReplyPacket {
  public data: Buffer;

  public constructor(block: Buffer) {
    assertPacket(block, MessageType.Reply);
    this.data = Buffer.from(block.slice(3, -1));
    Object.freeze(this);
    Object.seal(this);
  }

  public toType(): ReplyType | undefined {
    const blocks = Object.values(ReplyType) as ReplyType[];
    for (const block of blocks) {
      if (!Buffer.from(block, "hex").equals(this.data)) {
        continue;
      }
      return block;
    }
    return;
  }
}
