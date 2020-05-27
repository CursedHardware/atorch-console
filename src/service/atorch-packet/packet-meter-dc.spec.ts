import { assert, use } from 'chai';
import chaiBytes from 'chai-bytes';
import 'mocha';
import { DCMeterPacket } from './packet-meter-dc';
import { isMeterPacket } from './utils';

use(chaiBytes);

describe('DC Meter', () => {
  const entries: Record<string, InstanceType<typeof DCMeterPacket>> = {
    FF55010200011A00003C0004D40000002000006400000000002600590D363C00000000F0: {
      type: 2,
      mVoltage: 28200,
      mAmpere: 60,
      mWatt: 1692,
      mWh: 3164160,
      price: 1,
      fee: 3.16416,
      temperature: 38,
      duration: '089:13:54',
      backlightTime: 60,
    },
    FF55010200011A0000000004D40000002000006400000000002A00590E343C000000003F: {
      type: 2,
      mVoltage: 28200,
      mAmpere: 0,
      mWatt: 0,
      mWh: 3164160,
      price: 1,
      fee: 3.16416,
      temperature: 42,
      duration: '089:14:52',
      backlightTime: 60,
    },
  };
  for (const [packet, expected] of Object.entries(entries)) {
    it(packet, () => {
      const block = Buffer.from(packet, 'hex');
      const report = new DCMeterPacket(block);
      assert.isTrue(isMeterPacket(report));
      assert.deepEqual(expected, report);
    });
  }
});
