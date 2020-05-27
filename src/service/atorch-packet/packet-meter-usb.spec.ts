import { assert, use } from 'chai';
import chaiBytes from 'chai-bytes';
import 'mocha';
import { USBMeterPacket } from './packet-meter-usb';
import { isMeterPacket } from './utils';

use(chaiBytes);

describe('USB Meter', () => {
  const entries: Record<string, InstanceType<typeof USBMeterPacket>> = {
    FF5501030001F3000000000638000003110007000A000000122E333C000000000000004E: {
      type: 3,
      mVoltage: 4990,
      mAmpere: 0,
      mWatt: 0,
      mAh: 15920,
      mWh: 7850,
      dataN: 70,
      dataP: 100,
      temperature: 0,
      duration: '018:46:51',
      backlightTime: 60,
    },
    FF5501030001FB000000003CC70000554E00070007000000472F243C00000000000000CE: {
      type: 3,
      mVoltage: 5070,
      mAmpere: 0,
      mWatt: 0,
      mAh: 155590,
      mWh: 218380,
      dataN: 70,
      dataP: 70,
      temperature: 0,
      duration: '071:47:36',
      backlightTime: 60,
    },
    FF5501030001CD00007F003CC80000554E0009000A00000047300D3C000000000000008F: {
      type: 3,
      mVoltage: 4610,
      mAmpere: 1270,
      mWatt: 5855,
      mAh: 155600,
      mWh: 218380,
      dataN: 90,
      dataP: 100,
      temperature: 0,
      duration: '071:48:13',
      backlightTime: 60,
    },
    FF5501030001FB000001006C3F00006C4400070006001A00471C1A3C0000000000000078: {
      type: 3,
      mVoltage: 5070,
      mAmpere: 10,
      mWatt: 51,
      mAh: 277110,
      mWh: 277160,
      dataN: 70,
      dataP: 60,
      temperature: 26,
      duration: '071:28:26',
      backlightTime: 60,
    },
  };
  for (const [packet, expected] of Object.entries(entries)) {
    it(packet, () => {
      const block = Buffer.from(packet, 'hex');
      const report = new USBMeterPacket(block);
      assert.isTrue(isMeterPacket(report));
      assert.deepEqual(expected, report);
    });
  }
});
