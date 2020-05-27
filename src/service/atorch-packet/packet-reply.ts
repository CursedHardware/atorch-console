import { assertPacket } from './asserts';
import { MessageType, ReplyType } from './types';

export class ReplyPacket {
  public data: Buffer;

  public constructor(block: Buffer) {
    assertPacket(block, MessageType.Reply);
    this.data = Buffer.from(block.slice(0x03, -1));
    Object.freeze(this);
    Object.seal(this);
  }

  public toType() {
    const type = this.data.toString('hex') as ReplyType;
    if (Object.values(ReplyType).includes(type)) {
      return type;
    }
    return;
  }
}
