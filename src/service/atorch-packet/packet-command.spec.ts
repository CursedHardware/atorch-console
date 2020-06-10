import { assert } from "chai";
import "mocha";

import { CommandPacket } from "./packet-command";

describe("Command", () => {
  it("makeCommand", () => {
    const packet = CommandPacket.make(0x03, 0x01);
    const expected = "ff551103010000000051";
    const actual = packet.toString("hex");
    assert.equal(actual, expected);
  });

  it("make error payload: .type unexpected", () => {
    const fn = () => {
      const packet = new CommandPacket();
      packet.toBuffer();
    };
    assert.throw(fn, ".type unexpected range (expect: 0x01 to 0x03)");
  });

  it("make error payload: .data unexpected", () => {
    const fn = () => {
      const packet = new CommandPacket();
      packet.type = 0x01;
      packet.data = Buffer.alloc(7);
      packet.toBuffer();
    };
    assert.throw(fn, ".data unexpected length (expect: 5 byte)");
  });

  const expects: Record<string, string> = {
    FF551103010000000051: "0100000000", // USB Meter: Reset W·h
    FF551103020000000052: "0200000000", // USB Meter: Reset A·h
    FF551103030000000053: "0300000000", // USB Meter: Reset Duration
    FF55110305000000005D: "0500000000", // Reset All
    FF551103310000000001: "3100000000", // Setup
    FF551103320000000002: "3200000000", // Enter
    FF551103330000000003: "3300000000", // [+] Command
    FF55110334000000000C: "3400000000", // [-] Command
  };
  for (const [packet, expected] of Object.entries(expects)) {
    it(packet, () => {
      const block = Buffer.from(packet, "hex");
      const command = new CommandPacket(block);
      assert.equal(command.type, 0x03);
      assert.equal(command.data.toString("hex"), expected);
      assert.isTrue(command.toBuffer().equals(block));
    });
  }
});
