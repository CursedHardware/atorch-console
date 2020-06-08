import { assert } from "chai";
import "mocha";

import { ACMeterPacket } from "./packet-meter-ac";
import { isMeterPacket } from "./utils";

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
      const report = new ACMeterPacket(block);
      assert.isTrue(isMeterPacket(report));
      assert.deepEqual(report, expected);
    });
  }
});
