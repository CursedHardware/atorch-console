import { assert } from "chai";
import "mocha";

import { readPacket } from "./utils";
import { ACMeterPacket } from "./packet-meter-ac";
import { USBMeterPacket } from "./packet-meter-usb";
import { CommandPacket } from "./packet-command";
import { ReplyPacket } from "./packet-reply";

describe("Parser", () => {
  it("readPacket: Wrong block", () => {
    const packet = readPacket(Buffer.alloc(10));
    assert.isUndefined(packet);
  });
  const packets: Record<string, any> = {
    FF55010100090400000E0000040000000000006401F40085002F00000A093C0000000039: ACMeterPacket,
    FF5501030001F3000000000638000003110007000A000000122E333C000000000000004E: USBMeterPacket,
    FF551103010000000051: CommandPacket,
    FF55020000000046: ReplyPacket,
  };
  for (const [packet, Type] of Object.entries(packets)) {
    it(`readPacket: ${Type.name}`, () => {
      const parsed = readPacket(Buffer.from(packet, "hex"));
      assert.instanceOf(parsed, Type);
    });
  }
});
