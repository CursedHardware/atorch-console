import { assert } from "chai";
import "mocha";

import {
  ACMeterPacket,
  USBMeterPacket,
  CommandPacket,
  ReplyPacket,
  ReplyType,
  assertPacket,
  MessageType,
  isMeterPacket,
  readPacket,
  assertMeterPacket,
} from "./atorch-packet";

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
      const command = readPacket(block) as CommandPacket;
      assert.equal(command.data.toString("hex"), expected);
      assert.isTrue(command.toBuffer().equals(block));
    });
  }
});

describe("Reply", () => {
  it("parse reply (unsupported)", () => {
    const block = Buffer.from("FF55020000000046", "hex");
    const command = new ReplyPacket(block);
    assert.isUndefined(command.toType());
  });
  const expects: Record<string, ReplyType> = {
    FF55020101000040: ReplyType.OK,
  };
  for (const [packet, expected] of Object.entries(expects)) {
    it(packet, () => {
      const block = Buffer.from(packet, "hex");
      const command = readPacket(block) as ReplyPacket;
      assert.equal(command.toType(), expected);
    });
  }
});

describe("AC Meter", () => {
  const expects: Record<string, InstanceType<typeof ACMeterPacket>> = {
    FF55010100090400000E0000040000000000006401F40085002F00000A093C0000000039: {
      mVoltage: 230800,
      mAmpere: 14,
      mWatt: 400,
      mWh: 0,
      price: 100,
      fee: 0,
      frequency: 50,
      pf: 0.133,
      temperature: 47,
      duration: "00:00:10",
    },
    FF5501010008FF0000270000210000000000006401F401740031000038083C0000000088: {
      mVoltage: 230300,
      mAmpere: 39,
      mWatt: 3300,
      mWh: 0,
      price: 100,
      fee: 0,
      frequency: 50,
      pf: 0.372,
      temperature: 49,
      duration: "00:00:56",
    },
    FF5501010008EB000000000000000001FE00006401F40000002F003125143C0000000066: {
      mVoltage: 228300,
      mAmpere: 0,
      mWatt: 0,
      mWh: 5100000,
      price: 100,
      fee: 510,
      frequency: 50,
      pf: 0,
      temperature: 47,
      duration: "00:49:37",
    },
  };
  for (const [packet, expected] of Object.entries(expects)) {
    it(packet, () => {
      const block = Buffer.from(packet, "hex");
      const report = readPacket(block) as ACMeterPacket;
      assert.isTrue(isMeterPacket(report));
      assert.deepEqual(report, expected);
    });
  }
});

describe("USB Meter", () => {
  const expects: Record<string, InstanceType<typeof USBMeterPacket>> = {
    FF5501030001F3000000000638000003110007000A000000122E333C000000000000004E: {
      mVoltage: 4990,
      mAmpere: 0,
      mWatt: 0,
      mAh: 15920,
      mWh: 7850,
      dataN: 70,
      dataP: 100,
      temperature: 0,
      duration: "18:46:51",
    },
    FF5501030001FB000000003CC70000554E00070007000000472F243C00000000000000CE: {
      mVoltage: 5070,
      mAmpere: 0,
      mWatt: 0,
      mAh: 155590,
      mWh: 218380,
      dataN: 70,
      dataP: 70,
      temperature: 0,
      duration: "71:47:36",
    },
    FF5501030001CD00007F003CC80000554E0009000A00000047300D3C000000000000008F: {
      mVoltage: 4610,
      mAmpere: 1270,
      mWatt: 5855,
      mAh: 155600,
      mWh: 218380,
      dataN: 90,
      dataP: 100,
      temperature: 0,
      duration: "71:48:13",
    },
  };
  for (const [packet, expected] of Object.entries(expects)) {
    it(packet, () => {
      const block = Buffer.from(packet, "hex");
      const report = readPacket(block) as USBMeterPacket;
      assert.isTrue(isMeterPacket(report));
      assert.deepEqual(report, expected);
    });
  }
});

describe("Assert Packet", () => {
  it("read packet (unsupported)", () => {
    const packet = readPacket(Buffer.alloc(10));
    assert.isUndefined(packet);
  });
  const packets: Record<string, any> = {
    "magic header not found": Buffer.from("FF000000000000000000", "hex"),
    "message type unexpected": Buffer.from("FF550000000000000000", "hex"),
    "command packet size error": Buffer.from("FF55110301000000005100", "hex"),
    "checksum unexpected": Buffer.from("FF551103010000000052", "hex"),
    "block not is Buffer object": null,
  };

  for (const [message, packet] of Object.entries(packets)) {
    it(`unavailable packet: ${message}`, () => {
      const fn = () => {
        assertPacket(packet, MessageType.Command);
      };
      assert.throws(fn, message);
    });
  }
  it("assert meter packet", () => {
    const packet = Buffer.from("00000000", "hex");
    const fn = () => {
      assertMeterPacket(packet, 0x03, "Test Meter");
    };
    assert.throws(fn, "this is not a Test Meter data packet");
  });
});
