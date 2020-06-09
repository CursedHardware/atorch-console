import { assert } from "chai";
import "mocha";

import { USBMeterPacket } from "./packet-meter-usb";
import { isMeterPacket } from "./utils";

describe("USB Meter", () => {
  it("makeCommand", () => {
    const packet = USBMeterPacket.makeCommand(0x01);
    const expected = "ff551103010000000051";
    assert.equal(packet.toString("hex"), expected);
  });

  const expects: Record<
    string,
    Omit<InstanceType<typeof USBMeterPacket>, "makeCommand">
  > = {
    FF5501030001F3000000000638000003110007000A000000122E333C000000000000004E: {
      mVoltage: 4990,
      mAmpere: 0,
      mWatt: 0,
      mAh: 15920,
      mWh: 7850,
      dataN: 70,
      dataP: 100,
      temperature: 0,
      duration: "018:46:51",
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
      duration: "071:47:36",
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
      duration: "071:48:13",
    },
  };
  for (const [packet, expected] of Object.entries(expects)) {
    it(packet, () => {
      const block = Buffer.from(packet, "hex");
      const report = new USBMeterPacket(block);
      assert.isTrue(isMeterPacket(report));
      assert.deepEqual(report, expected);
    });
  }
});
