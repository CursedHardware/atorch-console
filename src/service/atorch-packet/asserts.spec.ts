import { assert } from 'chai';
import 'mocha';
import { assertMeterPacket, assertPacket } from './asserts';
import { MessageType } from './types';

describe('Asserts', () => {
  it('assertMeterPacket', () => {
    const packet = Buffer.from('00000000', 'hex');
    const fn = () => {
      assertMeterPacket(packet, 0x03, 'Test Meter');
    };
    assert.throws(fn, 'this is not a Test Meter data packet');
  });

  const packets: Record<string, Buffer | null> = {
    'block not is Buffer object': null,
    'magic header not found': Buffer.from('FF000000000000000000', 'hex'),
    'message type unexpected': Buffer.from('FF550000000000000000', 'hex'),
    'command packet size error': Buffer.from('FF55110301000000005100', 'hex'),
    'checksum unexpected': Buffer.from('FF551103010000000052', 'hex'),
  };
  for (const [message, packet] of Object.entries(packets)) {
    it(`assertPacket: ${message}`, () => {
      const fn = () => {
        assertPacket(packet, MessageType.Command);
      };
      assert.throw(fn, message);
    });
  }
});
