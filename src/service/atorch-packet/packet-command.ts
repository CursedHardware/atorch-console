import _ from "lodash";
import { MessageType } from "./types";
import { assertPacket, HEADER } from "./asserts";
import { makeChecksum } from "./utils";

export class CommandPacket {
  public static make(type: number, code: number) {
    const packet = new CommandPacket();
    packet.type = type;
    packet.data.writeUInt8(code, 0);
    return packet.toBuffer();
  }

  public type = 0;
  public data = Buffer.alloc(5);

  public constructor(block?: Buffer) {
    if (block === undefined) {
      return;
    }
    assertPacket(block, MessageType.Command);
    this.type = block.readInt8(0x03);
    this.data = Buffer.from(block.slice(0x04, -1));
  }

  private makePayload() {
    if (!_.inRange(this.type, 0x01, 0x04)) {
      throw new Error(".type unexpected range (expect: 0x01 to 0x03)");
    } else if (this.data.length !== 5) {
      throw new Error(".data unexpected length (expect: 5 byte)");
    }
    return Buffer.concat([
      Buffer.of(MessageType.Command, this.type),
      this.data,
    ]);
  }

  public toBuffer() {
    const payload = this.makePayload();
    return Buffer.concat([HEADER, payload, makeChecksum(payload)]);
  }
}
