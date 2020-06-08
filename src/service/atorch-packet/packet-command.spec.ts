import { assert } from "chai";
import "mocha";

import { CommandPacket } from "./packet-command";

describe("Command", () => {
  it("make command", () => {
    CommandPacket.make(0x03, 0x01);
  });
  it("make error payload", () => {
    const packet = new CommandPacket();
    const fn = () => {
      packet.data = Buffer.alloc(7);
      packet.makePayload();
    };
    assert.throw(fn, ".data unexpected length (expect: 6 byte)");
  });
  const expects: Record<string, string> = {
    FF551103010000000051: "030100000000",
  };
  for (const [packet, expected] of Object.entries(expects)) {
    it(packet, () => {
      const block = Buffer.from(packet, "hex");
      const command = new CommandPacket(block);
      assert.equal(command.data.toString("hex"), expected);
      assert.isTrue(command.toBuffer().equals(block));
    });
  }
});
