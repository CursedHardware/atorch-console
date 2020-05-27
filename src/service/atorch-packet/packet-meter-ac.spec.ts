import { assert, use } from 'chai';
import chaiBytes from 'chai-bytes';
import 'mocha';
import { ACMeterPacket } from './packet-meter-ac';
import { isMeterPacket } from './utils';

use(chaiBytes);

describe('AC Meter', () => {
  const entries: Record<string, InstanceType<typeof ACMeterPacket>> = {
    FF55010100090400000E0000040000000000006401F40085002F00000A093C0000000039: {
      type: 1,
      mVoltage: 230800,
      mAmpere: 14,
      mWatt: 400,
      mWh: 0,
      price: 1,
      fee: 0,
      frequency: 50,
      pf: 0.133,
      temperature: 47,
      duration: '000:10:09',
      backlightTime: 60,
    },
    FF5501010008EB000000000000000001FE00006401F40000002F003125143C0000000066: {
      type: 1,
      mVoltage: 228300,
      mAmpere: 0,
      mWatt: 0,
      mWh: 5100000,
      price: 1,
      fee: 5.1,
      frequency: 50,
      pf: 0,
      temperature: 47,
      duration: '049:37:20',
      backlightTime: 60,
    },
    FF5501010008FF0000270000210000000000006401F401740031000038083C0000000088: {
      type: 1,
      mVoltage: 230300,
      mAmpere: 39,
      mWatt: 3300,
      mWh: 0,
      price: 1,
      fee: 0,
      frequency: 50,
      pf: 0.372,
      temperature: 49,
      duration: '000:56:08',
      backlightTime: 60,
    },
  };
  for (const [packet, expected] of Object.entries(entries)) {
    it(packet, () => {
      const block = Buffer.from(packet, 'hex');
      const report = new ACMeterPacket(block);
      assert.isTrue(isMeterPacket(report));
      assert.deepEqual(expected, report);
    });
  }
});
