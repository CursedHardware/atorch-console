import { assert } from "chai";
import "mocha";

import { assertPacket, MessageType, readPacket, assertMeterPacket } from "./utils";
import { ACMeterPacket } from "./packet-meter-ac";
import { USBMeterPacket } from "./packet-meter-usb";
import { CommandPacket } from "./packet-command";
import { ReplyPacket } from "./packet-reply";

describe("Parser", () => {
  it("readPacket (Wrong block)", () => {
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
    it(`readPacket (${Type.name})`, () => {
      const parsed = readPacket(Buffer.from(packet, "hex"));
      assert.instanceOf(parsed, Type);
    });
  }
});

describe("Asserts", () => {
  it("assertMeterPacket", () => {
    const packet = Buffer.from("00000000", "hex");
    const fn = () => {
      assertMeterPacket(packet, 0x03, "Test Meter");
    };
    assert.throws(fn, "this is not a Test Meter data packet");
  });

  const packets: Record<string, any> = {
    "magic header not found": Buffer.from("FF000000000000000000", "hex"),
    "message type unexpected": Buffer.from("FF550000000000000000", "hex"),
    "command packet size error": Buffer.from("FF55110301000000005100", "hex"),
    "checksum unexpected": Buffer.from("FF551103010000000052", "hex"),
    "block not is Buffer object": null,
  };
  for (const [message, packet] of Object.entries(packets)) {
    it(`assertPacket (${message})`, () => {
      const fn = () => {
        assertPacket(packet, MessageType.Command);
      };
      assert.throws(fn, message);
    });
  }
});
