import { assert } from "chai";
import "mocha";

import { ReplyType } from "./types";
import { ReplyPacket } from "./packet-reply";

describe("Reply", () => {
  it("Parse wrong reply", () => {
    const block = Buffer.from("FF55020000000046", "hex");
    const command = new ReplyPacket(block);
    assert.isUndefined(command.toType());
  });

  const expects: Record<string, ReplyType> = {
    FF55020101000040: ReplyType.OK,
    FF55020103000042: ReplyType.Unsupported,
  };
  for (const [packet, expected] of Object.entries(expects)) {
    it(packet, () => {
      const block = Buffer.from(packet, "hex");
      const command = new ReplyPacket(block);
      assert.equal(command.toType(), expected);
    });
  }
});
