import { assert } from 'chai';
import 'mocha';
import { ACMeterPacket } from './packet-meter-ac';
import { DCMeterPacket } from './packet-meter-dc';
import { USBMeterPacket } from './packet-meter-usb';
import { ReplyPacket } from './packet-reply';
import { readPacket } from './utils';

describe('Parser', () => {
  it('readPacket: Wrong block', () => {
    const packet = readPacket(Buffer.alloc(10));
    assert.isUndefined(packet);
  });
  const packets: Record<string, NewableFunction> = {
    FF55010100090400000E0000040000000000006401F40085002F00000A093C0000000039: ACMeterPacket,
    FF55010200011A0000000004D40000002000006400000000002A00590E343C000000003F: DCMeterPacket,
    FF5501030001F3000000000638000003110007000A000000122E333C000000000000004E: USBMeterPacket,
    FF55020000000046: ReplyPacket,
  };
  for (const [packet, Type] of Object.entries(packets)) {
    it(`readPacket: ${Type.name}`, () => {
      const parsed = readPacket(Buffer.from(packet, 'hex'));
      assert.instanceOf(parsed, Type);
    });
  }
});
